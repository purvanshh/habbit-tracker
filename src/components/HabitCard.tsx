import { Ionicons } from '@expo/vector-icons';
import React, { memo, useEffect, useState } from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
    Easing,
    FadeInDown,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withSequence,
    withSpring,
    withTiming
} from 'react-native-reanimated';
import { Habit } from '../core/types';

interface HabitCardProps {
    habit: Habit;
    longestStreak?: number;
    onEdit?: () => void;
    onDelete?: () => void;
}

// Custom themed dialog
function DeleteDialog({ visible, habitName, onCancel, onConfirm }: { visible: boolean; habitName: string; onCancel: () => void; onConfirm: () => void }) {
    const scale = useSharedValue(0.8);
    const opacity = useSharedValue(0);

    useEffect(() => {
        if (visible) {
            scale.value = withSpring(1, { damping: 12 });
            opacity.value = withTiming(1, { duration: 200 });
        } else {
            scale.value = withTiming(0.8, { duration: 150 });
            opacity.value = withTiming(0, { duration: 150 });
        }
    }, [visible]);

    const containerStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
    }));

    return (
        <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
            <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.8)', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
                <Animated.View style={[{ width: '100%', maxWidth: 320, backgroundColor: '#111', borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: '#222' }, containerStyle]}>
                    {/* Header */}
                    <View style={{ alignItems: 'center', paddingTop: 32, paddingBottom: 16 }}>
                        <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255, 0, 255, 0.15)', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                            <Ionicons name="trash" size={28} color="#FF00FF" />
                        </View>
                        <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>Delete Habit</Text>
                    </View>

                    {/* Message */}
                    <View style={{ paddingHorizontal: 24, paddingBottom: 24 }}>
                        <Text style={{ color: '#9ca3af', fontSize: 14, textAlign: 'center', lineHeight: 22 }}>
                            Are you sure you want to delete{'\n'}
                            <Text style={{ color: '#00FFFF', fontWeight: 'bold' }}>"{habitName}"</Text>?{'\n'}
                            This action cannot be undone.
                        </Text>
                    </View>

                    {/* Buttons */}
                    <View style={{ flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#222' }}>
                        <TouchableOpacity onPress={onCancel} style={{ flex: 1, paddingVertical: 16, alignItems: 'center', borderRightWidth: 1, borderRightColor: '#222' }}>
                            <Text style={{ color: '#6b7280', fontSize: 16, fontWeight: '600' }}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={onConfirm} style={{ flex: 1, paddingVertical: 16, alignItems: 'center' }}>
                            <Text style={{ color: '#FF00FF', fontSize: 16, fontWeight: '600' }}>Delete</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
}

const OdometerDigit = memo(function OdometerDigit({ digit, index }: { digit: string; index: number }) {
    const prevDigit = digit === '0' ? '9' : String(Number(digit) - 1);
    const nextDigit = digit === '9' ? '0' : String(Number(digit) + 1);

    const scale = useSharedValue(0.8);
    const opacity = useSharedValue(0);

    useEffect(() => {
        scale.value = withDelay(index * 100, withSpring(1, { damping: 12, stiffness: 100 }));
        opacity.value = withDelay(index * 100, withTiming(1, { duration: 400 }));
    }, [digit]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
    }));

    return (
        <Animated.View style={[{ alignItems: 'center', width: 65, height: 120, justifyContent: 'center' }, animatedStyle]}>
            <Text style={{ fontSize: 50, fontWeight: 'bold', color: 'rgba(0, 255, 255, 0.15)', position: 'absolute', top: -15 }}>{prevDigit}</Text>
            <Text style={{ fontSize: 90, fontWeight: 'bold', color: 'white', letterSpacing: -2 }}>{digit}</Text>
            <Text style={{ fontSize: 50, fontWeight: 'bold', color: 'rgba(255, 0, 255, 0.15)', position: 'absolute', bottom: -15 }}>{nextDigit}</Text>
        </Animated.View>
    );
});

function HabitCardComponent({ habit, longestStreak = 0, onEdit, onDelete }: HabitCardProps) {
    const streakDigits = String(habit.streak).padStart(2, '0').split('');
    const glowOpacity = useSharedValue(0.3);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    useEffect(() => {
        glowOpacity.value = withRepeat(
            withSequence(
                withTiming(0.6, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
                withTiming(0.3, { duration: 1500, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        );
    }, []);

    const glowStyle = useAnimatedStyle(() => ({
        shadowOpacity: glowOpacity.value,
    }));

    const handleDelete = () => setShowDeleteDialog(true);
    const confirmDelete = () => {
        setShowDeleteDialog(false);
        onDelete?.();
    };

    return (
        <>
            <Animated.View
                entering={FadeInDown.duration(500).springify()}
                style={[{
                    backgroundColor: '#111',
                    borderRadius: 20,
                    padding: 24,
                    marginBottom: 16,
                    borderWidth: 1,
                    borderColor: '#222',
                    shadowColor: '#00FFFF',
                    shadowOffset: { width: 0, height: 0 },
                    shadowRadius: 20,
                }, glowStyle]}
            >
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
                                {streakDigits.map((digit, index) => <OdometerDigit key={`${index}-${digit}`} digit={digit} index={index} />)}
                            </View>
                        </View>
                        <Text style={{ color: '#00FFFF', fontSize: 11, letterSpacing: 2, marginTop: 8 }}>CURRENT STREAK</Text>
                    </View>
                </View>

                <TouchableOpacity onPress={handleDelete} style={{ position: 'absolute', top: 20, right: 20, backgroundColor: 'rgba(255, 0, 255, 0.1)', padding: 8, borderRadius: 8 }}>
                    <Ionicons name="trash-outline" size={16} color="#FF00FF" />
                </TouchableOpacity>
            </Animated.View>

            <DeleteDialog
                visible={showDeleteDialog}
                habitName={habit.name}
                onCancel={() => setShowDeleteDialog(false)}
                onConfirm={confirmDelete}
            />
        </>
    );
}

export const HabitCard = memo(HabitCardComponent);
