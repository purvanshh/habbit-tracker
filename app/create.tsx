import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Frequency } from '../src/core/types';
import { cn } from '../src/lib/utils';
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

    return (
        <View className="flex-1 bg-background px-4" style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
            <View className="flex-row items-center mb-6">
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    <Ionicons name="close" size={24} color="white" />
                </TouchableOpacity>
                <Text className="text-white text-xl font-bold font-sans">New Habit</Text>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
                {/* Name Input */}
                <View className="mb-6">
                    <Text className="text-gray-400 mb-2 font-sans">HABIT NAME</Text>
                    <TextInput
                        className="bg-card text-white p-4 rounded-xl border border-white/10"
                        placeholder="e.g. Read 10 pages"
                        placeholderTextColor="#666"
                        value={name}
                        onChangeText={setName}
                    />
                </View>

                {/* Frequency */}
                <View className="mb-6">
                    <Text className="text-gray-400 mb-2 font-sans">FREQUENCY</Text>
                    <View className="flex-row gap-2">
                        {['daily', 'weekdays', 'weekly'].map((f) => (
                            <TouchableOpacity
                                key={f}
                                onPress={() => setFrequency(f as Frequency)}
                                className={cn(
                                    "px-4 py-2 rounded-lg border",
                                    frequency === f ? "bg-primary border-primary" : "bg-card border-white/10"
                                )}
                            >
                                <Text className={frequency === f ? "text-white font-bold" : "text-gray-400"}>
                                    {f.charAt(0).toUpperCase() + f.slice(1)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Effort Rating */}
                <View className="mb-6">
                    <Text className="text-gray-400 mb-2 font-sans">EFFORT RATING (1-5)</Text>
                    <View className="flex-row justify-between bg-card p-4 rounded-xl border border-white/10">
                        {[1, 2, 3, 4, 5].map((r) => (
                            <TouchableOpacity
                                key={r}
                                onPress={() => setEffort(r)}
                                className={cn(
                                    "w-10 h-10 rounded-full items-center justify-center",
                                    effort === r ? "bg-primary" : "bg-secondary"
                                )}
                            >
                                <Text className="text-white font-bold">{r}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Time Window */}
                <View className="mb-8">
                    <Text className="text-gray-400 mb-2 font-sans">TIME WINDOW</Text>
                    <View className="flex-row gap-2 flex-wrap">
                        {['morning', 'afternoon', 'evening', 'anytime'].map((t) => (
                            <TouchableOpacity
                                key={t}
                                onPress={() => setTimeWindow(t)}
                                className={cn(
                                    "px-4 py-2 rounded-lg border",
                                    timeWindow === t ? "bg-primary border-primary" : "bg-card border-white/10"
                                )}
                            >
                                <Text className={timeWindow === t ? "text-white font-bold" : "text-gray-400"}>
                                    {t.charAt(0).toUpperCase() + t.slice(1)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <TouchableOpacity
                    onPress={handleCreate}
                    className="bg-primary p-4 rounded-xl items-center"
                >
                    <Text className="text-white font-bold font-sans text-lg">CREATE HABIT</Text>
                </TouchableOpacity>

            </ScrollView>
        </View>
    );
}
