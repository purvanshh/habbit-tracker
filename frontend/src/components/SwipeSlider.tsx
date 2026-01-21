import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { memo } from 'react';
import { Dimensions, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    Extrapolate,
    interpolate,
    interpolateColor,
    runOnJS,
    useAnimatedStyle,
    useDerivedValue,
    useSharedValue,
    withSpring,
    withTiming
} from 'react-native-reanimated';

interface SwipeSliderProps {
    onComplete: () => void;
    onSkip?: () => void;
    canSkip?: boolean;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BUTTON_HEIGHT = 64;
const BUTTON_WIDTH = SCREEN_WIDTH - 48;
const KNOB_SIZE = 54;
const MAX_RIGHT = (BUTTON_WIDTH - KNOB_SIZE) / 2 - 5;
const MAX_LEFT = -MAX_RIGHT;
const COMPLETE_THRESHOLD = MAX_RIGHT * 0.8;
const SKIP_THRESHOLD = MAX_LEFT * 0.8;

function SwipeSliderComponent({ onComplete, onSkip, canSkip = true }: SwipeSliderProps) {
    const translateX = useSharedValue(0);
    const isActive = useSharedValue(false);

    const triggerHapticSuccess = () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const triggerHapticWarning = () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

    const handleComplete = () => {
        onComplete();
        translateX.value = withTiming(0, { duration: 400 });
    };

    const handleSkip = () => {
        if (onSkip) onSkip();
        translateX.value = withTiming(0, { duration: 400 });
    };

    const panGesture = Gesture.Pan()
        .onStart(() => {
            isActive.value = true;
        })
        .onUpdate((e) => {
            const leftBound = canSkip ? MAX_LEFT : 0;
            translateX.value = Math.max(leftBound, Math.min(e.translationX, MAX_RIGHT));
        })
        .onEnd(() => {
            isActive.value = false;
            if (translateX.value > COMPLETE_THRESHOLD) {
                // Swipe right - Complete
                translateX.value = withSpring(MAX_RIGHT);
                runOnJS(triggerHapticSuccess)();
                runOnJS(handleComplete)();
            } else if (translateX.value < SKIP_THRESHOLD && canSkip && onSkip) {
                // Swipe left - Skip
                translateX.value = withSpring(MAX_LEFT);
                runOnJS(triggerHapticWarning)();
                runOnJS(handleSkip)();
            } else {
                translateX.value = withSpring(0);
            }
        });

    // Normalized position: -1 (left) to 0 (center) to 1 (right)
    const normalizedPosition = useDerivedValue(() => {
        if (translateX.value > 0) {
            return translateX.value / MAX_RIGHT;
        } else {
            return translateX.value / Math.abs(MAX_LEFT);
        }
    });

    const knobStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }]
    }));

    // Background color changes based on direction
    const knobBackgroundStyle = useAnimatedStyle(() => {
        const backgroundColor = interpolateColor(
            normalizedPosition.value,
            [-1, 0, 1],
            ['#F59E0B', '#6366F1', '#10B981']
        );
        return { backgroundColor };
    });

    // Arrow icon opacity (visible at center)
    const arrowOpacity = useAnimatedStyle(() => ({
        opacity: interpolate(
            Math.abs(normalizedPosition.value),
            [0, 0.3],
            [1, 0],
            Extrapolate.CLAMP
        ),
    }));

    // Checkmark icon opacity (visible when swiping right)
    const checkOpacity = useAnimatedStyle(() => ({
        opacity: interpolate(
            normalizedPosition.value,
            [0.2, 0.5],
            [0, 1],
            Extrapolate.CLAMP
        ),
    }));

    // Pause icon opacity (visible when swiping left)
    const pauseOpacity = useAnimatedStyle(() => ({
        opacity: interpolate(
            normalizedPosition.value,
            [-0.2, -0.5],
            [0, 1],
            Extrapolate.CLAMP
        ),
    }));

    // Left label (SKIP)
    const leftLabelStyle = useAnimatedStyle(() => ({
        opacity: interpolate(
            normalizedPosition.value,
            [-0.5, 0],
            [1, 0.3],
            Extrapolate.CLAMP
        ),
        transform: [{
            scale: interpolate(
                normalizedPosition.value,
                [-0.5, 0],
                [1.1, 1],
                Extrapolate.CLAMP
            )
        }]
    }));

    // Right label (DONE)
    const rightLabelStyle = useAnimatedStyle(() => ({
        opacity: interpolate(
            normalizedPosition.value,
            [0, 0.5],
            [0.3, 1],
            Extrapolate.CLAMP
        ),
        transform: [{
            scale: interpolate(
                normalizedPosition.value,
                [0, 0.5],
                [1, 1.1],
                Extrapolate.CLAMP
            )
        }]
    }));

    return (
        <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 8 }}>
            <View style={{
                width: BUTTON_WIDTH,
                height: BUTTON_HEIGHT,
                borderRadius: BUTTON_HEIGHT / 2,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#0F0F0F',
                borderWidth: 1,
                borderColor: '#1A1A1A',
            }}>
                {/* Left indicator - Skip */}
                {canSkip && (
                    <Animated.View style={[leftLabelStyle, { position: 'absolute', left: 24 }]}>
                        <Ionicons name="pause" size={18} color="#F59E0B" />
                    </Animated.View>
                )}

                {/* Right indicator - Done */}
                <Animated.View style={[rightLabelStyle, { position: 'absolute', right: 24 }]}>
                    <Ionicons name="checkmark" size={18} color="#10B981" />
                </Animated.View>

                <GestureDetector gesture={panGesture}>
                    <Animated.View style={[
                        knobStyle,
                        knobBackgroundStyle,
                        {
                            width: KNOB_SIZE,
                            height: KNOB_SIZE,
                            borderRadius: KNOB_SIZE / 2,
                            alignItems: 'center',
                            justifyContent: 'center',
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.3,
                            shadowRadius: 8,
                            elevation: 8,
                        }
                    ]}>
                        {/* Arrow icons (initial state) */}
                        <Animated.View style={[arrowOpacity, { position: 'absolute', flexDirection: 'row', gap: 8 }]}>
                            <Ionicons name="chevron-back" size={20} color="white" />
                            <Ionicons name="chevron-forward" size={20} color="white" />
                        </Animated.View>

                        {/* Checkmark icon (swiping right) */}
                        <Animated.View style={[checkOpacity, { position: 'absolute' }]}>
                            <Ionicons name="checkmark" size={26} color="white" />
                        </Animated.View>

                        {/* Pause icon (swiping left) */}
                        <Animated.View style={[pauseOpacity, { position: 'absolute' }]}>
                            <Ionicons name="pause" size={24} color="white" />
                        </Animated.View>
                    </Animated.View>
                </GestureDetector>
            </View>
        </View>
    );
}

export const SwipeSlider = memo(SwipeSliderComponent);
