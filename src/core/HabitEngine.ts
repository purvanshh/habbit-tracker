import { AdjustmentSuggestion, DayOfWeek, Habit, HabitLog } from './types';

export class HabitEngine {
    /**
     * Calculates a difficulty score (1-100) based on effort and frequency.
     * Higher effort (1-5) and higher frequency increase the score.
     */
    static calculateDifficultyScore(effort: number, frequency: Habit['frequency']): number {
        let freqMultiplier = 1;
        switch (frequency) {
            case 'daily': freqMultiplier = 7; break;
            case 'weekdays': freqMultiplier = 5; break;
            case 'weekly': freqMultiplier = 1; break;
        }
        // Base formula: (Effort * 10) + (FrequencyDays * 5)
        // Max roughly: (5 * 10) + (7 * 5) = 85
        return (effort * 10) + (freqMultiplier * 5);
    }

    /**
     * Analyzes logs to suggest adjustments.
     * - If consecutive_failures > 3 -> Suggest Difficulty Reduction
     * - If success_rate < 40% for specific time -> Suggest Time Window Shift
     */
    static analyzeHabit(habit: Habit, logs: HabitLog[]): AdjustmentSuggestion | null {
        const recentLogs = logs.sort((a, b) => b.timestamp - a.timestamp).slice(0, 10);

        // Check for consecutive failures
        let consecutiveFailures = 0;
        for (const log of recentLogs) {
            if (log.status === 'failed') {
                consecutiveFailures++;
            } else {
                break;
            }
        }

        if (consecutiveFailures > 3) {
            return {
                habitId: habit.id,
                type: 'decrease_difficulty',
                reason: 'You have missed this habit multiple times in a row.',
                suggestedAction: 'Consider reducing the frequency or effort rating.'
            };
        }

        // Check for time window success rate
        // Filter logs that match the habit's time window logic (simplified here)
        // Assuming we track 'failed' vs 'completed', 'skipped' doesn't count against success rate if valid logic
        const completedCount = recentLogs.filter(l => l.status === 'completed').length;
        const attemptCount = recentLogs.filter(l => l.status !== 'skipped').length;

        if (attemptCount > 5 && (completedCount / attemptCount) < 0.4) {
            return {
                habitId: habit.id,
                type: 'shift_time_window',
                reason: 'Success rate is below 40%.',
                suggestedAction: 'Try moving this habit to a different time of day.'
            };
        }

        return null;
    }

    /**
     * Calculates adherence probability for a specific day of week using Bayesian inference / simple frequency.
     */
    static calculateAdherenceProbability(habitId: string, day: DayOfWeek, logs: HabitLog[]): number {
        const dayLogs = logs.filter(l => l.habitId === habitId && l.dayOfWeek === day);

        if (dayLogs.length === 0) return 0.5; // Neutral start

        const completions = dayLogs.filter(l => l.status === 'completed').length;
        return completions / dayLogs.length;
    }

    /**
     * Detects if a specific day is "High Risk" (e.g. 3 missed Mondays in a row)
     */
    static isHighRiskDay(habitId: string, day: DayOfWeek, logs: HabitLog[]): boolean {
        const dayLogs = logs
            .filter(l => l.habitId === habitId && l.dayOfWeek === day)
            .sort((a, b) => b.timestamp - a.timestamp);

        if (dayLogs.length < 3) return false;

        // Check last 3 entries for this day
        const last3 = dayLogs.slice(0, 3);
        return last3.every(l => l.status === 'failed');
    }
}
