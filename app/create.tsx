import { Ionicons } from '@expo/vector-icons';
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
        if (!name.trim()) {
            Alert.alert('Error', 'Please enter a habit name');
            return;
        }

        try {
            await addHabit(name, frequency, effort, timeWindow);
            router.back();
        } catch (e) {
            Alert.alert('Error', 'Failed to create habit');
        }
    };

    const GlassCard = ({ children, style }: { children: React.ReactNode; style?: any }) => (
        <View
            style={[{
                backgroundColor: 'rgba(30, 30, 40, 0.6)',
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: 16,
                padding: 16,
            }, style]}
        >
            {children}
        </View>
    );

    return (
        <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
            <View className="flex-row items-center mb-6 px-4">
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    <Ionicons name="close" size={24} color="white" />
                </TouchableOpacity>
                <Text className="text-white text-xl font-bold font-sans" style={{ color: 'white' }}>New Habit</Text>
            </View>

            <ScrollView className="px-4" contentContainerStyle={{ paddingBottom: 120 }}>
                {/* Name Input */}
                <GlassCard style={{ marginBottom: 16 }}>
                    <Text className="text-gray-400 mb-2 text-xs tracking-widest uppercase" style={{ color: '#9ca3af' }}>
                        HABIT NAME
                    </Text>
                    <TextInput
                        style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            borderWidth: 1,
                            borderColor: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: 12,
                            padding: 16,
                            color: 'white',
                            fontSize: 16,
                        }}
                        placeholder="e.g. Read 10 pages"
                        placeholderTextColor="#6b7280"
                        value={name}
                        onChangeText={setName}
                    />
                </GlassCard>

                {/* Frequency */}
                <GlassCard style={{ marginBottom: 16 }}>
                    <Text className="text-gray-400 mb-3 text-xs tracking-widest uppercase" style={{ color: '#9ca3af' }}>
                        FREQUENCY
                    </Text>
                    <View className="flex-row gap-2">
                        {['daily', 'weekdays', 'weekly'].map((f) => (
                            <TouchableOpacity
                                key={f}
                                onPress={() => setFrequency(f as Frequency)}
                                style={{
                                    paddingHorizontal: 16,
                                    paddingVertical: 10,
                                    borderRadius: 10,
                                    backgroundColor: frequency === f ? '#6236FF' : 'rgba(255, 255, 255, 0.05)',
                                    borderWidth: 1,
                                    borderColor: frequency === f ? '#6236FF' : 'rgba(255, 255, 255, 0.1)',
                                }}
                            >
                                <Text style={{ color: frequency === f ? 'white' : '#9ca3af', fontWeight: frequency === f ? 'bold' : 'normal' }}>
                                    {f.charAt(0).toUpperCase() + f.slice(1)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </GlassCard>

                {/* Effort Rating */}
                <GlassCard style={{ marginBottom: 16 }}>
                    <Text className="text-gray-400 mb-3 text-xs tracking-widest uppercase" style={{ color: '#9ca3af' }}>
                        EFFORT RATING
                    </Text>
                    <View className="flex-row justify-between">
                        {[1, 2, 3, 4, 5].map((r) => (
                            <TouchableOpacity
                                key={r}
                                onPress={() => setEffort(r)}
                                style={{
                                    width: 50,
                                    height: 50,
                                    borderRadius: 25,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: effort === r ? '#6236FF' : 'rgba(255, 255, 255, 0.05)',
                                    borderWidth: effort === r ? 0 : 1,
                                    borderColor: 'rgba(255, 255, 255, 0.1)',
                                }}
                            >
                                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>{r}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </GlassCard>

                {/* Time Window */}
                <GlassCard style={{ marginBottom: 24 }}>
                    <Text className="text-gray-400 mb-3 text-xs tracking-widest uppercase" style={{ color: '#9ca3af' }}>
                        TIME WINDOW
                    </Text>
                    <View className="flex-row flex-wrap gap-2">
                        {['morning', 'afternoon', 'evening', 'anytime'].map((t) => (
                            <TouchableOpacity
                                key={t}
                                onPress={() => setTimeWindow(t)}
                                style={{
                                    paddingHorizontal: 16,
                                    paddingVertical: 10,
                                    borderRadius: 10,
                                    backgroundColor: timeWindow === t ? '#6236FF' : 'rgba(255, 255, 255, 0.05)',
                                    borderWidth: 1,
                                    borderColor: timeWindow === t ? '#6236FF' : 'rgba(255, 255, 255, 0.1)',
                                }}
                            >
                                <Text style={{ color: timeWindow === t ? 'white' : '#9ca3af', fontWeight: timeWindow === t ? 'bold' : 'normal' }}>
                                    {t.charAt(0).toUpperCase() + t.slice(1)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </GlassCard>

                {/* Create Button */}
                <TouchableOpacity
                    onPress={handleCreate}
                    style={{
                        backgroundColor: '#6236FF',
                        padding: 18,
                        borderRadius: 16,
                        alignItems: 'center',
                        shadowColor: '#6236FF',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.4,
                        shadowRadius: 12,
                    }}
                >
                    <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>CREATE HABIT</Text>
                </TouchableOpacity>
            </ScrollView>

            <FloatingTabBar onAddPress={() => { }} />
        </View>
    );
}
