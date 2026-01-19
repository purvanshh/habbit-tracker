import { Ionicons } from '@expo/vector-icons';
import { eachDayOfInterval, endOfMonth, format, isToday, startOfMonth } from 'date-fns';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FloatingTabBar } from '../src/components/FloatingTabBar';
import { getAllLogs } from '../src/core/db';
import { HabitLog } from '../src/core/types';

export default function CalendarScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [allLogs, setAllLogs] = useState<HabitLog[]>([]);

    useEffect(() => {
        getAllLogs().then(setAllLogs).catch(() => setAllLogs([]));
    }, []);

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

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

    const previousMonth = () => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    };

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

    return (
        <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
            <View className="flex-row items-center mb-6 px-4">
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text className="text-white text-xl font-bold font-sans" style={{ color: 'white' }}>Calendar</Text>
            </View>

            <ScrollView className="px-4" contentContainerStyle={{ paddingBottom: 120 }}>
                {/* Month Navigation */}
                <GlassCard style={{ padding: 16, marginBottom: 16 }}>
                    <View className="flex-row items-center justify-between">
                        <TouchableOpacity
                            onPress={previousMonth}
                            style={{
                                width: 40,
                                height: 40,
                                borderRadius: 12,
                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Ionicons name="chevron-back" size={20} color="white" />
                        </TouchableOpacity>
                        <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>
                            {format(currentDate, 'MMMM yyyy')}
                        </Text>
                        <TouchableOpacity
                            onPress={nextMonth}
                            style={{
                                width: 40,
                                height: 40,
                                borderRadius: 12,
                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Ionicons name="chevron-forward" size={20} color="white" />
                        </TouchableOpacity>
                    </View>
                </GlassCard>

                {/* Calendar Grid */}
                <GlassCard style={{ padding: 16 }}>
                    {/* Day Labels */}
                    <View className="flex-row mb-3">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <View key={day} className="flex-1 items-center">
                                <Text style={{ color: '#6b7280', fontSize: 12 }}>{day}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Calendar Days */}
                    <View className="flex-row flex-wrap">
                        {emptyDays.map((_, index) => (
                            <View key={`empty-${index}`} style={{ width: '14.28%', aspectRatio: 1, padding: 2 }} />
                        ))}
                        {daysInMonth.map(day => {
                            const count = getCompletionCount(day);
                            const isCurrentDay = isToday(day);

                            return (
                                <View key={day.toISOString()} style={{ width: '14.28%', aspectRatio: 1, padding: 2 }}>
                                    <View
                                        style={{
                                            flex: 1,
                                            borderRadius: 12,
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            backgroundColor: count > 0
                                                ? `rgba(98, 54, 255, ${0.3 + count * 0.2})`
                                                : 'rgba(255, 255, 255, 0.03)',
                                            borderWidth: isCurrentDay ? 2 : 0,
                                            borderColor: '#6236FF',
                                        }}
                                    >
                                        <Text
                                            style={{
                                                color: count > 0 ? 'white' : '#6b7280',
                                                fontSize: 14,
                                                fontWeight: isCurrentDay ? 'bold' : 'normal',
                                            }}
                                        >
                                            {format(day, 'd')}
                                        </Text>
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                </GlassCard>

                {/* Legend */}
                <View className="flex-row items-center justify-center mt-4 gap-6">
                    <View className="flex-row items-center">
                        <View style={{ width: 16, height: 16, borderRadius: 4, backgroundColor: 'rgba(255, 255, 255, 0.03)', marginRight: 8 }} />
                        <Text style={{ color: '#9ca3af', fontSize: 12 }}>No activity</Text>
                    </View>
                    <View className="flex-row items-center">
                        <View style={{ width: 16, height: 16, borderRadius: 4, backgroundColor: 'rgba(98, 54, 255, 0.5)', marginRight: 8 }} />
                        <Text style={{ color: '#9ca3af', fontSize: 12 }}>Completed</Text>
                    </View>
                </View>
            </ScrollView>

            <FloatingTabBar onAddPress={() => router.push('/create')} />
        </View>
    );
}
