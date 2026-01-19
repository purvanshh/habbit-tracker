import React, { memo, useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, { FadeIn, useAnimatedStyle, useSharedValue, withDelay, withSpring } from 'react-native-reanimated';
import { HabitLog } from '../core/types';

interface DotGridProps {
    logs: HabitLog[];
}

const DayCell = memo(function DayCell({ day, status, index }: { day: Date; status: string | null; index: number }) {
    const scale = useSharedValue(0);
    const opacity = useSharedValue(0);

    useEffect(() => {
        scale.value = withDelay(index * 20, withSpring(1, { damping: 12, stiffness: 150 }));
        opacity.value = withDelay(index * 20, withSpring(1));
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
    }));

    return (
        <Animated.View style={[{
            width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center',
            backgroundColor: status === 'completed' ? '#00FFFF' : status === 'skipped' ? '#333' : status === 'failed' ? 'rgba(255, 0, 255, 0.3)' : '#1a1a1a',
        }, animatedStyle]}>
            <Text style={{ fontSize: 10, color: status === 'completed' ? '#000' : '#6b7280', fontWeight: status === 'completed' ? 'bold' : 'normal' }}>
                {day.getDate()}
            </Text>
        </Animated.View>
    );
});

function DotGridComponent({ logs }: DotGridProps) {
    const days = React.useMemo(() => Array.from({ length: 28 }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (27 - i));
        return d;
    }), []);

    const getStatusForDay = React.useCallback((date: Date) => {
        const log = logs.find(l => {
            const logDate = new Date(l.timestamp);
            return logDate.getDate() === date.getDate() && logDate.getMonth() === date.getMonth();
        });
        return log ? log.status : null;
    }, [logs]);

    return (
        <Animated.View entering={FadeIn.duration(500)} style={{ backgroundColor: '#111', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#222' }}>
            <Text style={{ color: '#6b7280', fontSize: 10, letterSpacing: 2, marginBottom: 12 }}>HISTORY (LAST 28 DAYS)</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                {days.map((day, i) => <DayCell key={i} day={day} status={getStatusForDay(day)} index={i} />)}
            </View>
        </Animated.View>
    );
}

export const DotGrid = memo(DotGridComponent);
