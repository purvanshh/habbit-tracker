import { Text, View } from 'react-native';
import { HabitLog } from '../core/types';
import { cn } from '../lib/utils';

interface DotGridProps {
    logs: HabitLog[];
}

export function DotGrid({ logs }: DotGridProps) {
    // Generate last 28 days for the grid (4 weeks)
    const days = Array.from({ length: 28 }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (27 - i));
        return d;
    });

    const getStatusForDay = (date: Date) => {
        const log = logs.find(l => {
            const logDate = new Date(l.timestamp);
            return logDate.getDate() === date.getDate() &&
                logDate.getMonth() === date.getMonth();
        });
        return log ? log.status : null;
    };

    return (
        <View className="flex-row flex-wrap justify-between gap-2 p-4 bg-card rounded-2xl border border-white/5">
            <View className="w-full mb-2">
                <Text className="text-gray-400 text-xs font-sans tracking-widest uppercase">
                    History (Last 30 Days)
                </Text>
            </View>

            <View className="flex-row flex-wrap gap-2">
                {days.map((day, i) => {
                    const status = getStatusForDay(day);
                    return (
                        <View
                            key={i}
                            className={cn(
                                "w-8 h-8 rounded-full items-center justify-center",
                                status === 'completed' ? "bg-primary" :
                                    status === 'skipped' ? "bg-gray-700" :
                                        status === 'failed' ? "bg-red-900/50" : "bg-secondary"
                            )}
                        >
                            <Text className={cn(
                                "text-[10px]",
                                status === 'completed' ? "text-white font-bold" : "text-gray-500"
                            )}>
                                {day.getDate()}
                            </Text>
                        </View>
                    );
                })}
            </View>
        </View>
    );
}
