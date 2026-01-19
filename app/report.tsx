import { Ionicons } from '@expo/vector-icons';
import { eachDayOfInterval, format, subDays } from 'date-fns';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Dimensions, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, Stop, LinearGradient as SvgGradient } from 'react-native-svg';
import { FloatingTabBar } from '../src/components/FloatingTabBar';
import { getAllLogs } from '../src/core/db';
import { HabitLog } from '../src/core/types';
import { useHabitStore } from '../src/store/useHabitStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Circular progress component with gradient
function CircularProgress({ progress, size = 180, icon = 'barbell' }: { progress: number; size?: number; icon?: string }) {
    const strokeWidth = 8;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference * (1 - progress);

    return (
        <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
            <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
                <Defs>
                    <SvgGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <Stop offset="0%" stopColor="#00FFFF" />
                        <Stop offset="100%" stopColor="#FF00FF" />
                    </SvgGradient>
                </Defs>
                <Circle cx={size / 2} cy={size / 2} r={radius} stroke="rgba(255, 255, 255, 0.1)" strokeWidth={strokeWidth} fill="transparent" />
                <Circle cx={size / 2} cy={size / 2} r={radius} stroke="url(#progressGradient)" strokeWidth={strokeWidth} fill="transparent" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" />
            </Svg>
            <View style={{ position: 'absolute', width: size - 40, height: size - 40, borderRadius: (size - 40) / 2, backgroundColor: '#111', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#222' }}>
                <Ionicons name={icon as any} size={40} color="#00FFFF" />
            </View>
        </View>
    );
}

// Date picker item
function DatePickerItem({ date, isSelected, completions }: { date: Date; isSelected: boolean; completions: number }) {
    const progress = Math.min(completions / 5, 1); // Max 5 completions for full ring
    const size = isSelected ? 50 : 44;
    const strokeWidth = 3;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference * (1 - progress);

    return (
        <View style={{ alignItems: 'center', marginHorizontal: 8 }}>
            <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
                <Svg width={size} height={size} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
                    <Defs>
                        <SvgGradient id={`dayGradient${date.getDate()}`} x1="0%" y1="0%" x2="100%" y2="0%">
                            <Stop offset="0%" stopColor="#00FFFF" />
                            <Stop offset="100%" stopColor="#FF00FF" />
                        </SvgGradient>
                    </Defs>
                    <Circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke={isSelected ? "url(#dayGradient" + date.getDate() + ")" : "rgba(255, 255, 255, 0.2)"}
                        strokeWidth={strokeWidth}
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={isSelected ? 0 : strokeDashoffset}
                        strokeLinecap="round"
                    />
                </Svg>
                <Text style={{ color: isSelected ? 'white' : '#6b7280', fontSize: isSelected ? 16 : 14, fontWeight: isSelected ? 'bold' : 'normal' }}>
                    {format(date, 'd')}
                </Text>
            </View>
        </View>
    );
}

// Bar chart bar
function HistoryBar({ value, maxValue, label, color }: { value: number; maxValue: number; label: string; color: 'pink' | 'cyan' }) {
    const height = maxValue > 0 ? (value / maxValue) * 100 : 0;
    const gradientColors: readonly [string, string] = color === 'pink' ? ['#FF00FF', '#FF69B4'] : ['#00CED1', '#00FFFF'];

    return (
        <View style={{ alignItems: 'center', flex: 1 }}>
            <View style={{ height: 120, justifyContent: 'flex-end', alignItems: 'center' }}>
                <LinearGradient
                    colors={gradientColors}
                    style={{
                        width: 8,
                        height: Math.max(height, 4),
                        borderRadius: 4,
                    }}
                />
            </View>
            <Text style={{ color: '#6b7280', fontSize: 11, marginTop: 8 }}>{label}</Text>
        </View>
    );
}

export default function StatisticsScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { habits, suggestions } = useHabitStore();
    const [allLogs, setAllLogs] = useState<HabitLog[]>([]);
    const [selectedHabitIndex, setSelectedHabitIndex] = useState(0);

    const selectedHabit = habits[selectedHabitIndex];

    useEffect(() => {
        getAllLogs().then(setAllLogs).catch(() => setAllLogs([]));
    }, []);

    // Generate last 5 days for the date picker
    const today = new Date();
    const dateDays = eachDayOfInterval({ start: subDays(today, 2), end: subDays(today, -2) });

    // Get completions for selected habit
    const getCompletionsForDay = (date: Date) => {
        const dayStart = new Date(date);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = dayStart.getTime() + 24 * 60 * 60 * 1000;

        return allLogs.filter(
            log => log.timestamp >= dayStart.getTime() &&
                log.timestamp < dayEnd &&
                log.status === 'completed' &&
                (!selectedHabit || log.habitId === selectedHabit.id)
        ).length;
    };

    // Weekly history data
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weekData = weekDays.map((day, i) => {
        const date = subDays(today, (today.getDay() - i + 7) % 7);
        return getCompletionsForDay(date);
    });
    const maxCompletions = Math.max(...weekData, 1);

    // Calculate overall progress for selected habit
    const weeklyCompletions = selectedHabit
        ? allLogs.filter(l => l.habitId === selectedHabit.id && l.status === 'completed' && l.timestamp >= subDays(today, 7).getTime()).length
        : 0;
    const progress = Math.min(weeklyCompletions / 7, 1);

    // Get suggestion for selected habit
    const habitSuggestion = selectedHabit
        ? suggestions.find(s => s.habitId === selectedHabit.id)
        : null;

    const motivationalText = habitSuggestion?.reason || (selectedHabit
        ? progress >= 0.7
            ? `Great job! You're keeping up with ${selectedHabit.name.toLowerCase()}.`
            : `You were almost there, keep pushing to build your ${selectedHabit.name.toLowerCase()} habit.`
        : 'Select a habit to view statistics');

    return (
        <View style={{ flex: 1, backgroundColor: '#0A0A0A', paddingTop: insets.top }}>
            {/* Header */}
            <View style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24 }}>
                <Text style={{ color: 'white', fontSize: 28, fontWeight: 'bold' }}>Statistics</Text>
            </View>

            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 120 }}>
                {/* Date Picker */}
                <View style={{ flexDirection: 'row', justifyContent: 'center', paddingHorizontal: 24, marginBottom: 40 }}>
                    {dateDays.map((date, index) => (
                        <DatePickerItem
                            key={date.toISOString()}
                            date={date}
                            isSelected={index === 2}
                            completions={getCompletionsForDay(date)}
                        />
                    ))}
                </View>

                {/* Circular Progress */}
                <View style={{ alignItems: 'center', marginBottom: 24 }}>
                    <CircularProgress progress={progress} size={180} icon={selectedHabit?.icon || 'barbell'} />
                </View>

                {/* Habit Name */}
                <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 16 }}>
                    {selectedHabit?.name || 'No Habit Selected'}
                </Text>

                {/* Motivational Text */}
                <Text style={{ color: '#6b7280', fontSize: 14, textAlign: 'center', paddingHorizontal: 40, marginBottom: 40, lineHeight: 22 }}>
                    {motivationalText}
                </Text>

                {/* Habit Selector */}
                {habits.length > 1 && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 32, paddingHorizontal: 24 }}>
                        {habits.map((habit, index) => (
                            <TouchableOpacity
                                key={habit.id}
                                onPress={() => setSelectedHabitIndex(index)}
                                style={{
                                    paddingHorizontal: 16,
                                    paddingVertical: 8,
                                    marginRight: 12,
                                    borderRadius: 20,
                                    backgroundColor: index === selectedHabitIndex ? 'rgba(0, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                                    borderWidth: 1,
                                    borderColor: index === selectedHabitIndex ? '#00FFFF' : 'rgba(255, 255, 255, 0.1)',
                                }}
                            >
                                <Text style={{ color: index === selectedHabitIndex ? '#00FFFF' : '#9ca3af', fontSize: 13 }}>
                                    {habit.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                )}

                {/* Weekly Progress */}
                <View style={{ paddingHorizontal: 24 }}>
                    <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 24 }}>
                        Weekly progress
                    </Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        {weekDays.map((day, index) => (
                            <HistoryBar
                                key={day}
                                value={weekData[index]}
                                maxValue={maxCompletions}
                                label={day}
                                color={index < 4 ? 'pink' : 'cyan'}
                            />
                        ))}
                    </View>
                </View>
            </ScrollView>

            <FloatingTabBar onAddPress={() => router.push('/create')} />
        </View>
    );
}
