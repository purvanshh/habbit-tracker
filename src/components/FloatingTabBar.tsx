import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { usePathname, useRouter } from 'expo-router';
import React, { memo, useCallback, useEffect } from 'react';
import { TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

interface TabBarProps {
    onAddPress?: () => void;
}

const TabButton = memo(function TabButton({ icon, isCenter, isActive, onPress }: { icon: string; isCenter?: boolean; isActive: boolean; onPress: () => void }) {
    const scale = useSharedValue(1);

    const handlePress = () => {
        scale.value = withSpring(0.9, { damping: 15 });
        setTimeout(() => {
            scale.value = withSpring(1, { damping: 15 });
        }, 100);
        onPress();
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    if (isCenter) {
        return (
            <TouchableOpacity onPress={handlePress}>
                <Animated.View style={[animatedStyle]}>
                    <LinearGradient
                        colors={['#6366F1', '#A855F7'] as const}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{
                            width: 56,
                            height: 56,
                            borderRadius: 28,
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginTop: -20,
                            shadowColor: '#6366F1',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.4,
                            shadowRadius: 10,
                        }}
                    >
                        <Ionicons name={icon as any} size={28} color="white" />
                    </LinearGradient>
                </Animated.View>
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity onPress={handlePress} style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 12 }}>
            <Animated.View style={animatedStyle}>
                <Ionicons name={icon as any} size={24} color={isActive ? '#6366F1' : '#6b7280'} />
            </Animated.View>
        </TouchableOpacity>
    );
});

function FloatingTabBarComponent({ onAddPress }: TabBarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const isActive = useCallback((route: string) => pathname === route, [pathname]);
    const navigateTo = useCallback((route: string) => { if (pathname !== route) router.replace(route as any); }, [pathname, router]);

    const translateY = useSharedValue(50);
    const opacity = useSharedValue(0);

    useEffect(() => {
        translateY.value = withTiming(0, { duration: 400 });
        opacity.value = withTiming(1, { duration: 400 });
    }, []);

    const containerStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
        opacity: opacity.value,
    }));

    return (
        <Animated.View style={[{ position: 'absolute', bottom: 24, left: 16, right: 16 }, containerStyle]}>
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-around',
                borderRadius: 32,
                paddingHorizontal: 16,
                paddingVertical: 8,
                backgroundColor: '#111',
                borderWidth: 1,
                borderColor: '#222',
            }}>
                <TabButton icon="home" isActive={isActive('/')} onPress={() => navigateTo('/')} />
                <TabButton icon="stats-chart" isActive={isActive('/report')} onPress={() => navigateTo('/report')} />
                <TabButton icon="add" isCenter isActive={false} onPress={() => onAddPress?.()} />
                <TabButton icon="calendar" isActive={isActive('/calendar')} onPress={() => navigateTo('/calendar')} />
                <TabButton icon="person" isActive={isActive('/profile')} onPress={() => navigateTo('/profile')} />
            </View>
        </Animated.View>
    );
}

export const FloatingTabBar = memo(FloatingTabBarComponent);
