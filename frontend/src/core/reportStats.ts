import { Habit, WeeklyHighlights, WeeklyReport } from './types';

export const computeWeeklyHighlights = (report: WeeklyReport | null, habits: Habit[]): WeeklyHighlights => {
    if (!report) {
        return {
            totalHabitsCompleted: 0,
            completionRate: 0,
            longestStreak: habits.length ? Math.max(...habits.map(h => h.longestStreak ?? h.streak)) : 0,
            mostConsistentHabit: null,
        };
    }

    const longestStreak = habits.length ? Math.max(...habits.map(h => h.longestStreak ?? h.streak)) : 0;
    const completionRate = report.overallSuccessRate;
    const totalHabitsCompleted = report.totalCompletions;

    const sortedMetrics = [...report.habitMetrics].sort((a, b) => {
        if (b.successRate === a.successRate) {
            return b.completions - a.completions;
        }
        return b.successRate - a.successRate;
    });

    const topMetric = sortedMetrics.find(m => m.successRate > 0) || null;

    return {
        totalHabitsCompleted,
        completionRate,
        longestStreak,
        mostConsistentHabit: topMetric ? {
            habitId: topMetric.habitId,
            habitName: topMetric.habitName,
            successRate: topMetric.successRate,
        } : null,
    };
};
