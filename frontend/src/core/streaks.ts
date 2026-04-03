import { Habit, HabitLog } from './types';

type NormalizedStatus = 'completed' | 'skipped' | 'failed';

const statusPriority: NormalizedStatus[] = ['completed', 'skipped', 'failed'];

const startOfDay = (timestamp: number) => {
    const d = new Date(timestamp);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
};

const isScheduledDay = (habit: Habit, date: Date) => {
    if (habit.frequency === 'daily') return true;
    const day = date.getDay();
    const days = habit.selectedDays?.length ? habit.selectedDays : [0, 1, 2, 3, 4, 5, 6];
    return days.includes(day as any);
};

export interface StreakComputation {
    currentStreak: number;
    longestStreak: number;
    freezeTokensLeft: number;
    lastCompletedDate?: string | null;
}

export const computeStreaks = (habit: Habit, logs: HabitLog[], now = Date.now()): StreakComputation => {
    const byDay = new Map<number, NormalizedStatus>();
    for (const log of logs) {
        const dayKey = startOfDay(log.timestamp);
        const current = byDay.get(dayKey);
        const incoming = log.status as NormalizedStatus;
        if (!current || statusPriority.indexOf(incoming) < statusPriority.indexOf(current)) {
            byDay.set(dayKey, incoming);
        }
    }

    const created = startOfDay(habit.createdAt || now);
    const today = startOfDay(now);
    const earliest = Math.min(created, ...Array.from(byDay.keys(), k => k));
    const start = isFinite(earliest) ? earliest : created;

    let currentStreak = 0;
    let longestStreak = 0;
    let freezeTokensLeft = habit.freezeTokens ?? 0;
    let lastCompletedDate: string | null = habit.lastCompletedDate || null;

    const vacationUntil = habit.vacationMode && habit.vacationUntil ? startOfDay(habit.vacationUntil) : null;

    for (let day = start; day <= today; day += 24 * 60 * 60 * 1000) {
        const dayDate = new Date(day);
        const scheduled = isScheduledDay(habit, dayDate);
        if (!scheduled) continue;

        const status = byDay.get(day);

        const onVacation = vacationUntil !== null && day <= vacationUntil;
        if (onVacation) {
            // Vacation preserves streak without incrementing
            continue;
        }

        if (status === 'completed') {
            currentStreak += 1;
            lastCompletedDate = new Date(day).toISOString();
        } else if (status === 'skipped') {
            // Keep continuity, no increment
            currentStreak = currentStreak;
        } else {
            // Missing/failed scheduled day
            if (freezeTokensLeft > 0) {
                freezeTokensLeft -= 1;
                // Streak preserved
            } else {
                currentStreak = 0;
            }
        }

        if (currentStreak > longestStreak) {
            longestStreak = currentStreak;
        }
    }

    return { currentStreak, longestStreak, freezeTokensLeft, lastCompletedDate };
};
