import React, { memo } from 'react';
import { Text, View } from 'react-native';
import { HabitLog } from '../core/types';

interface DotGridProps {
    logs: HabitLog[];
}

// Memoized day cell
const DayCell = memo(function DayCell({ day, status }: { day: Date; status: string | null }) {
    return (
        <View
            style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: status === 'completed'
                    ? '#6236FF'
                    : status === 'skipped'
                        ? 'rgba(107, 114, 128, 0.5)'
                        : status === 'failed'
                            ? 'rgba(239, 68, 68, 0.3)'
                            : 'rgba(255, 255, 255, 0.05)',
            }}
        >
            <Text
                style={{
                    fontSize: 10,
                    color: status === 'completed' ? 'white' : '#6b7280',
                    fontWeight: status === 'completed' ? 'bold' : 'normal',
                }}
            >
                {day.getDate()}
            </Text>
        </View>
    );
});

function DotGridComponent({ logs }: DotGridProps) {
    // Generate last 28 days for the grid (4 weeks)
    const days = React.useMemo(() => {
        return Array.from({ length: 28 }).map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (27 - i));
            return d;
        });
    }, []);

    const getStatusForDay = React.useCallback((date: Date) => {
        const log = logs.find(l => {
            const logDate = new Date(l.timestamp);
            return logDate.getDate() === date.getDate() &&
                logDate.getMonth() === date.getMonth();
        });
        return log ? log.status : null;
    }, [logs]);

    return (
        <View
            style={{
                backgroundColor: 'rgba(30, 30, 40, 0.6)',
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: 16,
                overflow: 'hidden',
            }}
        >
            <View style={{ padding: 16 }}>
                <View style={{ marginBottom: 12 }}>
                    <Text style={{ color: '#9ca3af', fontSize: 10, letterSpacing: 2 }}>
                        HISTORY (LAST 28 DAYS)
                    </Text>
                </View>

                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                    {days.map((day, i) => (
                        <DayCell key={i} day={day} status={getStatusForDay(day)} />
                    ))}
                </View>
            </View>
        </View>
    );
}

export const DotGrid = memo(DotGridComponent);
