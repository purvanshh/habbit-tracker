import { Ionicons } from '@expo/vector-icons';
import { eachDayOfInterval, endOfMonth, format, isBefore, isToday, startOfDay, startOfMonth } from 'date-fns';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, Stop, LinearGradient as SvgGradient } from 'react-native-svg';
import { FloatingTabBar } from '../src/components/FloatingTabBar';
import { getAllLogs } from '../src/core/db';
import { DayOfWeek, Habit, HabitLog } from '../src/core/types';
import { useHabitStore } from '../src/store/useHabitStore';

type DayStatus = 'completed' | 'skipped' | 'missed' | 'partial' | 'not_scheduled' | 'future';

function DayCircle({ day, status, progress, isCurrentDay }: { day: number; status: DayStatus; progress: number; isCurrentDay: boolean }) {
    const size = 36;
    const strokeWidth = 2;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference * (1 - progress);

    const getColors = () => {
        switch (status) {
            case 'completed': return { stroke: 'url(#calGreen)', text: 'white' };
            case 'skipped': return { stroke: '#F59E0B', text: '#FBBF24' }; // Amber gold
            case 'missed': return { stroke: '#EF4444', text: '#F87171' }; // Rose red
            case 'partial': return { stroke: 'url(#calGradient)', text: 'white' };
            case 'not_scheduled': return { stroke: 'rgba(255,255,255,0.08)', text: '#4B5563' };
            default: return { stroke: 'rgba(255,255,255,0.08)', text: isCurrentDay ? '#6366F1' : '#4B5563' };
        }
    };

    const colors = getColors();

    return (
        <View style={{ width: '14.28%', aspectRatio: 1, padding: 2, alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
                <Svg width={size} height={size} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
                    <Defs>
                        <SvgGradient id="calGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <Stop offset="0%" stopColor="#8B5CF6" />
                            <Stop offset="100%" stopColor="#EC4899" />
                        </SvgGradient>
                        <SvgGradient id="calGreen" x1="0%" y1="0%" x2="100%" y2="0%">
                            <Stop offset="0%" stopColor="#10B981" />
                            <Stop offset="100%" stopColor="#34D399" />
                        </SvgGradient>
                    </Defs>
                    {/* Background ring */}
                    <Circle cx={size / 2} cy={size / 2} r={radius} stroke="rgba(255, 255, 255, 0.1)" strokeWidth={strokeWidth} fill="transparent" />
                    {/* Progress ring */}
                    {progress > 0 && (
                        <Circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            stroke={colors.stroke}
                            strokeWidth={strokeWidth}
                            fill="transparent"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                        />
                    )}
                </Svg>
                <Text style={{ color: colors.text, fontSize: 12, fontWeight: isCurrentDay ? 'bold' : 'normal' }}>{day}</Text>
            </View>
        </View>
    );
}

export default function CalendarScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { habits } = useHabitStore();
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

    // Get habits active for a specific date
    const getActiveHabitsForDate = (date: Date): Habit[] => {
        const dayOfWeek = date.getDay() as DayOfWeek;
        return habits.filter(h => {
            if (h.createdAt > date.getTime()) return false;
            if (h.isPaused) return false;
            return h.selectedDays?.includes(dayOfWeek) ?? true;
        });
    };

    // Get day status
    const getDayData = (date: Date): { status: DayStatus; progress: number } => {
        const today = startOfDay(new Date());
        const dayStart = startOfDay(date);

        // Future days
        if (dayStart > today) {
            return { status: 'future', progress: 0 };
        }

        const activeHabits = getActiveHabitsForDate(date);
        if (activeHabits.length === 0) {
            return { status: 'not_scheduled', progress: 0 };
        }

        const dayEnd = dayStart.getTime() + 24 * 60 * 60 * 1000;
        const dayLogs = allLogs.filter(log =>
            log.timestamp >= dayStart.getTime() &&
            log.timestamp < dayEnd
        );

        const completed = dayLogs.filter(l => l.status === 'completed').length;
        const skipped = dayLogs.filter(l => l.status === 'skipped').length;
        const total = activeHabits.length;
        const done = completed + skipped;

        const progress = total > 0 ? done / total : 0;

        if (done === 0 && isBefore(dayStart, today)) {
            return { status: 'missed', progress: 1 }; // Full red ring for missed
        }
        if (done === total && completed === total) {
            return { status: 'completed', progress: 1 };
        }
        if (done === total && skipped > 0) {
            return { status: 'skipped', progress: 1 };
        }
        if (done > 0 && done < total) {
            return { status: 'partial', progress };
        }
        return { status: 'not_scheduled', progress: 0 };
    };

    const completedDays = daysInMonth.filter(d => getDayData(d).status === 'completed').length;
    const missedDays = daysInMonth.filter(d => getDayData(d).status === 'missed').length;
    const completionRate = Math.round((completedDays / Math.max(completedDays + missedDays, 1)) * 100);

    return (
        <View style={{ flex: 1, backgroundColor: '#0A0A0A', paddingTop: insets.top }}>
            <Animated.View entering={FadeInDown.duration(400)} style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24 }}>
                <Text style={{ color: 'white', fontSize: 28, fontWeight: 'bold' }}>Calendar</Text>
            </Animated.View>

            <ScrollView style={{ flex: 1, paddingHorizontal: 16 }} contentContainerStyle={{ paddingBottom: 120 }}>
                {/* Month Navigation */}
                <Animated.View entering={FadeInDown.delay(100).duration(400)} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                    <TouchableOpacity onPress={() => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#111', alignItems: 'center', justifyContent: 'center' }}>
                        <Ionicons name="chevron-back" size={20} color="#6366F1" />
                    </TouchableOpacity>
                    <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>{format(currentDate, 'MMMM yyyy')}</Text>
                    <TouchableOpacity onPress={() => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#111', alignItems: 'center', justifyContent: 'center' }}>
                        <Ionicons name="chevron-forward" size={20} color="#A855F7" />
                    </TouchableOpacity>
                </Animated.View>

                {/* Stats */}
                <Animated.View entering={FadeInDown.delay(150).duration(400)} style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
                    <View style={{ flex: 1, backgroundColor: '#111', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.2)' }}>
                        <Text style={{ color: '#6b7280', fontSize: 10, letterSpacing: 1 }}>COMPLETED</Text>
                        <Text style={{ color: '#10B981', fontSize: 28, fontWeight: 'bold' }}>{completedDays}</Text>
                    </View>
                    <View style={{ flex: 1, backgroundColor: '#111', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.2)' }}>
                        <Text style={{ color: '#6b7280', fontSize: 10, letterSpacing: 1 }}>MISSED</Text>
                        <Text style={{ color: '#EF4444', fontSize: 28, fontWeight: 'bold' }}>{missedDays}</Text>
                    </View>
                </Animated.View>

                {/* Legend */}
                <Animated.View entering={FadeInDown.delay(180).duration(400)} style={{ flexDirection: 'row', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#10B981', marginRight: 6 }} />
                        <Text style={{ color: '#9CA3AF', fontSize: 11 }}>Done</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#F59E0B', marginRight: 6 }} />
                        <Text style={{ color: '#9CA3AF', fontSize: 11 }}>Skipped</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#EF4444', marginRight: 6 }} />
                        <Text style={{ color: '#9CA3AF', fontSize: 11 }}>Missed</Text>
                    </View>
                </Animated.View>

                {/* Calendar Grid */}
                <Animated.View entering={FadeInUp.delay(200).duration(400)} style={{ backgroundColor: '#111', borderRadius: 16, padding: 16 }}>
                    <View style={{ flexDirection: 'row', marginBottom: 12 }}>
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <View key={day} style={{ width: '14.28%', alignItems: 'center' }}>
                                <Text style={{ color: '#6b7280', fontSize: 11 }}>{day}</Text>
                            </View>
                        ))}
                    </View>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                        {emptyDays.map((_, i) => <View key={`e-${i}`} style={{ width: '14.28%', aspectRatio: 1 }} />)}
                        {daysInMonth.map(day => {
                            const { status, progress } = getDayData(day);
                            return (
                                <DayCircle
                                    key={day.toISOString()}
                                    day={parseInt(format(day, 'd'))}
                                    status={status}
                                    progress={progress}
                                    isCurrentDay={isToday(day)}
                                />
                            );
                        })}
                    </View>
                </Animated.View>
            </ScrollView>

            <FloatingTabBar onAddPress={() => router.push('/create')} />
        </View>
    );
}
