import { AdjustmentSuggestion, DayOfWeek, DayOfWeekStats, Habit, HabitLog, HabitMetric, TimeOfDayStats, WeeklyReport } from './types';

export class HabitEngine {
    /**
     * Calculates a difficulty score (1-100) based on effort and frequency.
     */
    static calculateDifficultyScore(effort: number, frequency: Habit['frequency']): number {
        let freqMultiplier = 1;
        switch (frequency) {
            case 'daily': freqMultiplier = 7; break;
            case 'custom': freqMultiplier = 4; break; // Average 4 days
            case 'weekly': freqMultiplier = 1; break;
        }
        return (effort * 10) + (freqMultiplier * 5);
    }

    /**
     * Analyze time-of-day success rates
     */
    static analyzeTimeOfDaySuccess(logs: HabitLog[]): TimeOfDayStats {
        const stats: TimeOfDayStats = {
            morning: { attempts: 0, completions: 0 },
            afternoon: { attempts: 0, completions: 0 },
            evening: { attempts: 0, completions: 0 },
        };

        for (const log of logs) {
            const hour = new Date(log.timestamp).getHours();
            let period: keyof TimeOfDayStats;
            if (hour >= 5 && hour < 12) period = 'morning';
            else if (hour >= 12 && hour < 17) period = 'afternoon';
            else period = 'evening';

            if (log.status !== 'skipped') stats[period].attempts++;
            if (log.status === 'completed') stats[period].completions++;
        }

        return stats;
    }

    /**
     * Analyze day-of-week patterns
     */
    static analyzeDayOfWeekPatterns(logs: HabitLog[]): DayOfWeekStats {
        const stats: DayOfWeekStats = {};
        for (let i = 0; i < 7; i++) stats[i] = { attempts: 0, completions: 0 };

        for (const log of logs) {
            const day = log.dayOfWeek;
            if (log.status !== 'skipped') stats[day].attempts++;
            if (log.status === 'completed') stats[day].completions++;
        }

        return stats;
    }

    /**
     * Calculate stability score (0-100) for a habit
     * Higher = more stable/consistent
     */
    static calculateStabilityScore(habit: Habit, logs: HabitLog[]): number {
        if (logs.length < 3) return 50; // Neutral for new habits

        const recentLogs = logs.slice(0, 14); // Last 2 weeks
        const completions = recentLogs.filter(l => l.status === 'completed').length;
        const attempts = recentLogs.filter(l => l.status !== 'skipped').length;

        if (attempts === 0) return 30;

        const successRate = completions / attempts;
        const streakBonus = Math.min(habit.streak * 2, 20);
        const consistencyScore = successRate * 80;

        return Math.min(Math.round(consistencyScore + streakBonus), 100);
    }

    /**
     * Determine trend for a habit
     */
    static determineTrend(logs: HabitLog[]): 'improving' | 'stable' | 'declining' {
        if (logs.length < 7) return 'stable';

        const recentWeek = logs.slice(0, 7);
        const previousWeek = logs.slice(7, 14);

        const recentRate = recentWeek.filter(l => l.status === 'completed').length / Math.max(recentWeek.length, 1);
        const previousRate = previousWeek.filter(l => l.status === 'completed').length / Math.max(previousWeek.length, 1);

        const diff = recentRate - previousRate;
        if (diff > 0.15) return 'improving';
        if (diff < -0.15) return 'declining';
        return 'stable';
    }

    /**
     * Check if habit is at risk of abandonment
     */
    static isAtRisk(habit: Habit, logs: HabitLog[]): boolean {
        const recentLogs = logs.slice(0, 7);
        const consecutiveFailures = this.countConsecutiveFailures(recentLogs);
        const stabilityScore = this.calculateStabilityScore(habit, logs);

        return consecutiveFailures >= 3 || stabilityScore < 30;
    }

    /**
     * Count consecutive failures from most recent
     */
    static countConsecutiveFailures(logs: HabitLog[]): number {
        let count = 0;
        for (const log of logs) {
            if (log.status === 'failed') count++;
            else break;
        }
        return count;
    }

    /**
     * Generate suggestions with auto-apply recommendations
     */
    static analyzeHabit(habit: Habit, logs: HabitLog[]): AdjustmentSuggestion | null {
        if (habit.isPaused) return null;

        const recentLogs = logs.sort((a, b) => b.timestamp - a.timestamp).slice(0, 14);
        const consecutiveFailures = this.countConsecutiveFailures(recentLogs);

        // Critical: 5+ failures - recommend pause
        if (consecutiveFailures >= 5) {
            return {
                habitId: habit.id,
                type: 'recommend_pause',
                reason: `You've missed ${habit.name} 5 times in a row.`,
                suggestedAction: 'Take a break and restart when ready.',
                autoApply: false,
            };
        }

        // 3-4 failures - reduce frequency
        if (consecutiveFailures >= 3 && habit.frequency === 'daily') {
            return {
                habitId: habit.id,
                type: 'reduce_frequency',
                reason: `Multiple consecutive misses detected.`,
                suggestedAction: 'Switch from daily to weekdays.',
                autoApply: true,
            };
        }

        // Low success rate - decrease difficulty
        const completedCount = recentLogs.filter(l => l.status === 'completed').length;
        const attemptCount = recentLogs.filter(l => l.status !== 'skipped').length;

        if (attemptCount > 5 && (completedCount / attemptCount) < 0.4) {
            // Find best time window
            const timeStats = this.analyzeTimeOfDaySuccess(recentLogs);
            const bestPeriod = this.getBestTimePeriod(timeStats);

            if (bestPeriod && bestPeriod !== habit.timeWindow) {
                return {
                    habitId: habit.id,
                    type: 'shift_time_window',
                    reason: `You have better success in the ${bestPeriod}.`,
                    suggestedAction: `Move this habit to ${bestPeriod}.`,
                    autoApply: true,
                };
            }

            if (habit.effortRating > 1) {
                return {
                    habitId: habit.id,
                    type: 'decrease_difficulty',
                    reason: 'Success rate is below 40%.',
                    suggestedAction: 'Lower the effort rating.',
                    autoApply: true,
                };
            }
        }

        return null;
    }

    /**
     * Get best performing time period
     */
    static getBestTimePeriod(stats: TimeOfDayStats): string | null {
        let best: string | null = null;
        let bestRate = 0;

        for (const [period, data] of Object.entries(stats)) {
            if (data.attempts >= 3) {
                const rate = data.completions / data.attempts;
                if (rate > bestRate) {
                    bestRate = rate;
                    best = period;
                }
            }
        }

        return bestRate > 0.6 ? best : null;
    }

    /**
     * Generate weekly report
     */
    static generateWeeklyReport(habits: Habit[], logs: HabitLog[], weekStart: number, weekEnd: number): WeeklyReport {
        const weekLogs = logs.filter(l => l.timestamp >= weekStart && l.timestamp < weekEnd);

        const totalCompletions = weekLogs.filter(l => l.status === 'completed').length;
        const totalMissed = weekLogs.filter(l => l.status === 'failed').length;
        const totalAttempts = weekLogs.filter(l => l.status !== 'skipped').length;

        // Day analysis
        const dayStats = this.analyzeDayOfWeekPatterns(weekLogs);
        let bestDay: DayOfWeek | null = null;
        let worstDay: DayOfWeek | null = null;
        let bestRate = 0;
        let worstRate = 1;

        for (let day = 0; day < 7; day++) {
            const data = dayStats[day];
            if (data.attempts > 0) {
                const rate = data.completions / data.attempts;
                if (rate > bestRate) { bestRate = rate; bestDay = day as DayOfWeek; }
                if (rate < worstRate) { worstRate = rate; worstDay = day as DayOfWeek; }
            }
        }

        // Per-habit metrics
        const habitMetrics: HabitMetric[] = habits.map(habit => {
            const habitLogs = weekLogs.filter(l => l.habitId === habit.id);
            const allHabitLogs = logs.filter(l => l.habitId === habit.id);
            const completions = habitLogs.filter(l => l.status === 'completed').length;
            const missed = habitLogs.filter(l => l.status === 'failed').length;
            const attempts = habitLogs.filter(l => l.status !== 'skipped').length;

            return {
                habitId: habit.id,
                habitName: habit.name,
                completions,
                missed,
                successRate: attempts > 0 ? Math.round((completions / attempts) * 100) : 0,
                stabilityScore: this.calculateStabilityScore(habit, allHabitLogs),
                trend: this.determineTrend(allHabitLogs),
                consecutiveFailures: this.countConsecutiveFailures(allHabitLogs),
                isAtRisk: this.isAtRisk(habit, allHabitLogs),
            };
        });

        // Gather suggestions
        const suggestions: AdjustmentSuggestion[] = [];
        const atRiskHabits: string[] = [];

        for (const habit of habits) {
            const habitLogs = logs.filter(l => l.habitId === habit.id);
            const suggestion = this.analyzeHabit(habit, habitLogs);
            if (suggestion) suggestions.push(suggestion);
            if (this.isAtRisk(habit, habitLogs)) atRiskHabits.push(habit.id);
        }

        return {
            id: `report_${weekStart}`,
            weekStart,
            weekEnd,
            generatedAt: Date.now(),
            totalCompletions,
            totalMissed,
            overallSuccessRate: totalAttempts > 0 ? Math.round((totalCompletions / totalAttempts) * 100) : 0,
            bestDay,
            worstDay,
            habitMetrics,
            atRiskHabits,
            suggestions,
        };
    }

    /**
     * Calculate adherence probability for a specific day
     */
    static calculateAdherenceProbability(habitId: string, day: DayOfWeek, logs: HabitLog[]): number {
        const dayLogs = logs.filter(l => l.habitId === habitId && l.dayOfWeek === day);
        if (dayLogs.length === 0) return 0.5;
        const completions = dayLogs.filter(l => l.status === 'completed').length;
        return completions / dayLogs.length;
    }

    /**
     * Detect high-risk day
     */
    static isHighRiskDay(habitId: string, day: DayOfWeek, logs: HabitLog[]): boolean {
        const dayLogs = logs
            .filter(l => l.habitId === habitId && l.dayOfWeek === day)
            .sort((a, b) => b.timestamp - a.timestamp);

        if (dayLogs.length < 3) return false;
        return dayLogs.slice(0, 3).every(l => l.status === 'failed');
    }
}
