import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FloatingTabBar } from '../src/components/FloatingTabBar';
import { HabitMetric, WeeklyReport } from '../src/core/types';
import { useHabitStore } from '../src/store/useHabitStore';

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function MetricCard({ metric, onViewHabit }: { metric: HabitMetric; onViewHabit: () => void }) {
    const getTrendIcon = () => {
        switch (metric.trend) {
            case 'improving': return { icon: 'trending-up', color: '#6366F1' };
            case 'declining': return { icon: 'trending-down', color: '#A855F7' };
            default: return { icon: 'remove', color: '#6b7280' };
        }
    };
    const trend = getTrendIcon();

    return (
        <TouchableOpacity onPress={onViewHabit} style={{ backgroundColor: '#111', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: metric.isAtRisk ? 2 : 1, borderColor: metric.isAtRisk ? '#A855F7' : '#222' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <View style={{ flex: 1 }}>
                    <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>{metric.habitName}</Text>
                    {metric.isAtRisk && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                            <Ionicons name="warning" size={12} color="#A855F7" />
                            <Text style={{ color: '#A855F7', fontSize: 11, marginLeft: 4 }}>At Risk</Text>
                        </View>
                    )}
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ color: metric.successRate >= 70 ? '#6366F1' : metric.successRate >= 40 ? '#FFD700' : '#A855F7', fontSize: 24, fontWeight: 'bold' }}>{metric.successRate}%</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name={trend.icon as any} size={14} color={trend.color} />
                        <Text style={{ color: trend.color, fontSize: 11, marginLeft: 4 }}>{metric.trend}</Text>
                    </View>
                </View>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ alignItems: 'center' }}>
                    <Text style={{ color: '#6366F1', fontSize: 18, fontWeight: 'bold' }}>{metric.completions}</Text>
                    <Text style={{ color: '#6b7280', fontSize: 10 }}>COMPLETED</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                    <Text style={{ color: '#A855F7', fontSize: 18, fontWeight: 'bold' }}>{metric.missed}</Text>
                    <Text style={{ color: '#6b7280', fontSize: 10 }}>MISSED</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                    <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>{metric.stabilityScore}</Text>
                    <Text style={{ color: '#6b7280', fontSize: 10 }}>STABILITY</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
}

function SuggestionCard({ suggestion, onApply, onDismiss }: { suggestion: any; onApply: () => void; onDismiss: () => void }) {
    return (
        <View style={{ backgroundColor: '#111', borderRadius: 16, padding: 16, marginBottom: 12, borderLeftWidth: 3, borderLeftColor: '#6366F1' }}>
            <Text style={{ color: 'white', fontSize: 14, marginBottom: 8 }}>{suggestion.reason}</Text>
            <Text style={{ color: '#6b7280', fontSize: 12, marginBottom: 12 }}>{suggestion.suggestedAction}</Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
                <TouchableOpacity onPress={onApply} style={{ flex: 1, backgroundColor: 'rgba(0, 255, 255, 0.15)', paddingVertical: 10, borderRadius: 8, alignItems: 'center' }}>
                    <Text style={{ color: '#6366F1', fontWeight: 'bold' }}>Apply</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onDismiss} style={{ flex: 1, backgroundColor: '#222', paddingVertical: 10, borderRadius: 8, alignItems: 'center' }}>
                    <Text style={{ color: '#6b7280' }}>Dismiss</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

export default function WeeklyReportScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { habits, generateWeeklyReport, latestReport, suggestions, applyAdjustment } = useHabitStore();
    const [report, setReport] = useState<WeeklyReport | null>(latestReport);
    const [isGenerating, setIsGenerating] = useState(false);
    const [dismissedSuggestions, setDismissedSuggestions] = useState<string[]>([]);

    useEffect(() => {
        if (!report) {
            handleGenerateReport();
        }
    }, []);

    const handleGenerateReport = async () => {
        setIsGenerating(true);
        const newReport = await generateWeeklyReport();
        setReport(newReport);
        setIsGenerating(false);
    };

    const getEmoji = (rate: number) => rate >= 70 ? '🎉' : rate >= 50 ? '📊' : '💪';

    const activeSuggestions = suggestions.filter(s => !dismissedSuggestions.includes(s.habitId));

    return (
        <View style={{ flex: 1, backgroundColor: '#0A0A0A', paddingTop: insets.top }}>
            <Animated.View entering={FadeInDown.duration(400)} style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 16 }}>
                <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={{ color: 'white', fontSize: 22, fontWeight: 'bold' }}>Weekly Report</Text>
            </Animated.View>

            <ScrollView style={{ flex: 1, paddingHorizontal: 16 }} contentContainerStyle={{ paddingBottom: 120 }}>
                {isGenerating ? (
                    <View style={{ alignItems: 'center', paddingTop: 60 }}>
                        <Text style={{ color: '#6b7280', fontSize: 16 }}>Generating report...</Text>
                    </View>
                ) : report ? (
                    <>
                        {/* Header Stats */}
                        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={{ backgroundColor: '#111', borderRadius: 20, padding: 24, marginBottom: 20, alignItems: 'center' }}>
                            <Text style={{ fontSize: 48 }}>{getEmoji(report.overallSuccessRate)}</Text>
                            <Text style={{ color: 'white', fontSize: 48, fontWeight: 'bold', marginTop: 8 }}>{report.overallSuccessRate}%</Text>
                            <Text style={{ color: '#6b7280', fontSize: 14 }}>Overall Success Rate</Text>
                            <Text style={{ color: '#6b7280', fontSize: 12, marginTop: 8 }}>
                                {format(report.weekStart, 'MMM d')} - {format(report.weekEnd, 'MMM d, yyyy')}
                            </Text>
                        </Animated.View>

                        {/* Quick Stats */}
                        <Animated.View entering={FadeInDown.delay(150).duration(400)} style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
                            <View style={{ flex: 1, backgroundColor: '#111', borderRadius: 16, padding: 16, alignItems: 'center' }}>
                                <Text style={{ color: '#6366F1', fontSize: 28, fontWeight: 'bold' }}>{report.totalCompletions}</Text>
                                <Text style={{ color: '#6b7280', fontSize: 10 }}>COMPLETED</Text>
                            </View>
                            <View style={{ flex: 1, backgroundColor: '#111', borderRadius: 16, padding: 16, alignItems: 'center' }}>
                                <Text style={{ color: '#A855F7', fontSize: 28, fontWeight: 'bold' }}>{report.totalMissed}</Text>
                                <Text style={{ color: '#6b7280', fontSize: 10 }}>MISSED</Text>
                            </View>
                        </Animated.View>

                        {/* Best/Worst Days */}
                        <Animated.View entering={FadeInDown.delay(200).duration(400)} style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
                            {report.bestDay !== null && (
                                <View style={{ flex: 1, backgroundColor: '#111', borderRadius: 16, padding: 16 }}>
                                    <Text style={{ color: '#6b7280', fontSize: 10, letterSpacing: 1 }}>BEST DAY</Text>
                                    <Text style={{ color: '#6366F1', fontSize: 16, fontWeight: 'bold', marginTop: 4 }}>{dayNames[report.bestDay]}</Text>
                                </View>
                            )}
                            {report.worstDay !== null && (
                                <View style={{ flex: 1, backgroundColor: '#111', borderRadius: 16, padding: 16 }}>
                                    <Text style={{ color: '#6b7280', fontSize: 10, letterSpacing: 1 }}>NEEDS WORK</Text>
                                    <Text style={{ color: '#A855F7', fontSize: 16, fontWeight: 'bold', marginTop: 4 }}>{dayNames[report.worstDay]}</Text>
                                </View>
                            )}
                        </Animated.View>

                        {/* Suggestions */}
                        {activeSuggestions.length > 0 && (
                            <Animated.View entering={FadeInUp.delay(250).duration(400)}>
                                <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>Suggestions</Text>
                                {activeSuggestions.map((s) => (
                                    <SuggestionCard
                                        key={s.habitId}
                                        suggestion={s}
                                        onApply={() => applyAdjustment(s)}
                                        onDismiss={() => setDismissedSuggestions([...dismissedSuggestions, s.habitId])}
                                    />
                                ))}
                            </Animated.View>
                        )}

                        {/* At Risk Habits */}
                        {report.atRiskHabits.length > 0 && (
                            <Animated.View entering={FadeInUp.delay(300).duration(400)} style={{ marginBottom: 20 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                                    <Ionicons name="warning" size={18} color="#A855F7" />
                                    <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold', marginLeft: 8 }}>At Risk</Text>
                                </View>
                                <Text style={{ color: '#6b7280', fontSize: 13, marginBottom: 12 }}>
                                    These habits need attention to prevent abandonment.
                                </Text>
                            </Animated.View>
                        )}

                        {/* Habit Breakdown */}
                        <Animated.View entering={FadeInUp.delay(350).duration(400)}>
                            <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>Habit Breakdown</Text>
                            {report.habitMetrics.map((metric) => (
                                <MetricCard key={metric.habitId} metric={metric} onViewHabit={() => router.push('/')} />
                            ))}
                        </Animated.View>

                        {/* Regenerate Button */}
                        <Animated.View entering={FadeInUp.delay(400).duration(400)} style={{ marginTop: 12 }}>
                            <TouchableOpacity onPress={handleGenerateReport}>
                                <LinearGradient colors={['#6366F1', '#A855F7'] as const} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ padding: 16, borderRadius: 16, alignItems: 'center' }}>
                                    <Text style={{ color: 'white', fontWeight: 'bold' }}>Refresh Report</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </Animated.View>
                    </>
                ) : (
                    <View style={{ alignItems: 'center', paddingTop: 60 }}>
                        <Ionicons name="document-text" size={60} color="#333" />
                        <Text style={{ color: '#6b7280', fontSize: 16, marginTop: 16 }}>No report available yet</Text>
                        <TouchableOpacity onPress={handleGenerateReport} style={{ marginTop: 20, backgroundColor: '#111', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 }}>
                            <Text style={{ color: '#6366F1' }}>Generate Report</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>

            <FloatingTabBar onAddPress={() => router.push('/create')} />
        </View>
    );
}
