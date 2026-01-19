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

const OdometerDigit = memo(function OdometerDigit({ digit }: { digit: string }) {
    const prevDigit = digit === '0' ? '9' : String(Number(digit) - 1);
    const nextDigit = digit === '9' ? '0' : String(Number(digit) + 1);

    return (
        <View style={{ alignItems: 'center', width: 65, height: 120, justifyContent: 'center' }}>
            <Text style={{ fontSize: 50, fontWeight: 'bold', color: 'rgba(0, 255, 255, 0.15)', position: 'absolute', top: -15 }}>{prevDigit}</Text>
            <Text style={{ fontSize: 90, fontWeight: 'bold', color: 'white', letterSpacing: -2 }}>{digit}</Text>
            <Text style={{ fontSize: 50, fontWeight: 'bold', color: 'rgba(255, 0, 255, 0.15)', position: 'absolute', bottom: -15 }}>{nextDigit}</Text>
        </View>
    );
});

function HabitCardComponent({ habit, longestStreak = 0, onEdit, onDelete }: HabitCardProps) {
    const streakDigits = String(habit.streak).padStart(2, '0').split('');

    const handleDelete = () => {
        Alert.alert('Delete Habit', `Are you sure you want to delete "${habit.name}"?`, [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: onDelete },
        ]);
    };

    return (
        <View style={{ backgroundColor: '#111', borderRadius: 20, padding: 24, marginBottom: 16, borderWidth: 1, borderColor: '#222' }}>
            <TouchableOpacity onPress={onEdit} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 40 }}>
                <Ionicons name="pencil-outline" size={16} color="#00FFFF" />
                <Text style={{ color: '#00FFFF', fontSize: 13, marginLeft: 10, letterSpacing: 3 }}>EDIT GOAL</Text>
            </TouchableOpacity>

            <View style={{ flexDirection: 'row' }}>
                <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                    <View style={{ marginBottom: 50 }}>
                        <Text style={{ color: '#6b7280', fontSize: 11, letterSpacing: 2, marginBottom: 6 }}>YOUR GOAL</Text>
                        <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 }}>{habit.name.toUpperCase()}</Text>
                    </View>
                    <View>
                        <Text style={{ color: '#6b7280', fontSize: 11, letterSpacing: 2, marginBottom: 4 }}>LONGEST STREAK</Text>
                        <Text style={{ color: '#FF00FF', fontSize: 28, fontWeight: 'bold' }}>{longestStreak || habit.streak}</Text>
                    </View>
                </View>

                <View style={{ alignItems: 'flex-end', justifyContent: 'center' }}>
                    <View style={{ height: 140, overflow: 'hidden', justifyContent: 'center' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            {streakDigits.map((digit, index) => <OdometerDigit key={`${index}-${digit}`} digit={digit} />)}
                        </View>
                    </View>
                    <Text style={{ color: '#00FFFF', fontSize: 11, letterSpacing: 2, marginTop: 8 }}>CURRENT STREAK</Text>
                </View>
            </View>

            <TouchableOpacity onPress={handleDelete} style={{ position: 'absolute', top: 20, right: 20, backgroundColor: 'rgba(255, 0, 255, 0.1)', padding: 8, borderRadius: 8 }}>
                <Ionicons name="trash-outline" size={16} color="#FF00FF" />
            </TouchableOpacity>
        </View>
    );
}

export const HabitCard = memo(HabitCardComponent);
