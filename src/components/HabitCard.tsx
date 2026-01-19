import { Ionicons } from '@expo/vector-icons';
import React, { memo } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { Habit } from '../core/types';

interface HabitCardProps {
    habit: Habit;
    longestStreak?: number;
    onEdit?: () => void;
    onDelete?: () => void;
}

// Memoized odometer digit
const OdometerDigit = memo(function OdometerDigit({ digit }: { digit: string }) {
    const prevDigit = digit === '0' ? '9' : String(Number(digit) - 1);
    const nextDigit = digit === '9' ? '0' : String(Number(digit) + 1);

    return (
        <View style={{ alignItems: 'center', width: 55 }}>
            <Text
                style={{
                    fontSize: 40,
                    fontWeight: 'bold',
                    color: 'rgba(255, 255, 255, 0.12)',
                    position: 'absolute',
                    top: -35,
                }}
            >
                {prevDigit}
            </Text>
            <Text
                style={{
                    fontSize: 64,
                    fontWeight: 'bold',
                    color: 'white',
                }}
            >
                {digit}
            </Text>
            <Text
                style={{
                    fontSize: 40,
                    fontWeight: 'bold',
                    color: 'rgba(255, 255, 255, 0.12)',
                    position: 'absolute',
                    bottom: -35,
                }}
            >
                {nextDigit}
            </Text>
        </View>
    );
});

function HabitCardComponent({ habit, longestStreak = 0, onEdit, onDelete }: HabitCardProps) {
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
            style={{
                backgroundColor: 'rgba(30, 20, 50, 0.7)',
                borderWidth: 1,
                borderColor: 'rgba(98, 54, 255, 0.3)',
                borderRadius: 16,
                padding: 20,
                marginBottom: 16,
                overflow: 'hidden',
            }}
        >
            <View
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 60,
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                }}
            />

            <TouchableOpacity
                onPress={onEdit}
                style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}
            >
                <Ionicons name="pencil-outline" size={14} color="#9ca3af" />
                <Text style={{ color: '#9ca3af', fontSize: 10, marginLeft: 8, letterSpacing: 2 }}>
                    EDIT GOAL
                </Text>
            </TouchableOpacity>

            <View style={{ flexDirection: 'row' }}>
                <View style={{ flex: 1, justifyContent: 'space-between' }}>
                    <View style={{ marginBottom: 24 }}>
                        <Text style={{ color: '#6b7280', fontSize: 10, letterSpacing: 2, marginBottom: 4 }}>
                            YOUR GOAL
                        </Text>
                        <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>
                            {habit.name.toUpperCase()}
                        </Text>
                    </View>

                    <View>
                        <Text style={{ color: '#6b7280', fontSize: 10, letterSpacing: 2 }}>
                            LONGEST STREAK
                        </Text>
                        <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>
                            {longestStreak || habit.streak}
                        </Text>
                    </View>
                </View>

                <View style={{ alignItems: 'flex-end', justifyContent: 'center', height: 100, overflow: 'hidden' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        {streakDigits.map((digit, index) => (
                            <OdometerDigit key={`${index}-${digit}`} digit={digit} />
                        ))}
                    </View>
                    <Text style={{ color: '#6b7280', fontSize: 10, letterSpacing: 2, marginTop: 4 }}>
                        CURRENT STREAK
                    </Text>
                </View>
            </View>

            <TouchableOpacity
                onPress={handleDelete}
                style={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    padding: 8,
                    borderRadius: 8,
                }}
            >
                <Ionicons name="trash-outline" size={16} color="#ef4444" />
            </TouchableOpacity>
        </View>
    );
}

export const HabitCard = memo(HabitCardComponent);
