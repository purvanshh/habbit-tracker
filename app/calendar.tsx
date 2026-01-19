import { Ionicons } from '@expo/vector-icons';
import { eachDayOfInterval, endOfMonth, format, isToday, startOfMonth } from 'date-fns';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, Stop, LinearGradient as SvgGradient } from 'react-native-svg';
import { FloatingTabBar } from '../src/components/FloatingTabBar';
import { getAllLogs } from '../src/core/db';
import { HabitLog } from '../src/core/types';

function DayCircle({ day, count, isCurrentDay }: { day: number; count: number; isCurrentDay: boolean }) {
    const size = 36;
    const strokeWidth = 2;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = Math.min(count / 3, 1);
    const strokeDashoffset = circumference * (1 - progress);

    return (
        <View style={{ width: '14.28%', aspectRatio: 1, padding: 2, alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
                <Svg width={size} height={size} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
                    <Defs>
                        <SvgGradient id={`calGradient${day}`} x1="0%" y1="0%" x2="100%" y2="0%">
                            <Stop offset="0%" stopColor="#00FFFF" />
                            <Stop offset="100%" stopColor="#FF00FF" />
                        </SvgGradient>
                    </Defs>
                    <Circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke={count > 0 ? `url(#calGradient${day})` : 'rgba(255, 255, 255, 0.1)'}
                        strokeWidth={strokeWidth}
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={count > 0 ? strokeDashoffset : 0}
                        strokeLinecap="round"
                    />
                </Svg>
                <Text style={{ color: count > 0 ? 'white' : isCurrentDay ? '#00FFFF' : '#6b7280', fontSize: 12, fontWeight: isCurrentDay ? 'bold' : 'normal' }}>
                    {day}
                </Text>
            </View>
        </View>
    );
}

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
        return allLogs.filter(log => log.timestamp >= dayStart.getTime() && log.timestamp < dayEnd && log.status === 'completed').length;
    };

    const completedDays = daysInMonth.filter(d => getCompletionCount(d) > 0).length;
    const completionRate = Math.round((completedDays / daysInMonth.length) * 100);

    return (
        <View style={{ flex: 1, backgroundColor: '#0A0A0A', paddingTop: insets.top }}>
            <View style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24 }}>
                <Text style={{ color: 'white', fontSize: 28, fontWeight: 'bold' }}>Calendar</Text>
            </View>

            <ScrollView style={{ flex: 1, paddingHorizontal: 16 }} contentContainerStyle={{ paddingBottom: 120 }}>
                {/* Month Navigation */}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                    <TouchableOpacity onPress={() => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#111', alignItems: 'center', justifyContent: 'center' }}>
                        <Ionicons name="chevron-back" size={20} color="#00FFFF" />
                    </TouchableOpacity>
                    <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>{format(currentDate, 'MMMM yyyy')}</Text>
                    <TouchableOpacity onPress={() => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#111', alignItems: 'center', justifyContent: 'center' }}>
                        <Ionicons name="chevron-forward" size={20} color="#FF00FF" />
                    </TouchableOpacity>
                </View>

                {/* Stats */}
                <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
                    <View style={{ flex: 1, backgroundColor: '#111', borderRadius: 16, padding: 16 }}>
                        <Text style={{ color: '#6b7280', fontSize: 10, letterSpacing: 1 }}>COMPLETED</Text>
                        <Text style={{ color: '#00FFFF', fontSize: 32, fontWeight: 'bold' }}>{completedDays}</Text>
                        <Text style={{ color: '#6b7280', fontSize: 11 }}>days</Text>
                    </View>
                    <View style={{ flex: 1, backgroundColor: '#111', borderRadius: 16, padding: 16 }}>
                        <Text style={{ color: '#6b7280', fontSize: 10, letterSpacing: 1 }}>SUCCESS RATE</Text>
                        <Text style={{ color: '#FF00FF', fontSize: 32, fontWeight: 'bold' }}>{completionRate}%</Text>
                        <Text style={{ color: '#6b7280', fontSize: 11 }}>this month</Text>
                    </View>
                </View>

                {/* Calendar Grid */}
                <View style={{ backgroundColor: '#111', borderRadius: 16, padding: 16 }}>
                    <View style={{ flexDirection: 'row', marginBottom: 12 }}>
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <View key={day} style={{ width: '14.28%', alignItems: 'center' }}>
                                <Text style={{ color: '#6b7280', fontSize: 11 }}>{day}</Text>
                            </View>
                        ))}
                    </View>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                        {emptyDays.map((_, i) => <View key={`e-${i}`} style={{ width: '14.28%', aspectRatio: 1 }} />)}
                        {daysInMonth.map(day => (
                            <DayCircle key={day.toISOString()} day={parseInt(format(day, 'd'))} count={getCompletionCount(day)} isCurrentDay={isToday(day)} />
                        ))}
                    </View>
                </View>
            </ScrollView>

            <FloatingTabBar onAddPress={() => router.push('/create')} />
        </View>
    );
}
