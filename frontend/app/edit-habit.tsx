import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FloatingTabBar } from '../src/components/FloatingTabBar';
import { updateHabit } from '../src/core/db';
import { DayOfWeek, Frequency } from '../src/core/types';
import { useHabitStore } from '../src/store/useHabitStore';

const HABIT_ICONS = [
    { name: 'barbell', label: 'Gym' },
    { name: 'water', label: 'Water' },
    { name: 'book', label: 'Reading' },
    { name: 'bed', label: 'Sleep' },
    { name: 'walk', label: 'Walk' },
    { name: 'bicycle', label: 'Cycling' },
    { name: 'musical-notes', label: 'Music' },
    { name: 'code-slash', label: 'Coding' },
    { name: 'restaurant', label: 'Eating' },
    { name: 'leaf', label: 'Health' },
    { name: 'body', label: 'Stretch' },
    { name: 'flash', label: 'Energy' },
];

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function DayPicker({ selectedDays, onToggle }: { selectedDays: DayOfWeek[]; onToggle: (day: DayOfWeek) => void }) {
    return (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
            {DAY_LABELS.map((label, index) => {
                const isSelected = selectedDays.includes(index as DayOfWeek);
                return (
                    <TouchableOpacity key={label} onPress={() => onToggle(index as DayOfWeek)} style={{ width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: isSelected ? 'rgba(0, 255, 255, 0.2)' : '#1a1a1a', borderWidth: isSelected ? 2 : 1, borderColor: isSelected ? '#6366F1' : '#333' }}>
                        <Text style={{ color: isSelected ? '#6366F1' : '#6b7280', fontSize: 11, fontWeight: 'bold' }}>{label}</Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

export default function EditHabit() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { id } = useLocalSearchParams<{ id: string }>();
    const { habits, initialize } = useHabitStore();

    const habit = habits.find(h => h.id === id);

    const [icon, setIcon] = useState(habit?.icon || 'barbell');
    const [frequency, setFrequency] = useState<Frequency>(habit?.frequency || 'daily');
    const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>(habit?.selectedDays || [0, 1, 2, 3, 4, 5, 6]);
    const [effort, setEffort] = useState(habit?.effortRating || 1);
    const [timeWindow, setTimeWindow] = useState(habit?.timeWindow || 'morning');

    useEffect(() => {
        if (habit) {
            setIcon(habit.icon || 'barbell');
            setFrequency(habit.frequency);
            setSelectedDays(habit.selectedDays || [0, 1, 2, 3, 4, 5, 6]);
            setEffort(habit.effortRating);
            setTimeWindow(habit.timeWindow);
        }
    }, [habit]);

    const toggleDay = (day: DayOfWeek) => {
        if (selectedDays.includes(day)) {
            setSelectedDays(selectedDays.filter(d => d !== day));
        } else {
            setSelectedDays([...selectedDays, day].sort());
        }
    };

    const setPreset = (preset: 'weekdays' | 'weekends') => {
        if (preset === 'weekdays') setSelectedDays([1, 2, 3, 4, 5]);
        else setSelectedDays([0, 6]);
    };

    const handleSave = async () => {
        if (!id) return;
        if (frequency === 'custom' && selectedDays.length === 0) {
            Alert.alert('Error', 'Please select at least one day'); return;
        }

        const finalDays = frequency === 'daily' ? [0, 1, 2, 3, 4, 5, 6] as DayOfWeek[] :
            frequency === 'weekly' ? [1] as DayOfWeek[] :
                selectedDays;

        await updateHabit(id, { icon, frequency, selectedDays: finalDays, effortRating: effort, timeWindow });
        await initialize();
        router.back();
    };

    if (!habit) {
        return (
            <View style={{ flex: 1, backgroundColor: '#0A0A0A', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: '#6b7280' }}>Habit not found</Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#0A0A0A', paddingTop: insets.top }}>
            <Animated.View entering={FadeInDown.duration(400)} style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 16 }}>
                <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
                    <Ionicons name="close" size={24} color="white" />
                </TouchableOpacity>
                <Text style={{ color: 'white', fontSize: 22, fontWeight: 'bold' }}>Edit {habit.name}</Text>
            </Animated.View>

            <ScrollView style={{ flex: 1, paddingHorizontal: 16 }} contentContainerStyle={{ paddingBottom: 120 }}>
                {/* Icon Selection */}
                <Animated.View entering={FadeInDown.delay(100).duration(400)} style={{ backgroundColor: '#111', borderRadius: 16, padding: 20, marginBottom: 16 }}>
                    <Text style={{ color: '#6b7280', fontSize: 10, letterSpacing: 2, marginBottom: 12 }}>CHANGE ICON</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                        {HABIT_ICONS.map((item) => (
                            <TouchableOpacity key={item.name} onPress={() => setIcon(item.name)} style={{ width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', backgroundColor: icon === item.name ? 'rgba(0, 255, 255, 0.15)' : '#1a1a1a', borderWidth: icon === item.name ? 2 : 1, borderColor: icon === item.name ? '#6366F1' : '#333' }}>
                                <Ionicons name={item.name as any} size={22} color={icon === item.name ? '#6366F1' : '#9ca3af'} />
                            </TouchableOpacity>
                        ))}
                    </View>
                </Animated.View>

                {/* Frequency */}
                <Animated.View entering={FadeInDown.delay(150).duration(400)} style={{ backgroundColor: '#111', borderRadius: 16, padding: 20, marginBottom: 16 }}>
                    <Text style={{ color: '#6b7280', fontSize: 10, letterSpacing: 2, marginBottom: 12 }}>FREQUENCY</Text>
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                        {[
                            { key: 'daily', label: 'Daily' },
                            { key: 'custom', label: 'Custom Days' },
                            { key: 'weekly', label: 'Weekly' },
                        ].map((f) => (
                            <TouchableOpacity key={f.key} onPress={() => setFrequency(f.key as Frequency)} style={{ paddingHorizontal: 16, paddingVertical: 12, borderRadius: 20, backgroundColor: frequency === f.key ? 'rgba(255, 0, 255, 0.15)' : '#1a1a1a', borderWidth: 1, borderColor: frequency === f.key ? '#A855F7' : '#333' }}>
                                <Text style={{ color: frequency === f.key ? '#A855F7' : '#9ca3af', fontSize: 13 }}>{f.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {frequency === 'custom' && (
                        <>
                            <View style={{ flexDirection: 'row', gap: 8, marginTop: 16 }}>
                                <TouchableOpacity onPress={() => setPreset('weekdays')} style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, backgroundColor: '#222' }}>
                                    <Text style={{ color: '#6b7280', fontSize: 11 }}>Weekdays</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setPreset('weekends')} style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, backgroundColor: '#222' }}>
                                    <Text style={{ color: '#6b7280', fontSize: 11 }}>Weekends</Text>
                                </TouchableOpacity>
                            </View>
                            <DayPicker selectedDays={selectedDays} onToggle={toggleDay} />
                        </>
                    )}
                </Animated.View>

                {/* Effort Rating */}
                <Animated.View entering={FadeInUp.delay(200).duration(400)} style={{ backgroundColor: '#111', borderRadius: 16, padding: 20, marginBottom: 16 }}>
                    <Text style={{ color: '#6b7280', fontSize: 10, letterSpacing: 2, marginBottom: 12 }}>EFFORT RATING</Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        {[1, 2, 3, 4, 5].map((r) => (
                            <TouchableOpacity key={r} onPress={() => setEffort(r)} style={{ width: 54, height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center', backgroundColor: effort === r ? 'rgba(0, 255, 255, 0.15)' : '#1a1a1a', borderWidth: effort === r ? 2 : 1, borderColor: effort === r ? '#6366F1' : '#333' }}>
                                <Text style={{ color: effort === r ? '#6366F1' : 'white', fontWeight: 'bold', fontSize: 18 }}>{r}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </Animated.View>

                {/* Time Window */}
                <Animated.View entering={FadeInUp.delay(250).duration(400)} style={{ backgroundColor: '#111', borderRadius: 16, padding: 20, marginBottom: 24 }}>
                    <Text style={{ color: '#6b7280', fontSize: 10, letterSpacing: 2, marginBottom: 12 }}>TIME WINDOW</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                        {['morning', 'afternoon', 'evening', 'anytime'].map((t) => (
                            <TouchableOpacity key={t} onPress={() => setTimeWindow(t)} style={{ paddingHorizontal: 18, paddingVertical: 12, borderRadius: 20, backgroundColor: timeWindow === t ? 'rgba(255, 0, 255, 0.15)' : '#1a1a1a', borderWidth: 1, borderColor: timeWindow === t ? '#A855F7' : '#333' }}>
                                <Text style={{ color: timeWindow === t ? '#A855F7' : '#9ca3af' }}>{t.charAt(0).toUpperCase() + t.slice(1)}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </Animated.View>

                {/* Save Button */}
                <Animated.View entering={FadeInUp.delay(300).duration(400)}>
                    <TouchableOpacity onPress={handleSave}>
                        <LinearGradient colors={['#6366F1', '#A855F7'] as const} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ padding: 18, borderRadius: 16, alignItems: 'center' }}>
                            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>SAVE CHANGES</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </Animated.View>
            </ScrollView>

            <FloatingTabBar onAddPress={() => router.push('/create' as any)} />
        </View>
    );
}
