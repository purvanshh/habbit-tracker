import { Ionicons } from '@expo/vector-icons';
import { eachDayOfInterval, format, subDays } from 'date-fns';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Dimensions, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FloatingTabBar } from '../src/components/FloatingTabBar';
import { getAllLogs } from '../src/core/db';
import { HabitLog } from '../src/core/types';
import { useHabitStore } from '../src/store/useHabitStore';

const screenWidth = Dimensions.get('window').width;

const chartConfig = {
    backgroundGradientFrom: '#111',
    backgroundGradientTo: '#111',
    color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    propsForDots: {
        r: '4',
        strokeWidth: '2',
        stroke: '#6366F1',
    },
    decimalPlaces: 0,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
};

export default function StatisticsScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { habits } = useHabitStore();
    const [allLogs, setAllLogs] = useState<HabitLog[]>([]);
    const [selectedHabitIndex, setSelectedHabitIndex] = useState(0);

    const selectedHabit = habits.length > 0 ? habits[selectedHabitIndex] : null;

    useEffect(() => {
        getAllLogs().then(setAllLogs).catch((err) => console.error(err));
    }, []);

    // Get last 7 days
    const today = new Date();
    const last7Days = eachDayOfInterval({
        start: subDays(today, 6),
        end: today,
    });

    // Calculate chart data based on selected habit
    const getChartData = () => {
        if (!selectedHabit) return { labels: [], datasets: [{ data: [0] }] };

        const data = last7Days.map(date => {
            const dayStart = new Date(date);
            dayStart.setHours(0, 0, 0, 0);
            const dayEnd = dayStart.getTime() + 24 * 60 * 60 * 1000;

            // For now, we are tracking boolean completion per day for simple habits.
            // If completed = 1, else 0. 
            // This could be summed if multiple logs per day are allowed/counted.
            const logs = allLogs.filter(l =>
                l.habitId === selectedHabit.id &&
                l.status === 'completed' &&
                l.timestamp >= dayStart.getTime() &&
                l.timestamp < dayEnd
            );
            return logs.length;
        });

        return {
            labels: last7Days.map(d => format(d, 'EEE')), // Mon, Tue...
            datasets: [
                {
                    data: data,
                    color: (opacity = 1) => `rgba(168, 85, 247, ${opacity})`, // Purple trend line
                    strokeWidth: 2
                }
            ],
            legend: ["Completed Logs"] // optional
        };
    };

    const chartData = getChartData();

    // Stats Logic
    const totalCompletions = selectedHabit ? allLogs.filter(l => l.habitId === selectedHabit.id && l.status === 'completed').length : 0;
    const currentStreak = selectedHabit?.streak || 0;

    return (
        <View style={{ flex: 1, backgroundColor: '#0A0A0A', paddingTop: insets.top }}>
            <Animated.View entering={FadeInDown.duration(400)} style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24 }}>
                <Text style={{ color: 'white', fontSize: 28, fontWeight: 'bold' }}>Statistics</Text>
            </Animated.View>

            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 120 }}>
                {/* Habit Selector */}
                {habits.length > 0 ? (
                    <View style={{ marginBottom: 24 }}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24 }}>
                            {habits.map((habit, index) => (
                                <TouchableOpacity
                                    key={habit.id}
                                    onPress={() => setSelectedHabitIndex(index)}
                                    style={{
                                        paddingHorizontal: 20,
                                        paddingVertical: 10,
                                        marginRight: 12,
                                        borderRadius: 20,
                                        backgroundColor: index === selectedHabitIndex ? '#6366F1' : '#111',
                                        borderWidth: 1,
                                        borderColor: index === selectedHabitIndex ? '#6366F1' : '#333',
                                    }}
                                >
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Ionicons name={habit.icon as any || 'barbell'} size={16} color={index === selectedHabitIndex ? 'white' : '#9ca3af'} style={{ marginRight: 8 }} />
                                        <Text style={{ color: index === selectedHabitIndex ? 'white' : '#9ca3af', fontWeight: index === selectedHabitIndex ? 'bold' : 'normal' }}>
                                            {habit.name}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                ) : (
                    <View style={{ paddingHorizontal: 24 }}>
                        <Text style={{ color: '#6b7280' }}>No habits created yet.</Text>
                    </View>
                )}

                {/* Main Stats Cards */}
                {selectedHabit && (
                    <Animated.View entering={FadeInUp.delay(100).duration(400)} style={{ flexDirection: 'row', gap: 12, paddingHorizontal: 24, marginBottom: 24 }}>
                        <View style={{ flex: 1, backgroundColor: '#111', borderRadius: 20, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: '#222' }}>
                            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(99, 102, 241, 0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                                <Ionicons name="flame" size={24} color="#6366F1" />
                            </View>
                            <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>{currentStreak}</Text>
                            <Text style={{ color: '#6b7280', fontSize: 12, marginTop: 4 }}>CURRENT STREAK</Text>
                        </View>
                        <View style={{ flex: 1, backgroundColor: '#111', borderRadius: 20, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: '#222' }}>
                            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(168, 85, 247, 0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                                <Ionicons name="trophy" size={24} color="#A855F7" />
                            </View>
                            <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>{totalCompletions}</Text>
                            <Text style={{ color: '#6b7280', fontSize: 12, marginTop: 4 }}>TOTAL COMPLETED</Text>
                        </View>
                    </Animated.View>
                )}

                {/* Chart Section */}
                {selectedHabit ? (
                    <Animated.View entering={FadeInUp.delay(200).duration(400)} style={{ marginHorizontal: 16, backgroundColor: '#111', borderRadius: 24, paddingVertical: 24, overflow: 'hidden' }}>
                        <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold', marginLeft: 24, marginBottom: 24 }}>
                            Last 7 Days Activity
                        </Text>

                        <LineChart
                            data={chartData}
                            width={screenWidth - 32} // from react-native
                            height={220}
                            yAxisLabel=""
                            yAxisSuffix=""
                            yAxisInterval={1}
                            chartConfig={chartConfig}
                            bezier
                            style={{
                                borderRadius: 16,
                                paddingRight: 40 // offset valid to show last label
                            }}
                            withInnerLines={false}
                            withOuterLines={false}
                        />
                        <Text style={{ color: '#6b7280', fontSize: 12, textAlign: 'center', marginTop: 16 }}>
                            Daily completions count
                        </Text>
                    </Animated.View>
                ) : null}

                {/* Additional Insight Placeholders */}
                {selectedHabit && (
                    <Animated.View entering={FadeInUp.delay(300).duration(400)} style={{ marginTop: 24, paddingHorizontal: 24 }}>
                        <View style={{ backgroundColor: '#161616', padding: 20, borderRadius: 16, borderLeftWidth: 4, borderLeftColor: '#6366F1' }}>
                            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16, marginBottom: 8 }}>Consistency Insight</Text>
                            <Text style={{ color: '#9ca3af', lineHeight: 20 }}>
                                {currentStreak > 3
                                    ? `You are on a roll! ${currentStreak} day streak. Keep it up!`
                                    : "Consistency is key. Try to complete this habit at the same time every day."}
                            </Text>
                        </View>
                    </Animated.View>
                )}

            </ScrollView>

            <FloatingTabBar onAddPress={() => router.push('/create')} />
        </View>
    );
}
