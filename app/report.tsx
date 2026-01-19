import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Dimensions, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FloatingTabBar } from '../src/components/FloatingTabBar';
import { getAllLogs } from '../src/core/db';
import { HabitLog } from '../src/core/types';
import { useHabitStore } from '../src/store/useHabitStore';

const screenWidth = Dimensions.get('window').width - 32;

export default function WeeklyReport() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { suggestions, habits } = useHabitStore();
    const [allLogs, setAllLogs] = useState<HabitLog[]>([]);

    const totalStreak = habits.reduce((acc, h) => acc + h.streak, 0);

    useEffect(() => {
        getAllLogs().then(setAllLogs).catch(() => setAllLogs([]));
    }, []);

    const GlassCard = ({ children, style }: { children: React.ReactNode; style?: any }) => (
        <View
            style={[{
                backgroundColor: 'rgba(30, 30, 40, 0.6)',
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: 16,
            }, style]}
        >
            {children}
        </View>
    );

    const generateChartData = () => {
        const now = new Date();
        const days = 7;
        const labels: string[] = [];
        const completions: number[] = [];

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);
            const startOfDay = date.getTime();
            const endOfDay = startOfDay + 24 * 60 * 60 * 1000;

            labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));

            const dayCompletions = allLogs.filter(
                log => log.timestamp >= startOfDay &&
                    log.timestamp < endOfDay &&
                    log.status === 'completed'
            ).length;
            completions.push(dayCompletions);
        }

        return { labels, completions };
    };

    const { labels, completions } = generateChartData();

    const chartData = {
        labels,
        datasets: [
            {
                data: completions.some(c => c > 0) ? completions : [0, 0, 0, 0, 0, 0, 0],
                color: (opacity = 1) => `rgba(98, 54, 255, ${opacity})`,
                strokeWidth: 3,
            },
        ],
        legend: ['Habits Completed'],
    };

    const chartConfig = {
        backgroundGradientFrom: 'rgba(30, 30, 40, 0.8)',
        backgroundGradientTo: 'rgba(30, 30, 40, 0.8)',
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(156, 163, 175, ${opacity})`,
        style: {
            borderRadius: 16,
        },
        propsForDots: {
            r: '6',
            strokeWidth: '2',
            stroke: '#6236FF',
        },
        fillShadowGradient: '#6236FF',
        fillShadowGradientOpacity: 0.3,
    };

    return (
        <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
            <View className="flex-row items-center mb-6 px-4">
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text className="text-white text-xl font-bold font-sans" style={{ color: 'white' }}>Analytics</Text>
            </View>

            <ScrollView className="px-4" contentContainerStyle={{ paddingBottom: 120 }}>
                {/* Summary Card */}
                <GlassCard style={{ padding: 24, marginBottom: 16 }}>
                    <Text style={{ color: '#9ca3af', fontSize: 10, letterSpacing: 2, marginBottom: 4 }}>
                        TOTAL STREAKS
                    </Text>
                    <Text style={{ color: '#6236FF', fontSize: 48, fontWeight: 'bold' }}>
                        {totalStreak}
                    </Text>
                </GlassCard>

                {/* Chart Section */}
                <GlassCard style={{ padding: 16, marginBottom: 16 }}>
                    <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold', marginBottom: 16 }}>This Week</Text>
                    <LineChart
                        data={chartData}
                        width={screenWidth - 64}
                        height={180}
                        chartConfig={chartConfig}
                        bezier
                        style={{
                            borderRadius: 12,
                        }}
                        fromZero
                    />
                </GlassCard>

                {/* Per-Habit Stats */}
                <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold', marginBottom: 12 }}>Per Habit Breakdown</Text>
                {habits.map(habit => {
                    const habitLogs = allLogs.filter(l => l.habitId === habit.id && l.status === 'completed');
                    const weeklyCompletions = habitLogs.filter(l => {
                        const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
                        return l.timestamp >= weekAgo;
                    }).length;
                    const completionRate = Math.round((weeklyCompletions / 7) * 100);

                    return (
                        <GlassCard key={habit.id} style={{ padding: 16, marginBottom: 12 }}>
                            <View className="flex-row justify-between items-center">
                                <Text style={{ color: 'white', fontWeight: 'bold' }}>{habit.name}</Text>
                                <Text style={{ color: '#6236FF', fontWeight: 'bold' }}>{habit.streak} 🔥</Text>
                            </View>
                            <View style={{ marginTop: 12, height: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' }}>
                                <View
                                    style={{
                                        height: '100%',
                                        width: `${Math.min(completionRate, 100)}%`,
                                        backgroundColor: '#6236FF',
                                        borderRadius: 3,
                                    }}
                                />
                            </View>
                            <Text style={{ color: '#9ca3af', fontSize: 12, marginTop: 6 }}>
                                {weeklyCompletions}/7 days this week ({completionRate}%)
                            </Text>
                        </GlassCard>
                    );
                })}

                {/* Suggestions */}
                {suggestions.length > 0 && (
                    <>
                        <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold', marginTop: 8, marginBottom: 12 }}>Suggestions</Text>
                        {suggestions.map((s, i) => {
                            const habitName = habits.find(h => h.id === s.habitId)?.name || 'Unknown';
                            return (
                                <GlassCard key={i} style={{ padding: 16, marginBottom: 12, borderLeftWidth: 3, borderLeftColor: '#eab308' }}>
                                    <Text style={{ color: 'white', fontWeight: 'bold', marginBottom: 4 }}>{habitName}</Text>
                                    <Text style={{ color: '#9ca3af', fontSize: 13, marginBottom: 8 }}>{s.reason}</Text>
                                    <View style={{ backgroundColor: 'rgba(234, 179, 8, 0.1)', padding: 8, borderRadius: 8 }}>
                                        <Text style={{ color: '#d1d5db', fontSize: 13, fontStyle: 'italic' }}>{s.suggestedAction}</Text>
                                    </View>
                                </GlassCard>
                            );
                        })}
                    </>
                )}

                {suggestions.length === 0 && (
                    <GlassCard style={{ padding: 24, alignItems: 'center' }}>
                        <Ionicons name="checkmark-circle" size={48} color="#22c55e" />
                        <Text style={{ color: '#9ca3af', marginTop: 8, textAlign: 'center' }}>
                            All habits on track!
                        </Text>
                    </GlassCard>
                )}
            </ScrollView>

            <FloatingTabBar onAddPress={() => router.push('/create')} />
        </View>
    );
}
