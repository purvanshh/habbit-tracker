export type Frequency = 'daily' | 'weekly' | 'weekdays';
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday

export interface Habit {
    id: string;
    name: string;
    icon: string; // Ionicons name
    frequency: Frequency;
    effortRating: number; // 1-5
    createdAt: number;
    streak: number;
    timeWindow: string; // e.g., "morning", "evening"
}

export interface HabitLog {
    id: string;
    habitId: string;
    timestamp: number;
    status: 'completed' | 'skipped' | 'failed';
    dayOfWeek: DayOfWeek;
}

export interface AdjustmentSuggestion {
    habitId: string;
    type: 'decrease_difficulty' | 'shift_time_window';
    reason: string;
    suggestedAction: string;
}
