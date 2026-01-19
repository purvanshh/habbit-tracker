import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';

interface TabBarProps {
    onAddPress?: () => void;
}

export function FloatingTabBar({ onAddPress }: TabBarProps) {
    const router = useRouter();
    const pathname = usePathname();

    const isActive = (route: string) => pathname === route;

    const TabButton = ({ icon, route, isCenter = false }: { icon: string; route: string; isCenter?: boolean }) => {
        const active = isActive(route);

        const animatedStyle = useAnimatedStyle(() => ({
            transform: [{ scale: withSpring(active ? 1.1 : 1) }],
        }));

        if (isCenter) {
            return (
                <TouchableOpacity
                    onPress={onAddPress}
                    className="w-14 h-14 rounded-full items-center justify-center -mt-5"
                    style={{ backgroundColor: '#6236FF' }}
                >
                    <Ionicons name={icon as any} size={28} color="white" />
                </TouchableOpacity>
            );
        }

        return (
            <TouchableOpacity
                onPress={() => router.push(route as any)}
                className="flex-1 items-center justify-center py-3"
            >
                <Animated.View style={animatedStyle}>
                    <Ionicons
                        name={icon as any}
                        size={24}
                        color={active ? '#6236FF' : '#6b7280'}
                    />
                </Animated.View>
            </TouchableOpacity>
        );
    };

    return (
        <View className="absolute bottom-6 left-4 right-4">
            <View
                className="flex-row items-center justify-around rounded-full px-4 py-2 border border-white/10"
                style={{
                    backgroundColor: '#1A1A1A',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 10,
                }}
            >
                <TabButton icon="home" route="/" />
                <TabButton icon="stats-chart" route="/report" />
                <TabButton icon="add" route="/create" isCenter />
                <TabButton icon="calendar" route="/calendar" />
                <TabButton icon="person" route="/profile" />
            </View>
        </View>
    );
}
