import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { Habit } from '../core/types';

interface HabitCardProps {
    habit: Habit;
    longestStreak?: number;
    onEdit?: () => void;
    onDelete?: () => void;
}

// Large odometer digit with peek above and below (matching reference design)
function OdometerDigit({ digit }: { digit: string }) {
    const prevDigit = digit === '0' ? '9' : String(Number(digit) - 1);
    const nextDigit = digit === '9' ? '0' : String(Number(digit) + 1);

    return (
        <View className="items-center" style={{ width: 60 }}>
            {/* Peek above - faded previous digit */}
            <Text
                className="text-5xl font-bold"
                style={{
                    color: 'rgba(255, 255, 255, 0.15)',
                    position: 'absolute',
                    top: -40,
                }}
            >
                {prevDigit}
            </Text>

            {/* Main digit - large and prominent */}
            <Text
                className="text-7xl font-bold"
                style={{ color: 'white' }}
            >
                {digit}
            </Text>

            {/* Peek below - faded next digit */}
            <Text
                className="text-5xl font-bold"
                style={{
                    color: 'rgba(255, 255, 255, 0.15)',
                    position: 'absolute',
                    bottom: -40,
                }}
            >
                {nextDigit}
            </Text>
        </View>
    );
}

export function HabitCard({ habit, longestStreak = 0, onEdit, onDelete }: HabitCardProps) {
    const streakDigits = String(habit.streak).padStart(2, '0').split('');

    const handleDelete = () => {
        Alert.alert(
            'Delete Habit',
            `Are you sure you want to delete "${habit.name}"? This will also delete all related logs.`,
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: onDelete },
            ]
        );
    };

    return (
        <View
            className="rounded-2xl p-5 mb-4 overflow-hidden"
            style={{
                backgroundColor: '#1a1625',
                borderWidth: 1,
                borderColor: 'rgba(98, 54, 255, 0.3)',
            }}
        >
            {/* Edit Goal Button */}
            <TouchableOpacity
                onPress={onEdit}
                className="flex-row items-center mb-4"
            >
                <Ionicons name="pencil-outline" size={16} color="#9ca3af" />
                <Text className="text-gray-400 text-xs ml-2 tracking-widest uppercase" style={{ color: '#9ca3af' }}>
                    EDIT GOAL
                </Text>
            </TouchableOpacity>

            {/* Main Content Row */}
            <View className="flex-row">
                {/* Left Side - Goal Info */}
                <View className="flex-1 justify-between">
                    <View className="mb-6">
                        <Text className="text-gray-500 text-xs tracking-widest uppercase mb-1" style={{ color: '#6b7280' }}>
                            YOUR GOAL
                        </Text>
                        <Text className="text-white text-lg font-bold" style={{ color: 'white' }}>
                            {habit.name.toUpperCase()}
                        </Text>
                    </View>

                    <View className="flex-row justify-between">
                        <View>
                            <Text className="text-gray-500 text-xs tracking-widest uppercase" style={{ color: '#6b7280' }}>
                                LONGEST STREAK
                            </Text>
                            <Text className="text-white text-2xl font-bold" style={{ color: 'white' }}>
                                {longestStreak || habit.streak}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Right Side - Odometer */}
                <View className="items-end justify-center" style={{ height: 120, overflow: 'hidden' }}>
                    <View className="flex-row items-center">
                        {streakDigits.map((digit, index) => (
                            <OdometerDigit key={`${index}-${digit}`} digit={digit} />
                        ))}
                    </View>
                    <Text className="text-gray-500 text-xs tracking-widest uppercase mt-2" style={{ color: '#6b7280' }}>
                        CURRENT STREAK
                    </Text>
                </View>
            </View>

            {/* Delete Button */}
            <TouchableOpacity
                onPress={handleDelete}
                className="absolute top-4 right-4"
            >
                <Ionicons name="trash-outline" size={18} color="#ef4444" />
            </TouchableOpacity>
        </View>
    );
}
