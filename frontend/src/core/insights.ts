import { Habit, HabitLog, InsightAtRisk, InsightBestHabit, InsightFeedData, InsightStreakHighlight } from './types';

const startOfDay = (ts: number) => {
    const d = new Date(ts);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
};

const withinDays = (ts: number, days: number, now = Date.now()) => {
    const start = now - days * 24 * 60 * 60 * 1000;
    return ts >= start;
};

const buildStats = (logs: HabitLog[]) => {
    let completions = 0;
    let failures = 0;
    let skips = 0;
    let consecutiveFailures = 0;
    let maxConsecutiveFailures = 0;

    const sorted = [...logs].sort((a, b) => a.timestamp - b.timestamp);
    for (const log of sorted) {
        if (log.status === 'completed') {
            completions += 1;
            consecutiveFailures = 0;
        } else if (log.status === 'failed') {
            failures += 1;
            consecutiveFailures += 1;
            if (consecutiveFailures > maxConsecutiveFailures) maxConsecutiveFailures = consecutiveFailures;
        } else if (log.status === 'skipped') {
            skips += 1;
            consecutiveFailures = 0;
        }
    }

    const attempts = completions + failures;
    const successRate = attempts === 0 ? 0 : completions / attempts;

    return { completions, failures, skips, attempts, successRate, maxConsecutiveFailures };
};

export const computeInsights = (habits: Habit[], logs: HabitLog[], now = Date.now()): InsightFeedData => {
    const recentLogs = logs.filter(l => withinDays(l.timestamp, 14, now));
    const byHabit = new Map<string, HabitLog[]>();
    for (const log of recentLogs) {
        const arr = byHabit.get(log.habitId) || [];
        arr.push(log);
        byHabit.set(log.habitId, arr);
    }

    let bestHabit: InsightBestHabit | null = null;
    const atRisk: InsightAtRisk[] = [];
    let streakHighlight: InsightStreakHighlight | null = null;

    for (const habit of habits) {
        const hLogs = byHabit.get(habit.id) || [];
        const stats = buildStats(hLogs);

        if (stats.attempts === undefined) {
            // for TypeScript narrowing; attempts not stored
        }

        const candidate: InsightBestHabit = {
            habitId: habit.id,
            name: habit.name,
            successRate: stats.successRate,
            completions: stats.completions,
        };

        if (!bestHabit || candidate.successRate > bestHabit.successRate || (candidate.successRate === bestHabit.successRate && candidate.completions > bestHabit.completions)) {
            bestHabit = candidate;
        }

        const consecutiveFailures = stats.maxConsecutiveFailures;
        if (stats.successRate < 0.5 || consecutiveFailures >= 2) {
            atRisk.push({
                habitId: habit.id,
                name: habit.name,
                successRate: stats.successRate,
                consecutiveFailures,
            });
        }

        // streak highlight pick highest streak
        if (!streakHighlight || habit.streak > streakHighlight.currentStreak) {
            streakHighlight = {
                habitId: habit.id,
                name: habit.name,
                currentStreak: habit.streak,
                longestStreak: habit.longestStreak ?? habit.streak,
                freezeTokens: habit.freezeTokens ?? 0,
                needsAction: habit.streak > 0 && (habit.freezeTokens ?? 0) === 0,
            };
        }
    }

    const focus = bestHabit ? `Keep ${bestHabit.name} above ${(bestHabit.successRate * 100).toFixed(0)}% this week.` : null;

    return {
        bestHabit,
        atRisk: atRisk.slice(0, 2),
        streakHighlight,
        focus,
    };
};
