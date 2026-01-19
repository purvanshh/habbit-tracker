import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { memo } from 'react';
import { Dimensions, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { Extrapolate, interpolate, runOnJS, useAnimatedStyle, useSharedValue, withDelay, withSpring, withTiming } from 'react-native-reanimated';

interface SwipeSliderProps { onComplete: () => void; }

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BUTTON_HEIGHT = 60;
const BUTTON_WIDTH = SCREEN_WIDTH - 48;
const SWIPE_THRESHOLD = BUTTON_WIDTH * 0.7;

function SwipeSliderComponent({ onComplete }: SwipeSliderProps) {
    const translateX = useSharedValue(0);
    const completed = useSharedValue(false);
    const startX = useSharedValue(0);

    const triggerHaptic = () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const resetSlider = () => { translateX.value = withDelay(1000, withTiming(0, { duration: 300 })); completed.value = false; };

    const panGesture = Gesture.Pan()
        .onStart(() => { startX.value = translateX.value; })
        .onUpdate((e) => { if (!completed.value) translateX.value = Math.max(0, Math.min(startX.value + e.translationX, BUTTON_WIDTH - BUTTON_HEIGHT)); })
        .onEnd(() => {
            if (!completed.value) {
                if (translateX.value > SWIPE_THRESHOLD) {
                    translateX.value = withSpring(BUTTON_WIDTH - BUTTON_HEIGHT);
                    completed.value = true;
                    runOnJS(onComplete)();
                    runOnJS(triggerHaptic)();
                    runOnJS(resetSlider)();
                } else translateX.value = withSpring(0);
            }
        });

    const knobStyle = useAnimatedStyle(() => ({ transform: [{ translateX: translateX.value }] }));
    const textStyle = useAnimatedStyle(() => ({ opacity: interpolate(translateX.value, [0, SWIPE_THRESHOLD], [1, 0], Extrapolate.CLAMP) }));

    return (
        <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 8 }}>
            <View style={{ width: BUTTON_WIDTH, height: BUTTON_HEIGHT, borderRadius: 30, justifyContent: 'center', backgroundColor: '#111', borderWidth: 1, borderColor: '#222' }}>
                <Animated.View style={[textStyle, { position: 'absolute', width: '100%', alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }]}>
                    <Text style={{ color: '#6b7280', fontSize: 11, fontWeight: 'bold', letterSpacing: 3, marginRight: 8 }}>Swipe to Complete</Text>
                    <Ionicons name="chevron-forward" size={16} color="#6b7280" />
                </Animated.View>
                <GestureDetector gesture={panGesture}>
                    <Animated.View style={[knobStyle, { position: 'absolute', left: 5, width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }]}>
                        <LinearGradient colors={['#00FFFF', '#FF00FF'] as const} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center' }}>
                            <Ionicons name="checkmark" size={24} color="white" />
                        </LinearGradient>
                    </Animated.View>
                </GestureDetector>
            </View>
        </View>
    );
}

export const SwipeSlider = memo(SwipeSliderComponent);
