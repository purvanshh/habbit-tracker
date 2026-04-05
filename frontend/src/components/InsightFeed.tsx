import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { InsightFeedData } from '../core/types';

interface InsightFeedProps {
    insights: InsightFeedData;
    onUseFreeze?: (habitId: string) => void;
    onActivateVacation?: (habitId: string) => void;
    onAdjustFrequency?: (habitId: string) => void;
}

export const InsightFeed: React.FC<InsightFeedProps> = ({ insights, onUseFreeze, onActivateVacation, onAdjustFrequency }) => {
    const { bestHabit, atRisk, streakHighlight, focus } = insights;

    const Pill = ({ children }: { children: React.ReactNode }) => (
        <View style={{ backgroundColor: '#111827', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: '#1f2937' }}>
            <Text style={{ color: '#cbd5e1', fontSize: 12 }}>{children}</Text>
        </View>
    );

    return (
        <View style={{ backgroundColor: '#0B1224', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#1f2937', gap: 12 }}>
            <Text style={{ color: '#cbd5e1', fontWeight: '700', fontSize: 15, marginBottom: 4 }}>Insight Feed</Text>

            {bestHabit ? (
                <View style={{ backgroundColor: '#0f172a', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#1e293b' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                        <Ionicons name="sparkles" size={16} color="#a855f7" />
                        <Text style={{ color: 'white', fontWeight: '600', marginLeft: 8 }}>Weekly Digest</Text>
                    </View>
                    <Text style={{ color: '#e2e8f0', fontWeight: '700', fontSize: 15 }}>{bestHabit.name}</Text>
                    <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
                        <Pill>{`${Math.round(bestHabit.successRate * 100)}% success`}</Pill>
                        <Pill>{`${bestHabit.completions} completions`}</Pill>
                    </View>
                </View>
            ) : (
                <Text style={{ color: '#64748b' }}>Complete a few days to see insights.</Text>
            )}

            {streakHighlight && (
                <View style={{ backgroundColor: '#111827', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#1f2937' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                        <Ionicons name="flame" size={16} color="#f59e0b" />
                        <Text style={{ color: 'white', fontWeight: '600', marginLeft: 8 }}>Streak</Text>
                    </View>
                    <Text style={{ color: '#e2e8f0', fontWeight: '700' }}>{streakHighlight.name}</Text>
                    <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                        <Pill>{`${streakHighlight.currentStreak} current`}</Pill>
                        <Pill>{`${streakHighlight.longestStreak} longest`}</Pill>
                        <Pill>{`${streakHighlight.freezeTokens} freeze tokens`}</Pill>
                    </View>
                    {streakHighlight.needsAction && onUseFreeze && (
                        <TouchableOpacity style={{ marginTop: 8, backgroundColor: '#b91c1c', paddingVertical: 10, borderRadius: 10, alignItems: 'center' }} onPress={() => onUseFreeze(streakHighlight.habitId)}>
                            <Text style={{ color: 'white', fontWeight: '700' }}>Use Freeze to protect</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}

            {atRisk.length > 0 && (
                <View style={{ backgroundColor: '#111827', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#1f2937', gap: 10 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="alert-circle" size={16} color="#f97316" />
                        <Text style={{ color: 'white', fontWeight: '600', marginLeft: 8 }}>At Risk</Text>
                    </View>
                    {atRisk.map(item => (
                        <View key={item.habitId} style={{ backgroundColor: '#0b1224', borderRadius: 10, padding: 10, borderWidth: 1, borderColor: '#1e293b' }}>
                            <Text style={{ color: '#e2e8f0', fontWeight: '700' }}>{item.name}</Text>
                            <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                                <Pill>{`${Math.round(item.successRate * 100)}% success`}</Pill>
                                <Pill>{`${item.consecutiveFailures} fails streak`}</Pill>
                            </View>
                            <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                                {onUseFreeze && (
                                    <TouchableOpacity onPress={() => onUseFreeze(item.habitId)} style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: '#2563eb' }}>
                                        <Text style={{ color: 'white', fontWeight: '600' }}>Use Freeze</Text>
                                    </TouchableOpacity>
                                )}
                                {onActivateVacation && (
                                    <TouchableOpacity onPress={() => onActivateVacation(item.habitId)} style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: '#10b981' }}>
                                        <Text style={{ color: 'white', fontWeight: '600' }}>Activate Vacation</Text>
                                    </TouchableOpacity>
                                )}
                                {onAdjustFrequency && (
                                    <TouchableOpacity onPress={() => onAdjustFrequency(item.habitId)} style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: '#f59e0b' }}>
                                        <Text style={{ color: '#0f172a', fontWeight: '700' }}>Adjust Frequency</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    ))}
                </View>
            )}

            {focus && (
                <View style={{ backgroundColor: '#0f172a', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#1e293b' }}>
                    <Text style={{ color: '#cbd5e1', fontWeight: '700', marginBottom: 4 }}>Focus for this week</Text>
                    <Text style={{ color: '#e2e8f0' }}>{focus}</Text>
                </View>
            )}
        </View>
    );
};
