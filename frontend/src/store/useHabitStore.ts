import { create } from 'zustand';
import { addHabitToDB, deleteHabit, getHabits, getLogsForHabit, getLogsForWeek, initDatabase, logCompletionToDB, saveAdjustment, saveWeeklyReport, updateHabit, updateHabitStreak } from '../core/db';
import { HabitEngine } from '../core/HabitEngine';
import { AdjustmentSuggestion, DayOfWeek, Frequency, Habit, HabitAdjustment, HabitLog, WeeklyReport, getWeekNumber } from '../core/types';
import { NotificationService } from '../services/NotificationService';

interface HabitState {
    habits: Habit[];
    isLoading: boolean;
    suggestions: AdjustmentSuggestion[];
    latestReport: WeeklyReport | null;

    initialize: () => Promise<void>;
    addHabit: (name: string, icon: string, frequency: Frequency, selectedDays: DayOfWeek[], effort: number, timeWindow: string) => Promise<void>;
    removeHabit: (habitId: string) => Promise<void>;
    logHabit: (habitId: string, status: 'completed' | 'skipped' | 'failed') => Promise<void>;
    skipHabit: (habitId: string) => Promise<boolean>;
    refreshSuggestions: () => Promise<void>;
    generateWeeklyReport: () => Promise<WeeklyReport | null>;
    applyAdjustment: (suggestion: AdjustmentSuggestion) => Promise<void>;
    pauseHabit: (habitId: string, days: number) => Promise<void>;
    resumeHabit: (habitId: string) => Promise<void>;
}

export const useHabitStore = create<HabitState>((set, get) => ({
    habits: [],
    isLoading: true,
    suggestions: [],
    latestReport: null,

    initialize: async () => {
        try {
            await initDatabase();
            const habits = await getHabits();
            set({ habits, isLoading: false });

            await NotificationService.registerForPushNotifications();
            await NotificationService.scheduleHabitReminders(habits);
            await get().refreshSuggestions();
        } catch (e) {
            console.error('Failed to initialize store:', e);
            set({ isLoading: false });
        }
    },

    addHabit: async (name, icon, frequency, selectedDays, effort, timeWindow) => {
        const newHabit: Habit = {
            id: Date.now().toString(36) + Math.random().toString(36).substr(2),
            name,
            icon,
            frequency,
            selectedDays,
            effortRating: effort,
            createdAt: Date.now(),
            streak: 0,
            timeWindow,
            isPaused: false,
            skipsUsedThisWeek: 0,
            maxSkipsPerWeek: 2,
            lastSkipResetWeek: getWeekNumber(),
        };

        await addHabitToDB(newHabit);
        const habits = [...get().habits, newHabit];
        set({ habits });
        await NotificationService.scheduleHabitReminders(habits);
    },

    removeHabit: async (habitId) => {
        await deleteHabit(habitId);
        const habits = get().habits.filter(h => h.id !== habitId);
        set({
            habits,
            suggestions: get().suggestions.filter(s => s.habitId !== habitId)
        });
        await NotificationService.scheduleHabitReminders(habits);
    },

    logHabit: async (habitId, status) => {
        const habit = get().habits.find(h => h.id === habitId);
        if (!habit) return;

        const newLog: HabitLog = {
            id: Date.now().toString(36) + Math.random().toString(36).substr(2),
            habitId,
            timestamp: Date.now(),
            status,
            dayOfWeek: new Date().getDay() as DayOfWeek,
        };

        await logCompletionToDB(newLog);

        let newStreak = habit.streak;
        if (status === 'completed') {
            newStreak += 1;
            await NotificationService.sendStreakMilestone(habit.name, newStreak);
        } else if (status === 'failed') {
            newStreak = 0;
        }
        // Skipped days don't break streak

        if (newStreak !== habit.streak) {
            await updateHabitStreak(habitId, newStreak);
            set({
                habits: get().habits.map(h => h.id === habitId ? { ...h, streak: newStreak } : h)
            });
        }

        await get().refreshSuggestions();
    },

    skipHabit: async (habitId) => {
        const habit = get().habits.find(h => h.id === habitId);
        if (!habit) return false;

        const currentWeek = getWeekNumber();
        let skipsUsed = habit.lastSkipResetWeek === currentWeek ? habit.skipsUsedThisWeek : 0;

        if (skipsUsed >= habit.maxSkipsPerWeek) {
            return false; // No skips left
        }

        // Log as skipped
        await get().logHabit(habitId, 'skipped');

        // Update skip count
        await updateHabit(habitId, {
            skipsUsedThisWeek: skipsUsed + 1,
            lastSkipResetWeek: currentWeek,
        });

        set({
            habits: get().habits.map(h => h.id === habitId ? {
                ...h,
                skipsUsedThisWeek: skipsUsed + 1,
                lastSkipResetWeek: currentWeek,
            } : h)
        });

        return true;
    },

    refreshSuggestions: async () => {
        const { habits } = get();
        const suggestions: AdjustmentSuggestion[] = [];

        for (const habit of habits) {
            const logs = await getLogsForHabit(habit.id);
            const suggestion = HabitEngine.analyzeHabit(habit, logs);
            if (suggestion) {
                if (suggestion.autoApply) {
                    await get().applyAdjustment(suggestion);
                } else {
                    suggestions.push(suggestion);
                }
            }
            await NotificationService.sendHighRiskWarning(habit, logs);
        }

        set({ suggestions });
    },

    applyAdjustment: async (suggestion) => {
        const habit = get().habits.find(h => h.id === suggestion.habitId);
        if (!habit) return;

        const adjustment: HabitAdjustment = {
            id: Date.now().toString(36),
            habitId: suggestion.habitId,
            timestamp: Date.now(),
            type: suggestion.type,
            previousValue: '',
            newValue: '',
            wasAutoApplied: suggestion.autoApply || false,
        };

        switch (suggestion.type) {
            case 'reduce_frequency':
                adjustment.previousValue = habit.frequency;
                adjustment.newValue = 'custom';
                // Reduce to 3 days per week
                await updateHabit(habit.id, { frequency: 'custom', selectedDays: [1, 3, 5] });
                set({
                    habits: get().habits.map(h => h.id === habit.id ? { ...h, frequency: 'custom' as Frequency, selectedDays: [1, 3, 5] as DayOfWeek[] } : h)
                });
                break;

            case 'decrease_difficulty':
                adjustment.previousValue = String(habit.effortRating);
                adjustment.newValue = String(Math.max(1, habit.effortRating - 1));
                await updateHabit(habit.id, { effortRating: Number(adjustment.newValue) });
                set({
                    habits: get().habits.map(h => h.id === habit.id ? { ...h, effortRating: Number(adjustment.newValue) } : h)
                });
                break;

            case 'shift_time_window':
                const timeStats = HabitEngine.analyzeTimeOfDaySuccess(await getLogsForHabit(habit.id));
                const bestPeriod = HabitEngine.getBestTimePeriod(timeStats);
                if (bestPeriod) {
                    adjustment.previousValue = habit.timeWindow;
                    adjustment.newValue = bestPeriod;
                    await updateHabit(habit.id, { timeWindow: bestPeriod });
                    set({
                        habits: get().habits.map(h => h.id === habit.id ? { ...h, timeWindow: bestPeriod } : h)
                    });
                }
                break;

            case 'recommend_pause':
                await get().pauseHabit(habit.id, 3);
                adjustment.previousValue = 'active';
                adjustment.newValue = 'paused_3_days';
                break;
        }

        await saveAdjustment(adjustment);
        set({ suggestions: get().suggestions.filter(s => s.habitId !== suggestion.habitId) });
        await NotificationService.scheduleHabitReminders(get().habits);
    },

    pauseHabit: async (habitId, days) => {
        const pausedUntil = Date.now() + (days * 24 * 60 * 60 * 1000);
        await updateHabit(habitId, { isPaused: true, pausedUntil });
        set({
            habits: get().habits.map(h => h.id === habitId ? { ...h, isPaused: true, pausedUntil } : h)
        });
        await NotificationService.scheduleHabitReminders(get().habits);
    },

    resumeHabit: async (habitId) => {
        await updateHabit(habitId, { isPaused: false, pausedUntil: undefined });
        set({
            habits: get().habits.map(h => h.id === habitId ? { ...h, isPaused: false, pausedUntil: undefined } : h)
        });
        await NotificationService.scheduleHabitReminders(get().habits);
    },

    generateWeeklyReport: async () => {
        const { habits } = get();
        if (habits.length === 0) return null;

        const now = new Date();
        const weekEnd = now.getTime();
        const weekStart = weekEnd - (7 * 24 * 60 * 60 * 1000);

        const logs = await getLogsForWeek(weekStart, weekEnd);
        const report = HabitEngine.generateWeeklyReport(habits, logs, weekStart, weekEnd);

        await saveWeeklyReport(report);
        set({ latestReport: report });
        await NotificationService.sendWeeklyReportNotification(report.overallSuccessRate);

        return report;
    },
}));
