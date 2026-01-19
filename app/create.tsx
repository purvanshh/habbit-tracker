import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FloatingTabBar } from '../src/components/FloatingTabBar';
import { Frequency } from '../src/core/types';
import { useHabitStore } from '../src/store/useHabitStore';

export default function CreateHabit() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const addHabit = useHabitStore(s => s.addHabit);
    const [name, setName] = useState('');
    const [frequency, setFrequency] = useState<Frequency>('daily');
    const [effort, setEffort] = useState(1);
    const [timeWindow, setTimeWindow] = useState('morning');

    const handleCreate = async () => {
        if (!name.trim()) { Alert.alert('Error', 'Please enter a habit name'); return; }
        await addHabit(name, frequency, effort, timeWindow);
        router.back();
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#0A0A0A', paddingTop: insets.top }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 16 }}>
                <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
                    <Ionicons name="close" size={24} color="white" />
                </TouchableOpacity>
                <Text style={{ color: 'white', fontSize: 22, fontWeight: 'bold' }}>New Habit</Text>
            </View>

            <ScrollView style={{ flex: 1, paddingHorizontal: 16 }} contentContainerStyle={{ paddingBottom: 120 }}>
                <View style={{ backgroundColor: '#111', borderRadius: 16, padding: 20, marginBottom: 16 }}>
                    <Text style={{ color: '#6b7280', fontSize: 10, letterSpacing: 2, marginBottom: 12 }}>HABIT NAME</Text>
                    <TextInput
                        style={{ backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#333', borderRadius: 12, padding: 16, color: 'white', fontSize: 16 }}
                        placeholder="e.g. Read 10 pages"
                        placeholderTextColor="#6b7280"
                        value={name}
                        onChangeText={setName}
                    />
                </View>

                <View style={{ backgroundColor: '#111', borderRadius: 16, padding: 20, marginBottom: 16 }}>
                    <Text style={{ color: '#6b7280', fontSize: 10, letterSpacing: 2, marginBottom: 12 }}>FREQUENCY</Text>
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                        {['daily', 'weekdays', 'weekly'].map((f) => (
                            <TouchableOpacity key={f} onPress={() => setFrequency(f as Frequency)} style={{ paddingHorizontal: 18, paddingVertical: 12, borderRadius: 20, backgroundColor: frequency === f ? 'rgba(255, 0, 255, 0.15)' : '#1a1a1a', borderWidth: 1, borderColor: frequency === f ? '#FF00FF' : '#333' }}>
                                <Text style={{ color: frequency === f ? '#FF00FF' : '#9ca3af' }}>{f.charAt(0).toUpperCase() + f.slice(1)}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={{ backgroundColor: '#111', borderRadius: 16, padding: 20, marginBottom: 16 }}>
                    <Text style={{ color: '#6b7280', fontSize: 10, letterSpacing: 2, marginBottom: 12 }}>EFFORT RATING</Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        {[1, 2, 3, 4, 5].map((r) => (
                            <TouchableOpacity key={r} onPress={() => setEffort(r)} style={{ width: 54, height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center', backgroundColor: effort === r ? 'rgba(0, 255, 255, 0.15)' : '#1a1a1a', borderWidth: effort === r ? 2 : 1, borderColor: effort === r ? '#00FFFF' : '#333' }}>
                                <Text style={{ color: effort === r ? '#00FFFF' : 'white', fontWeight: 'bold', fontSize: 18 }}>{r}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={{ backgroundColor: '#111', borderRadius: 16, padding: 20, marginBottom: 24 }}>
                    <Text style={{ color: '#6b7280', fontSize: 10, letterSpacing: 2, marginBottom: 12 }}>TIME WINDOW</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                        {['morning', 'afternoon', 'evening', 'anytime'].map((t) => (
                            <TouchableOpacity key={t} onPress={() => setTimeWindow(t)} style={{ paddingHorizontal: 18, paddingVertical: 12, borderRadius: 20, backgroundColor: timeWindow === t ? 'rgba(255, 0, 255, 0.15)' : '#1a1a1a', borderWidth: 1, borderColor: timeWindow === t ? '#FF00FF' : '#333' }}>
                                <Text style={{ color: timeWindow === t ? '#FF00FF' : '#9ca3af' }}>{t.charAt(0).toUpperCase() + t.slice(1)}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <TouchableOpacity onPress={handleCreate}>
                    <LinearGradient colors={['#00FFFF', '#FF00FF'] as const} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ padding: 18, borderRadius: 16, alignItems: 'center' }}>
                        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>CREATE HABIT</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </ScrollView>

            <FloatingTabBar onAddPress={() => { }} />
        </View>
    );
}
