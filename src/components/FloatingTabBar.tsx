import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import React, { memo, useCallback } from 'react';
import { TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';

interface TabBarProps {
    onAddPress?: () => void;
}

interface TabButtonProps {
    icon: string;
    route: string;
    isCenter?: boolean;
    isActive: boolean;
    onPress: () => void;
}

// Memoized tab button
const TabButton = memo(function TabButton({ icon, isCenter = false, isActive, onPress }: TabButtonProps) {
    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: withSpring(isActive ? 1.1 : 1) }],
    }));

    if (isCenter) {
        return (
            <TouchableOpacity
                onPress={onPress}
                style={{
                    width: 56,
                    height: 56,
                    borderRadius: 28,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: -20,
                    backgroundColor: '#6236FF',
                    shadowColor: '#6236FF',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.5,
                    shadowRadius: 8,
                    elevation: 10,
                }}
            >
                <Ionicons name={icon as any} size={28} color="white" />
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity
            onPress={onPress}
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 12 }}
        >
            <Animated.View style={animatedStyle}>
                <Ionicons
                    name={icon as any}
                    size={24}
                    color={isActive ? '#6236FF' : '#6b7280'}
                />
            </Animated.View>
        </TouchableOpacity>
    );
});

function FloatingTabBarComponent({ onAddPress }: TabBarProps) {
    const router = useRouter();
    const pathname = usePathname();

    const isActive = useCallback((route: string) => pathname === route, [pathname]);

    const navigateTo = useCallback((route: string) => {
        if (pathname === route) return;
        router.replace(route as any);
    }, [pathname, router]);

    const handleHomePress = useCallback(() => navigateTo('/'), [navigateTo]);
    const handleReportPress = useCallback(() => navigateTo('/report'), [navigateTo]);
    const handleCalendarPress = useCallback(() => navigateTo('/calendar'), [navigateTo]);
    const handleProfilePress = useCallback(() => navigateTo('/profile'), [navigateTo]);
    const handleAddPress = useCallback(() => onAddPress?.(), [onAddPress]);

    return (
        <View style={{ position: 'absolute', bottom: 24, left: 16, right: 16 }}>
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-around',
                    borderRadius: 32,
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    backgroundColor: 'rgba(20, 20, 30, 0.95)',
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.4,
                    shadowRadius: 16,
                    elevation: 20,
                }}
            >
                <TabButton icon="home" route="/" isActive={isActive('/')} onPress={handleHomePress} />
                <TabButton icon="stats-chart" route="/report" isActive={isActive('/report')} onPress={handleReportPress} />
                <TabButton icon="add" route="/create" isCenter isActive={false} onPress={handleAddPress} />
                <TabButton icon="calendar" route="/calendar" isActive={isActive('/calendar')} onPress={handleCalendarPress} />
                <TabButton icon="person" route="/profile" isActive={isActive('/profile')} onPress={handleProfilePress} />
            </View>
        </View>
    );
}

export const FloatingTabBar = memo(FloatingTabBarComponent);
