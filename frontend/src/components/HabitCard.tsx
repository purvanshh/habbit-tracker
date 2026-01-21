import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { memo, useEffect, useRef, useState } from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
    Easing,
    FadeInDown,
    useAnimatedStyle,
    useSharedValue,
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
                    <View style={{ alignItems: 'center', paddingTop: 32, paddingBottom: 16 }}>
                        <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(168, 85, 247, 0.15)', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                            <Ionicons name="trash" size={28} color="#A855F7" />
                        </View>
                        <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>Delete Habit</Text>
                    </View>
                    <View style={{ paddingHorizontal: 24, paddingBottom: 24 }}>
                        <Text style={{ color: '#9ca3af', fontSize: 14, textAlign: 'center', lineHeight: 22 }}>
                            Are you sure you want to delete{'\n'}
                            <Text style={{ color: '#6366F1', fontWeight: 'bold' }}>"{habitName}"</Text>?{'\n'}
                            This action cannot be undone.
                        </Text>
                    </View>
                    <View style={{ flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#222' }}>
                        <TouchableOpacity onPress={onCancel} style={{ flex: 1, paddingVertical: 16, alignItems: 'center', borderRightWidth: 1, borderRightColor: '#222' }}>
                            <Text style={{ color: '#6b7280', fontSize: 16, fontWeight: '600' }}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={onConfirm} style={{ flex: 1, paddingVertical: 16, alignItems: 'center' }}>
                            <Text style={{ color: '#A855F7', fontSize: 16, fontWeight: '600' }}>Delete</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
}

// Odometer digit with vertical slide animation
const OdometerDigit = memo(function OdometerDigit({ digit, prevDigitValue }: { digit: string; prevDigitValue: string }) {
    const translateY = useSharedValue(0);
    const DIGIT_HEIGHT = 56;

    useEffect(() => {
        if (digit !== prevDigitValue) {
            // Animate from bottom
            translateY.value = DIGIT_HEIGHT;
            translateY.value = withTiming(0, {
                duration: 400,
                easing: Easing.bezier(0.45, 0, 0.55, 1) // easeInOutSine
            });
        }
    }, [digit]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
    }));

    return (
        <View style={{ width: 32, height: DIGIT_HEIGHT, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
            <Animated.View style={[animatedStyle]}>
                <Text style={{
                    fontSize: 48,
                    fontWeight: '700',
                    color: 'white',
                    fontFamily: 'System',
                    letterSpacing: -1,
                }}>
                    {digit}
                </Text>
            </Animated.View>
        </View>
    );
});

// Streak counter with odometer animation
function StreakCounter({ streak }: { streak: number }) {
    const digits = String(streak).padStart(2, '0').split('');
    const prevStreakRef = useRef(streak);
    const prevDigits = useRef(digits);

    useEffect(() => {
        prevDigits.current = String(prevStreakRef.current).padStart(2, '0').split('');
        prevStreakRef.current = streak;
    }, [streak]);

    return (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            {/* Minimalist fire icon */}
            <MaterialCommunityIcons name="fire" size={28} color="#F97316" style={{ marginRight: 4 }} />

            {/* Odometer digits */}
            <View style={{ flexDirection: 'row' }}>
                {digits.map((digit, index) => (
                    <OdometerDigit
                        key={index}
                        digit={digit}
                        prevDigitValue={prevDigits.current[index] || '0'}
                    />
                ))}
            </View>
        </View>
    );
}

function HabitCardComponent({ habit, longestStreak = 0, onEdit, onDelete }: HabitCardProps) {
    const glowOpacity = useSharedValue(0.3);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    useEffect(() => {
        glowOpacity.value = withRepeat(
            withSequence(
                withTiming(0.5, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
                withTiming(0.2, { duration: 1500, easing: Easing.inOut(Easing.ease) })
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
                    backgroundColor: '#0F0F0F',
                    borderRadius: 24,
                    padding: 24,
                    marginBottom: 16,
                    borderWidth: 1,
                    borderColor: '#1A1A1A',
                    shadowColor: '#6366F1',
                    shadowOffset: { width: 0, height: 0 },
                    shadowRadius: 20,
                }, glowStyle]}
            >
                {/* Edit button */}
                <TouchableOpacity onPress={onEdit} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 32 }}>
                    <Ionicons name="pencil-outline" size={14} color="#6366F1" />
                    <Text style={{ color: '#6366F1', fontSize: 11, marginLeft: 8, letterSpacing: 2, fontWeight: '500' }}>EDIT GOAL</Text>
                </TouchableOpacity>

                <View style={{ flexDirection: 'row' }}>
                    {/* Left side - Habit info */}
                    <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                        <View style={{ marginBottom: 32 }}>
                            <Text style={{ color: '#6b7280', fontSize: 10, letterSpacing: 2, marginBottom: 6 }}>YOUR GOAL</Text>
                            <Text style={{ color: 'white', fontSize: 15, fontWeight: '600', letterSpacing: 0.5 }}>{habit.name.toUpperCase()}</Text>
                        </View>
                        <View>
                            <Text style={{ color: '#6b7280', fontSize: 10, letterSpacing: 2, marginBottom: 4 }}>LONGEST STREAK</Text>
                            <Text style={{ color: '#A855F7', fontSize: 24, fontWeight: '700' }}>{longestStreak || habit.streak}</Text>
                        </View>
                    </View>

                    {/* Right side - Streak counter */}
                    <View style={{ alignItems: 'flex-end', justifyContent: 'center' }}>
                        <StreakCounter streak={habit.streak} />
                        <Text style={{ color: '#6b7280', fontSize: 10, letterSpacing: 2, marginTop: 8 }}>CURRENT STREAK</Text>
                    </View>
                </View>

                {/* Delete button */}
                <TouchableOpacity onPress={handleDelete} style={{ position: 'absolute', top: 20, right: 20, backgroundColor: 'rgba(168, 85, 247, 0.1)', padding: 10, borderRadius: 10 }}>
                    <Ionicons name="trash-outline" size={16} color="#A855F7" />
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
