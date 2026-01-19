import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { memo } from 'react';
import { Dimensions, Text, View } from 'react-native';
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

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BUTTON_HEIGHT = 60;
const BUTTON_WIDTH = SCREEN_WIDTH - 48;
const SWIPE_THRESHOLD = BUTTON_WIDTH * 0.7;

function SwipeSliderComponent({ onComplete }: SwipeSliderProps) {
    const translateX = useSharedValue(0);
    const completed = useSharedValue(false);
    const startX = useSharedValue(0);

    const triggerHaptic = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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
            translateX.value = Math.max(0, Math.min(nextX, BUTTON_WIDTH - BUTTON_HEIGHT));
        })
        .onEnd(() => {
            if (completed.value) return;

            if (translateX.value > SWIPE_THRESHOLD) {
                translateX.value = withSpring(BUTTON_WIDTH - BUTTON_HEIGHT);
                completed.value = true;
                runOnJS(onComplete)();
                runOnJS(triggerHaptic)();
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
        <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 8 }}>
            <View
                style={{
                    width: BUTTON_WIDTH,
                    height: BUTTON_HEIGHT,
                    borderRadius: 30,
                    justifyContent: 'center',
                    backgroundColor: 'rgba(30, 30, 40, 0.9)',
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                }}
            >
                <Animated.View style={[textStyle, { position: 'absolute', width: '100%', alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }]}>
                    <Text style={{ color: '#6b7280', fontSize: 11, fontWeight: 'bold', letterSpacing: 3, marginRight: 8 }}>
                        Swipe to Complete
                    </Text>
                    <Ionicons name="chevron-forward" size={16} color="#6b7280" />
                </Animated.View>

                <GestureDetector gesture={panGesture}>
                    <Animated.View
                        style={[
                            knobStyle,
                            {
                                position: 'absolute',
                                left: 5,
                                width: 50,
                                height: 50,
                                borderRadius: 25,
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: '#6236FF',
                                shadowColor: '#6236FF',
                                shadowOffset: { width: 0, height: 0 },
                                shadowOpacity: 0.5,
                                shadowRadius: 10,
                            }
                        ]}
                    >
                        <Ionicons name="checkmark" size={24} color="white" />
                    </Animated.View>
                </GestureDetector>
            </View>
        </View>
    );
}

export const SwipeSlider = memo(SwipeSliderComponent);
