import { create } from 'zustand';
import { addHabitToDB, deleteHabit, getAllLogs, getHabits, getLogsForHabit, getLogsForWeek, initDatabase, logCompletionToDB, saveAdjustment, saveWeeklyReport, updateHabit, updateHabitStreak } from '../core/db';
import { HabitEngine } from '../core/HabitEngine';
import { badgeCatalog } from '../core/badges';
import { evaluateBadges, fetchUserBadges, saveNewBadges } from '../core/badgeService';
import { AdjustmentSuggestion, DayOfWeek, Frequency, Habit, HabitAdjustment, HabitLog, InsightFeedData, UserBadge, WeeklyReport, getWeekNumber } from '../core/types';
import { NotificationService } from '../services/NotificationService';
import { computeStreaks } from '../core/streaks';
import { queueSize, subscribe as subscribeQueue } from '../core/syncQueue';
import { runOrEnqueue, startSyncService } from '../services/syncService';
import { computeInsights } from '../core/insights';

interface HabitState {
    habits: Habit[];
    isLoading: boolean;
    suggestions: AdjustmentSuggestion[];
    latestReport: WeeklyReport | null;
    badges: UserBadge[];
    pendingSyncCount: number;
    lastSyncedAt?: number | null;
    insights: InsightFeedData;

    initialize: () => Promise<void>;
    addHabit: (name: string, icon: string, frequency: Frequency, selectedDays: DayOfWeek[], effort: number, timeWindow: string) => Promise<void>;
    removeHabit: (habitId: string) => Promise<void>;
    logHabit: (habitId: string, status: 'completed' | 'skipped' | 'failed') => Promise<void>;
    skipHabit: (habitId: string) => Promise<boolean>;
    useFreezeToken: (habitId: string) => Promise<boolean>;
    activateVacation: (habitId: string, days?: number) => Promise<void>;
    refreshSuggestions: () => Promise<void>;
    generateWeeklyReport: () => Promise<WeeklyReport | null>;
    applyAdjustment: (suggestion: AdjustmentSuggestion) => Promise<void>;
    pauseHabit: (habitId: string, days: number) => Promise<void>;
    resumeHabit: (habitId: string) => Promise<void>;
    loadBadges: () => Promise<void>;
    refreshInsights: () => Promise<void>;
}

export const useHabitStore = create<HabitState>((set, get) => ({
    habits: [],
    isLoading: true,
    suggestions: [],
    latestReport: null,
    badges: [],
    pendingSyncCount: 0,
    lastSyncedAt: null,
    insights: { bestHabit: null, atRisk: [], streakHighlight: null, focus: null },

    initialize: async () => {
        try {
            await initDatabase();
            const queueLen = await queueSize();
            set({ pendingSyncCount: queueLen });

            startSyncService({
                onSynced: (ts) => set({ lastSyncedAt: ts, pendingSyncCount: 0 }),
                onQueueChange: (size) => set({ pendingSyncCount: size }),
            });

            subscribeQueue((items) => set({ pendingSyncCount: items.length }));

            const habits = await getHabits();
            const allLogs = await getAllLogs();
            const badges = await fetchUserBadges();
            const habitWithStreaks = await Promise.all(habits.map(async (habit) => {
                const vacationActive = habit.vacationMode && habit.vacationUntil && habit.vacationUntil >= Date.now();
                const normalizedHabit = vacationActive ? habit : { ...habit, vacationMode: false, vacationUntil: undefined };
                const logs = allLogs.filter(l => l.habitId === habit.id);
                const { currentStreak, longestStreak, freezeTokensLeft, lastCompletedDate } = computeStreaks(normalizedHabit, logs);
                const needsUpdate = currentStreak !== habit.streak
                    || (habit.longestStreak ?? habit.streak) !== longestStreak
                    || (habit.freezeTokens ?? 0) !== freezeTokensLeft
                    || habit.lastCompletedDate !== lastCompletedDate
                    || (!vacationActive && habit.vacationMode);
                if (needsUpdate) {
                    await runOrEnqueue('UPDATE', {
                        habitId: habit.id,
                        updates: {
                            streak: currentStreak,
                            longestStreak,
                            freezeTokens: freezeTokensLeft,
                            lastCompletedDate,
                            vacationMode: vacationActive,
                            vacationUntil: vacationActive ? habit.vacationUntil : undefined,
                        }
                    }, async () => {
                        await updateHabitStreak(habit.id, currentStreak, longestStreak, lastCompletedDate, freezeTokensLeft);
                        await updateHabit(habit.id, { vacationMode: vacationActive, vacationUntil: vacationActive ? habit.vacationUntil : undefined });
                    });
                }
                return { ...normalizedHabit, streak: currentStreak, longestStreak, freezeTokens: freezeTokensLeft, lastCompletedDate };
            }));

            set({ habits: habitWithStreaks, badges, isLoading: false });

            const insights = computeInsights(habitWithStreaks, allLogs);
            set({ insights });

            await NotificationService.registerForPushNotifications();
            await NotificationService.scheduleHabitReminders(habits);
            await get().refreshSuggestions();
            await get().refreshInsights();
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
            longestStreak: 0,
            lastCompletedDate: null,
            freezeTokens: 3,
            vacationMode: false,
            timeWindow,
            isPaused: false,
            skipsUsedThisWeek: 0,
            maxSkipsPerWeek: 2,
            lastSkipResetWeek: getWeekNumber(),
        };

        await runOrEnqueue('CREATE', { habit: newHabit }, async () => addHabitToDB(newHabit));
        const habits = [...get().habits, newHabit];
        set({ habits });
        await NotificationService.scheduleHabitReminders(habits);
    },

    removeHabit: async (habitId) => {
        await runOrEnqueue('DELETE', { habitId }, async () => deleteHabit(habitId));
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

        const logs = await getLogsForHabit(habitId).catch(() => [] as HabitLog[]);
        const mergedLogs = [newLog, ...logs];
        const { currentStreak, longestStreak, freezeTokensLeft, lastCompletedDate } = computeStreaks(habit, mergedLogs);

        if (status === 'completed' && currentStreak > (habit.longestStreak || 0)) {
            await NotificationService.sendStreakMilestone(habit.name, currentStreak);
        }

        await runOrEnqueue('LOG', {
            log: newLog,
            habitUpdates: {
                habitId,
                streak: currentStreak,
                longestStreak,
                lastCompletedDate,
                freezeTokens: freezeTokensLeft,
            },
        }, async () => {
            await logCompletionToDB(newLog);
            await updateHabitStreak(habitId, currentStreak, longestStreak, lastCompletedDate, freezeTokensLeft);
        });

        set({
            habits: get().habits.map(h => h.id === habitId ? { ...h, streak: currentStreak, longestStreak, freezeTokens: freezeTokensLeft, lastCompletedDate } : h)
        });

        await get().refreshSuggestions();
        await get().refreshInsights();
    },

    skipHabit: async (habitId) => {
        const habit = get().habits.find(h => h.id === habitId);
        if (!habit) return false;

        const currentWeek = getWeekNumber();
        let skipsUsed = habit.lastSkipResetWeek === currentWeek ? habit.skipsUsedThisWeek : 0;

        if (skipsUsed >= habit.maxSkipsPerWeek) {
            return false; // No skips left
        }

        const newLog: HabitLog = {
            id: Date.now().toString(36) + Math.random().toString(36).substr(2),
            habitId,
            timestamp: Date.now(),
            status: 'skipped',
            dayOfWeek: new Date().getDay() as DayOfWeek,
        };

        const logs = await getLogsForHabit(habitId).catch(() => [] as HabitLog[]);
        const mergedLogs = [newLog, ...logs];
        const { currentStreak, longestStreak, freezeTokensLeft, lastCompletedDate } = computeStreaks(habit, mergedLogs);

        await runOrEnqueue('LOG', {
            log: newLog,
            habitUpdates: {
                habitId,
                streak: currentStreak,
                longestStreak,
                lastCompletedDate,
                freezeTokens: freezeTokensLeft,
                additionalUpdates: {
                    skipsUsedThisWeek: skipsUsed + 1,
                    lastSkipResetWeek: currentWeek,
                }
            },
        }, async () => {
            await logCompletionToDB(newLog);
            await updateHabitStreak(habitId, currentStreak, longestStreak, lastCompletedDate, freezeTokensLeft);
            await updateHabit(habitId, {
                skipsUsedThisWeek: skipsUsed + 1,
                lastSkipResetWeek: currentWeek,
            });
        });

        set({
            habits: get().habits.map(h => h.id === habitId ? {
                ...h,
                skipsUsedThisWeek: skipsUsed + 1,
                lastSkipResetWeek: currentWeek,
                streak: currentStreak,
                longestStreak,
                lastCompletedDate,
                freezeTokens: freezeTokensLeft,
            } : h)
        });

        await get().refreshInsights();
        return true;
    },

    useFreezeToken: async (habitId) => {
        const habit = get().habits.find(h => h.id === habitId);
        if (!habit || (habit.freezeTokens ?? 0) <= 0) return false;
        const updatedTokens = (habit.freezeTokens ?? 0) - 1;
        set({ habits: get().habits.map(h => h.id === habitId ? { ...h, freezeTokens: updatedTokens } : h) });
        await runOrEnqueue('UPDATE', { habitId, updates: { freezeTokens: updatedTokens } }, async () => updateHabit(habitId, { freezeTokens: updatedTokens }));
        return true;
    },

    activateVacation: async (habitId, days = 7) => {
        const habit = get().habits.find(h => h.id === habitId);
        if (!habit) return;
        const until = Date.now() + days * 24 * 60 * 60 * 1000;
        set({ habits: get().habits.map(h => h.id === habitId ? { ...h, vacationMode: true, vacationUntil: until } : h) });
        await runOrEnqueue('UPDATE', { habitId, updates: { vacationMode: true, vacationUntil: until } }, async () => updateHabit(habitId, { vacationMode: true, vacationUntil: until }));
    },

    refreshSuggestions: async () => {
        const { habits } = get();
        const suggestions: AdjustmentSuggestion[] = [];
        const now = Date.now();

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

            // Smart rules: low adherence -> reduce frequency
            const windowLogs = logs.filter(l => l.timestamp >= (now - 7 * 24 * 60 * 60 * 1000));
            const completions = windowLogs.filter(l => l.status === 'completed').length;
            const fails = windowLogs.filter(l => l.status === 'failed').length;
            const attempts = completions + fails;
            const successRate = attempts === 0 ? 1 : completions / attempts;
            if (successRate < 0.4 && habit.frequency !== 'weekly') {
                suggestions.push({
                    habitId: habit.id,
                    type: 'reduce_frequency',
                    reason: 'Completion is low this week. Try fewer days to rebuild consistency.',
                    suggestedAction: 'Reduce to 3 days/week',
                });
            }

            // Smart rule: shift time window to best performing period
            const timeStats = HabitEngine.analyzeTimeOfDaySuccess(logs);
            const bestPeriod = HabitEngine.getBestTimePeriod(timeStats);
            if (bestPeriod && bestPeriod !== habit.timeWindow) {
                suggestions.push({
                    habitId: habit.id,
                    type: 'shift_time_window',
                    reason: `You do better in the ${bestPeriod}. Consider switching.`,
                    suggestedAction: `Move to ${bestPeriod}`,
                });
            }
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
                await runOrEnqueue('UPDATE', { habitId: habit.id, updates: { frequency: 'custom', selectedDays: [1, 3, 5] } }, async () => updateHabit(habit.id, { frequency: 'custom', selectedDays: [1, 3, 5] }));
                set({
                    habits: get().habits.map(h => h.id === habit.id ? { ...h, frequency: 'custom' as Frequency, selectedDays: [1, 3, 5] as DayOfWeek[] } : h)
                });
                break;

            case 'decrease_difficulty':
                adjustment.previousValue = String(habit.effortRating);
                adjustment.newValue = String(Math.max(1, habit.effortRating - 1));
                await runOrEnqueue('UPDATE', { habitId: habit.id, updates: { effortRating: Number(adjustment.newValue) } }, async () => updateHabit(habit.id, { effortRating: Number(adjustment.newValue) }));
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
                    await runOrEnqueue('UPDATE', { habitId: habit.id, updates: { timeWindow: bestPeriod } }, async () => updateHabit(habit.id, { timeWindow: bestPeriod }));
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
        await runOrEnqueue('UPDATE', { habitId, updates: { isPaused: true, pausedUntil } }, async () => updateHabit(habitId, { isPaused: true, pausedUntil }));
        set({
            habits: get().habits.map(h => h.id === habitId ? { ...h, isPaused: true, pausedUntil } : h)
        });
        await NotificationService.scheduleHabitReminders(get().habits);
    },

    resumeHabit: async (habitId) => {
        await runOrEnqueue('UPDATE', { habitId, updates: { isPaused: false, pausedUntil: undefined } }, async () => updateHabit(habitId, { isPaused: false, pausedUntil: undefined }));
        set({
            habits: get().habits.map(h => h.id === habitId ? { ...h, isPaused: false, pausedUntil: undefined } : h)
        });
        await NotificationService.scheduleHabitReminders(get().habits);
    },

    loadBadges: async () => {
        const badges = await fetchUserBadges();
        set({ badges });
    },

    refreshInsights: async () => {
        const habits = get().habits;
        if (!habits.length) return;
        const logs = await getAllLogs();
        const insights = computeInsights(habits, logs);
        set({ insights });
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

        const badgeIds = evaluateBadges({ report, habits, logs });
        const existingBadges = get().badges;
        const newlyUnlocked = badgeIds.filter(id => !existingBadges.some(b => b.badgeId === id));
        const updatedBadges = await saveNewBadges(existingBadges, badgeIds);
        if (updatedBadges !== existingBadges) {
            set({ badges: updatedBadges });
        }

        if (newlyUnlocked.length) {
            for (const id of newlyUnlocked) {
                const badgeName = badgeCatalog.find(b => b.id === id)?.name || 'New badge';
                await NotificationService.sendBadgeEarned(badgeName);
            }
        }

        await NotificationService.sendWeeklyReportNotification(report.overallSuccessRate);

        return report;
    },
}));
