import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useRef, useState } from 'react';
import { Dimensions, Text, View } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    Extrapolate,
    interpolate,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withSpring,
    withTiming
} from 'react-native-reanimated';

interface SwipeSliderProps {
    onComplete: () => void;
}

const BUTTON_HEIGHT = 60;
const BUTTON_WIDTH = Dimensions.get('window').width - 48; // Padding
const SWIPE_THRESHOLD = BUTTON_WIDTH * 0.7;

export function SwipeSlider({ onComplete }: SwipeSliderProps) {
    const translateX = useSharedValue(0);
    const completed = useSharedValue(false);
    const startX = useSharedValue(0);
    const [showConfetti, setShowConfetti] = useState(false);
    const confettiRef = useRef<ConfettiCannon>(null);

    const triggerCelebration = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setShowConfetti(true);
        // Reset slider after a short delay
        setTimeout(() => {
            setShowConfetti(false);
        }, 2500);
    };

    const resetSlider = () => {
        translateX.value = withDelay(1000, withTiming(0, { duration: 300 }));
        completed.value = false;
    };

    const panGesture = Gesture.Pan()
        .onStart(() => {
            startX.value = translateX.value;
        })
        .onUpdate((event) => {
            if (completed.value) return;
            const nextX = startX.value + event.translationX;
            // Clamp between 0 and max width
            translateX.value = Math.max(0, Math.min(nextX, BUTTON_WIDTH - BUTTON_HEIGHT));
        })
        .onEnd(() => {
            if (completed.value) return;

            if (translateX.value > SWIPE_THRESHOLD) {
                translateX.value = withSpring(BUTTON_WIDTH - BUTTON_HEIGHT);
                completed.value = true;
                runOnJS(onComplete)();
                runOnJS(triggerCelebration)();
                runOnJS(resetSlider)();
            } else {
                translateX.value = withSpring(0);
            }
        });

    const knobStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: translateX.value }],
        };
    });

    const textStyle = useAnimatedStyle(() => {
        return {
            opacity: interpolate(
                translateX.value,
                [0, SWIPE_THRESHOLD],
                [1, 0],
                Extrapolate.CLAMP
            ),
        };
    });

    return (
        <View className="items-center justify-center py-4">
            <View
                className="bg-card border border-white/10 rounded-full justify-center"
                style={{ width: BUTTON_WIDTH, height: BUTTON_HEIGHT }}
            >
                <Animated.View style={textStyle} className="absolute w-full items-center">
                    <Text className="text-gray-400 font-sans tracking-[4px] text-xs font-bold uppercase" style={{ color: '#9ca3af' }}>
                        Swipe to Complete
                    </Text>
                </Animated.View>

                <GestureDetector gesture={panGesture}>
                    <Animated.View
                        className="bg-primary h-[50px] w-[50px] rounded-full items-center justify-center absolute left-[5px]"
                        style={knobStyle}
                    >
                        <Ionicons name="checkmark" size={24} color="white" />
                    </Animated.View>
                </GestureDetector>
            </View>

            {showConfetti && (
                <ConfettiCannon
                    ref={confettiRef}
                    count={80}
                    origin={{ x: BUTTON_WIDTH / 2, y: 0 }}
                    autoStart={true}
                    fadeOut={true}
                    fallSpeed={3000}
                    explosionSpeed={350}
                    colors={['#6236FF', '#22c55e', '#eab308', '#ec4899', '#3b82f6']}
                />
            )}
        </View>
    );
}
