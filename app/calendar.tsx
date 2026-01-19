import { Ionicons } from '@expo/vector-icons';
import { eachDayOfInterval, endOfMonth, format, isToday, startOfMonth } from 'date-fns';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getAllLogs } from '../src/core/db';
import { HabitLog } from '../src/core/types';
import { useHabitStore } from '../src/store/useHabitStore';

export default function CalendarScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { habits } = useHabitStore();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [allLogs, setAllLogs] = useState<HabitLog[]>([]);

    useEffect(() => {
        getAllLogs().then(setAllLogs);
    }, []);

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Calculate first day offset for calendar grid
    const firstDayOfWeek = monthStart.getDay();
    const emptyDays = Array(firstDayOfWeek).fill(null);

    const getCompletionCount = (date: Date) => {
        const dayStart = new Date(date);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = dayStart.getTime() + 24 * 60 * 60 * 1000;

        return allLogs.filter(
            log => log.timestamp >= dayStart.getTime() &&
                log.timestamp < dayEnd &&
                log.status === 'completed'
        ).length;
    };

    const getDayColor = (count: number) => {
        if (count === 0) return 'bg-card';
        if (count === 1) return 'bg-green-500/30';
        if (count === 2) return 'bg-green-500/50';
        return 'bg-green-500/70';
    };

    const previousMonth = () => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    };

    return (
        <View className="flex-1 bg-background px-4" style={{ paddingTop: insets.top, paddingBottom: insets.bottom + 80 }}>
            <View className="flex-row items-center mb-6">
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text className="text-white text-xl font-bold font-sans" style={{ color: 'white' }}>Calendar</Text>
            </View>

            <ScrollView>
                {/* Month Navigation */}
                <View className="flex-row items-center justify-between bg-card p-4 rounded-xl mb-4 border border-white/5">
                    <TouchableOpacity onPress={previousMonth}>
                        <Ionicons name="chevron-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text className="text-white text-lg font-bold" style={{ color: 'white' }}>
                        {format(currentDate, 'MMMM yyyy')}
                    </Text>
                    <TouchableOpacity onPress={nextMonth}>
                        <Ionicons name="chevron-forward" size={24} color="white" />
                    </TouchableOpacity>
                </View>

                {/* Day Labels */}
                <View className="flex-row mb-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <View key={day} className="flex-1 items-center">
                            <Text className="text-gray-500 text-xs" style={{ color: '#6b7280' }}>{day}</Text>
                        </View>
                    ))}
                </View>

                {/* Calendar Grid */}
                <View className="flex-row flex-wrap">
                    {emptyDays.map((_, index) => (
                        <View key={`empty-${index}`} className="w-[14.28%] aspect-square p-1" />
                    ))}
                    {daysInMonth.map(day => {
                        const count = getCompletionCount(day);
                        const isCurrentDay = isToday(day);

                        return (
                            <View key={day.toISOString()} className="w-[14.28%] aspect-square p-1">
                                <View
                                    className={`flex-1 rounded-lg items-center justify-center ${getDayColor(count)} ${isCurrentDay ? 'border-2 border-primary' : ''}`}
                                    style={isCurrentDay ? { borderColor: '#6236FF' } : {}}
                                >
                                    <Text
                                        className={`text-sm ${isCurrentDay ? 'font-bold' : ''}`}
                                        style={{ color: count > 0 ? '#22c55e' : '#9ca3af' }}
                                    >
                                        {format(day, 'd')}
                                    </Text>
                                    {count > 0 && (
                                        <Text className="text-xs" style={{ color: '#22c55e' }}>{count}</Text>
                                    )}
                                </View>
                            </View>
                        );
                    })}
                </View>

                {/* Legend */}
                <View className="flex-row items-center justify-center mt-6 gap-4">
                    <View className="flex-row items-center">
                        <View className="w-4 h-4 rounded bg-card mr-2" />
                        <Text className="text-gray-400 text-xs" style={{ color: '#9ca3af' }}>No habits</Text>
                    </View>
                    <View className="flex-row items-center">
                        <View className="w-4 h-4 rounded mr-2" style={{ backgroundColor: 'rgba(34, 197, 94, 0.5)' }} />
                        <Text className="text-gray-400 text-xs" style={{ color: '#9ca3af' }}>Completed</Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}
