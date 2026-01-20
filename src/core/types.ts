export type Frequency = 'daily' | 'custom' | 'weekly';
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday
export type TimeWindow = 'morning' | 'afternoon' | 'evening' | 'anytime';

export interface Habit {
    id: string;
    name: string;
    icon: string;
    frequency: Frequency;
    selectedDays: DayOfWeek[]; // Specific days when habit is scheduled
    effortRating: number; // 1-5
    createdAt: number;
    streak: number;
    timeWindow: string;
    isPaused?: boolean;
    pausedUntil?: number;
    skipsUsedThisWeek: number;
    maxSkipsPerWeek: number; // Default 2
    lastSkipResetWeek: number; // Week number for reset tracking
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
    type: 'decrease_difficulty' | 'shift_time_window' | 'reduce_frequency' | 'recommend_pause';
    reason: string;
    suggestedAction: string;
    autoApply?: boolean;
}

export interface HabitAdjustment {
    id: string;
    habitId: string;
    timestamp: number;
    type: AdjustmentSuggestion['type'];
    previousValue: string;
    newValue: string;
    wasAutoApplied: boolean;
}

export interface WeeklyReport {
    id: string;
    weekStart: number;
    weekEnd: number;
    generatedAt: number;
    totalCompletions: number;
    totalMissed: number;
    overallSuccessRate: number;
    bestDay: DayOfWeek | null;
    worstDay: DayOfWeek | null;
    habitMetrics: HabitMetric[];
    atRiskHabits: string[];
    suggestions: AdjustmentSuggestion[];
}

export interface HabitMetric {
    habitId: string;
    habitName: string;
    completions: number;
    missed: number;
    successRate: number;
    stabilityScore: number;
    trend: 'improving' | 'stable' | 'declining';
    consecutiveFailures: number;
    isAtRisk: boolean;
}

export interface TimeOfDayStats {
    morning: { attempts: number; completions: number };
    afternoon: { attempts: number; completions: number };
    evening: { attempts: number; completions: number };
}

export interface DayOfWeekStats {
    [key: number]: { attempts: number; completions: number };
}

// Helper to get current week number
export const getWeekNumber = (date: Date = new Date()): number => {
    const start = new Date(date.getFullYear(), 0, 1);
    const diff = date.getTime() - start.getTime();
    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    return Math.floor(diff / oneWeek);
};
