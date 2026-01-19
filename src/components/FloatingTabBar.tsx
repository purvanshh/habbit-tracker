import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { usePathname, useRouter } from 'expo-router';
import React, { memo, useCallback } from 'react';
import { TouchableOpacity, View } from 'react-native';

interface TabBarProps {
    onAddPress?: () => void;
}

const TabButton = memo(function TabButton({ icon, isCenter, isActive, onPress }: { icon: string; isCenter?: boolean; isActive: boolean; onPress: () => void }) {
    if (isCenter) {
        return (
            <TouchableOpacity onPress={onPress}>
                <LinearGradient colors={['#00FFFF', '#FF00FF'] as const} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginTop: -20 }}>
                    <Ionicons name={icon as any} size={28} color="white" />
                </LinearGradient>
            </TouchableOpacity>
        );
    }
    return (
        <TouchableOpacity onPress={onPress} style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 12 }}>
            <Ionicons name={icon as any} size={24} color={isActive ? '#00FFFF' : '#6b7280'} />
        </TouchableOpacity>
    );
});

function FloatingTabBarComponent({ onAddPress }: TabBarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const isActive = useCallback((route: string) => pathname === route, [pathname]);
    const navigateTo = useCallback((route: string) => { if (pathname !== route) router.replace(route as any); }, [pathname, router]);

    return (
        <View style={{ position: 'absolute', bottom: 24, left: 16, right: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', borderRadius: 32, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#111', borderWidth: 1, borderColor: '#222' }}>
                <TabButton icon="home" isActive={isActive('/')} onPress={() => navigateTo('/')} />
                <TabButton icon="stats-chart" isActive={isActive('/report')} onPress={() => navigateTo('/report')} />
                <TabButton icon="add" isCenter isActive={false} onPress={() => onAddPress?.()} />
                <TabButton icon="calendar" isActive={isActive('/calendar')} onPress={() => navigateTo('/calendar')} />
                <TabButton icon="person" isActive={isActive('/profile')} onPress={() => navigateTo('/profile')} />
            </View>
        </View>
    );
}

export const FloatingTabBar = memo(FloatingTabBarComponent);
