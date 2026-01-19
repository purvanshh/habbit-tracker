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

    // Generate chart data - Week view only (removed month view)
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

            // Count completions for this day
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

    // Ensure we have valid data for chart (at least some non-zero or default)
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
        backgroundGradientFrom: '#1A1A1A',
        backgroundGradientTo: '#1A1A1A',
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
                <View className="bg-card p-6 rounded-2xl mb-6 border border-white/5">
                    <Text className="text-gray-400 text-xs font-sans tracking-widest uppercase mb-2" style={{ color: '#9ca3af' }}>
                        Total Streaks
                    </Text>
                    <Text className="text-primary text-5xl font-hero" style={{ color: '#6236FF' }}>
                        {totalStreak}
                    </Text>
                </View>

                {/* Chart Section - Week View Only */}
                <View className="mb-6">
                    <Text className="text-white text-lg font-bold mb-4" style={{ color: 'white' }}>This Week</Text>

                    <View className="bg-card rounded-2xl p-4 border border-white/5">
                        <LineChart
                            data={chartData}
                            width={screenWidth - 32}
                            height={200}
                            chartConfig={chartConfig}
                            bezier
                            style={{
                                borderRadius: 16,
                            }}
                            fromZero
                        />
                    </View>
                </View>

                {/* Per-Habit Stats */}
                <View className="mb-6">
                    <Text className="text-white text-lg font-bold mb-4" style={{ color: 'white' }}>Per Habit Breakdown</Text>
                    {habits.map(habit => {
                        const habitLogs = allLogs.filter(l => l.habitId === habit.id && l.status === 'completed');
                        const weeklyCompletions = habitLogs.filter(l => {
                            const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
                            return l.timestamp >= weekAgo;
                        }).length;
                        const completionRate = Math.round((weeklyCompletions / 7) * 100);

                        return (
                            <View key={habit.id} className="bg-card p-4 rounded-xl mb-3 border border-white/5">
                                <View className="flex-row justify-between items-center">
                                    <Text className="text-white font-bold" style={{ color: 'white' }}>{habit.name}</Text>
                                    <Text className="text-primary font-bold" style={{ color: '#6236FF' }}>{habit.streak} 🔥</Text>
                                </View>
                                <View className="mt-2 h-2 bg-secondary rounded-full overflow-hidden">
                                    <View
                                        className="h-full bg-primary rounded-full"
                                        style={{ width: `${Math.min(completionRate, 100)}%`, backgroundColor: '#6236FF' }}
                                    />
                                </View>
                                <Text className="text-gray-400 text-xs mt-1" style={{ color: '#9ca3af' }}>
                                    {weeklyCompletions}/7 days this week ({completionRate}%)
                                </Text>
                            </View>
                        );
                    })}
                </View>

                {/* Adaptive Suggestions */}
                <View className="mb-6">
                    <Text className="text-white text-lg font-bold mb-4" style={{ color: 'white' }}>Suggestions</Text>

                    {suggestions.length > 0 ? (
                        suggestions.map((s, i) => {
                            const habitName = habits.find(h => h.id === s.habitId)?.name || 'Unknown';
                            return (
                                <View key={i} className="bg-card p-4 rounded-xl mb-3 border-l-4 border-yellow-500">
                                    <Text className="text-white font-bold text-base mb-1" style={{ color: 'white' }}>{habitName}</Text>
                                    <Text className="text-gray-400 text-sm mb-2" style={{ color: '#9ca3af' }}>{s.reason}</Text>
                                    <View className="bg-yellow-500/10 p-2 rounded">
                                        <Text className="text-gray-300 text-sm italic" style={{ color: '#d1d5db' }}>{s.suggestedAction}</Text>
                                    </View>
                                </View>
                            );
                        })
                    ) : (
                        <View className="bg-card p-6 rounded-xl border border-white/5 items-center">
                            <Ionicons name="checkmark-circle" size={48} color="#22c55e" />
                            <Text className="text-gray-400 mt-2 text-center" style={{ color: '#9ca3af' }}>
                                All habits on track!
                            </Text>
                        </View>
                    )}
                </View>
            </ScrollView>

            <FloatingTabBar onAddPress={() => router.push('/create')} />
        </View>
    );
}
