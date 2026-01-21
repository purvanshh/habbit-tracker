
import { supabase } from '../lib/supabase';
import { AppNotification, getWeekNumber, Habit, HabitAdjustment, HabitLog, WeeklyReport } from './types';

// Removed SQLite initialization specifically
// Supabase client is initialized in src/lib/supabase.ts

export const initDatabase = async () => {
    // No-op for Supabase as client is lazy loaded
    console.log('Supabase client ready');
};

export const getHabits = async (): Promise<Habit[]> => {
    try {
        const { data: rows, error } = await supabase
            .from('habits')
            .select('*');

        if (error) throw error;
        if (!rows) return [];

        const currentWeek = getWeekNumber();

        return rows.map(row => {
            // Reset skips if new week
            const skipsUsed = row.lastSkipResetWeek === currentWeek ? row.skipsUsedThisWeek : 0;

            // In Supabase, selectedDays is already an array, no JSON.parse needed if defined as array in schema
            // But we defined it as INTEGER[] in SQL, so it returns number[]
            // We need to cast it to DayOfWeek[] if needed, or just keep as is

            return {
                id: row.id,
                name: row.name,
                icon: row.icon || 'barbell',
                frequency: row.frequency,
                selectedDays: row.selected_days || [0, 1, 2, 3, 4, 5, 6], // Map snake_case to camelCase
                effortRating: row.effort_rating,
                timeWindow: row.time_window,
                createdAt: new Date(row.created_at).getTime(),
                streak: row.streak,
                isPaused: row.is_paused,
                pausedUntil: row.paused_until ? new Date(row.paused_until).getTime() : undefined,
                skipsUsedThisWeek: row.skips_used_this_week,
                maxSkipsPerWeek: row.max_skips_per_week || 2,
                lastSkipResetWeek: row.last_skip_reset_week || currentWeek,
            };
        });
    } catch (error) {
        console.error('getHabits error:', error);
        return [];
    }
};

export const addHabitToDB = async (habit: Habit) => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('No user logged in');

        const { error } = await supabase
            .from('habits')
            .insert({
                id: habit.id,
                user_id: user.id,
                name: habit.name,
                icon: habit.icon || 'barbell',
                frequency: habit.frequency,
                selected_days: habit.selectedDays || [],
                effort_rating: habit.effortRating,
                time_window: habit.timeWindow,
                created_at: new Date(habit.createdAt).toISOString(),
                streak: habit.streak,
                is_paused: habit.isPaused,
                paused_until: habit.pausedUntil ? new Date(habit.pausedUntil).toISOString() : null,
                skips_used_this_week: habit.skipsUsedThisWeek || 0,
                max_skips_per_week: habit.maxSkipsPerWeek || 2,
                last_skip_reset_week: habit.lastSkipResetWeek || getWeekNumber()
            });

        if (error) throw error;
    } catch (error) {
        console.error('addHabitToDB error:', error);
        throw error;
    }
};

export const updateHabit = async (habitId: string, updates: Partial<Habit>) => {
    try {
        const dbUpdates: any = {};

        // Map camelCase to snake_case
        if (updates.name !== undefined) dbUpdates.name = updates.name;
        if (updates.icon !== undefined) dbUpdates.icon = updates.icon;
        if (updates.frequency !== undefined) dbUpdates.frequency = updates.frequency;
        if (updates.selectedDays !== undefined) dbUpdates.selected_days = updates.selectedDays;
        if (updates.effortRating !== undefined) dbUpdates.effort_rating = updates.effortRating;
        if (updates.timeWindow !== undefined) dbUpdates.time_window = updates.timeWindow;
        if (updates.isPaused !== undefined) dbUpdates.is_paused = updates.isPaused;
        if (updates.pausedUntil !== undefined) dbUpdates.paused_until = updates.pausedUntil ? new Date(updates.pausedUntil).toISOString() : null;
        if (updates.streak !== undefined) dbUpdates.streak = updates.streak;
        if (updates.skipsUsedThisWeek !== undefined) dbUpdates.skips_used_this_week = updates.skipsUsedThisWeek;
        if (updates.lastSkipResetWeek !== undefined) dbUpdates.last_skip_reset_week = updates.lastSkipResetWeek;

        // We handle updated_at automatically via DB trigger

        const { error } = await supabase
            .from('habits')
            .update(dbUpdates)
            .eq('id', habitId);

        if (error) throw error;
    } catch (error) {
        console.error('updateHabit error:', error);
    }
};

export const logCompletionToDB = async (log: HabitLog) => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('No user logged in');

        const { error } = await supabase
            .from('habit_logs')
            .insert({
                id: log.id,
                habit_id: log.habitId,
                user_id: user.id,
                timestamp: new Date(log.timestamp).toISOString(),
                status: log.status,
                day_of_week: log.dayOfWeek
            });

        if (error) throw error;
    } catch (error) {
        console.error('logCompletionToDB error:', error);
        throw error;
    }
};

export const updateHabitStreak = async (habitId: string, streak: number) => {
    try {
        const { error } = await supabase
            .from('habits')
            .update({ streak })
            .eq('id', habitId);

        if (error) throw error;
    } catch (error) {
        console.error('updateHabitStreak error:', error);
    }
};

export const getLogsForHabit = async (habitId: string): Promise<HabitLog[]> => {
    try {
        const { data, error } = await supabase
            .from('habit_logs')
            .select('*')
            .eq('habit_id', habitId)
            .order('timestamp', { ascending: false });

        if (error) throw error;
        return (data || []).map(row => ({
            id: row.id,
            habitId: row.habit_id,
            timestamp: new Date(row.timestamp).getTime(),
            status: row.status as any,
            dayOfWeek: row.day_of_week
        }));
    } catch (error) {
        console.error('getLogsForHabit error:', error);
        return [];
    }
};

export const isCompletedToday = async (habitId: string): Promise<boolean> => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const startOfDay = today.toISOString();
        const endOfDay = new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString();

        const { count, error } = await supabase
            .from('habit_logs')
            .select('*', { count: 'exact', head: true })
            .eq('habit_id', habitId)
            .gte('timestamp', startOfDay)
            .lt('timestamp', endOfDay)
            .in('status', ['completed', 'skipped']);

        if (error) throw error;
        return (count || 0) > 0;
    } catch (error) {
        console.error('isCompletedToday error:', error);
        return false;
    }
};

export const getAllLogs = async (): Promise<HabitLog[]> => {
    try {
        const { data, error } = await supabase
            .from('habit_logs')
            .select('*')
            .order('timestamp', { ascending: false });

        if (error) throw error;
        return (data || []).map(row => ({
            id: row.id,
            habitId: row.habit_id,
            timestamp: new Date(row.timestamp).getTime(),
            status: row.status as any,
            dayOfWeek: row.day_of_week
        }));
    } catch (error) {
        console.error('getAllLogs error:', error);
        return [];
    }
};

export const getLogsForWeek = async (weekStart: number, weekEnd: number): Promise<HabitLog[]> => {
    try {
        const { data, error } = await supabase
            .from('habit_logs')
            .select('*')
            .gte('timestamp', new Date(weekStart).toISOString())
            .lt('timestamp', new Date(weekEnd).toISOString())
            .order('timestamp', { ascending: false });

        if (error) throw error;
        return (data || []).map(row => ({
            id: row.id,
            habitId: row.habit_id,
            timestamp: new Date(row.timestamp).getTime(),
            status: row.status as any,
            dayOfWeek: row.day_of_week
        }));
    } catch (error) {
        console.error('getLogsForWeek error:', error);
        return [];
    }
};

export const deleteHabit = async (habitId: string) => {
    try {
        // Cascade delete handles logs
        const { error } = await supabase
            .from('habits')
            .delete()
            .eq('id', habitId);

        if (error) throw error;
    } catch (error) {
        console.error('deleteHabit error:', error);
        throw error;
    }
};

export const saveWeeklyReport = async (report: WeeklyReport) => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('No user logged in');

        const { error } = await supabase
            .from('weekly_reports')
            .upsert({
                id: report.id,
                user_id: user.id,
                week_start: report.weekStart,
                week_end: report.weekEnd,
                generated_at: report.generatedAt,
                total_completions: report.totalCompletions,
                total_missed: report.totalMissed,
                overall_success_rate: report.overallSuccessRate,
                best_day: report.bestDay,
                worst_day: report.worstDay,
                habit_metrics: report.habitMetrics,
                at_risk_habits: report.atRiskHabits,
                suggestions: report.suggestions
            });

        if (error) throw error;
    } catch (error) {
        console.error('saveWeeklyReport error:', error);
    }
};

export const getWeeklyReports = async (limit = 4): Promise<WeeklyReport[]> => {
    try {
        const { data, error } = await supabase
            .from('weekly_reports')
            .select('*')
            .order('week_start', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return (data || []).map(row => ({
            id: row.id,
            weekStart: Number(row.week_start),
            weekEnd: Number(row.week_end),
            generatedAt: Number(row.generated_at),
            totalCompletions: row.total_completions,
            totalMissed: row.total_missed,
            overallSuccessRate: row.overall_success_rate,
            bestDay: row.best_day,
            worstDay: row.worst_day,
            habitMetrics: row.habit_metrics,
            atRiskHabits: row.at_risk_habits,
            suggestions: row.suggestions
        }));
    } catch (error) {
        console.error('getWeeklyReports error:', error);
        return [];
    }
};

export const getLatestWeeklyReport = async (): Promise<WeeklyReport | null> => {
    try {
        const { data, error } = await supabase
            .from('weekly_reports')
            .select('*')
            .order('week_start', { ascending: false })
            .limit(1)
            .single();

        if (error || !data) return null;

        const row = data;
        return {
            id: row.id,
            weekStart: Number(row.week_start),
            weekEnd: Number(row.week_end),
            generatedAt: Number(row.generated_at),
            totalCompletions: row.total_completions,
            totalMissed: row.total_missed,
            overallSuccessRate: row.overall_success_rate,
            bestDay: row.best_day,
            worstDay: row.worst_day,
            habitMetrics: row.habit_metrics,
            atRiskHabits: row.at_risk_habits,
            suggestions: row.suggestions
        };
    } catch (error) {
        console.error('getLatestWeeklyReport error:', error);
        return null;
    }
};

export const saveAdjustment = async (adjustment: HabitAdjustment) => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('No user logged in');

        const { error } = await supabase
            .from('habit_adjustments')
            .insert({
                id: adjustment.id,
                habit_id: adjustment.habitId,
                user_id: user.id,
                timestamp: adjustment.timestamp,
                type: adjustment.type,
                previous_value: adjustment.previousValue,
                new_value: adjustment.newValue,
                was_auto_applied: adjustment.wasAutoApplied
            });

        if (error) throw error;
    } catch (error) {
        console.error('saveAdjustment error:', error);
    }
};

export const getAdjustmentsForHabit = async (habitId: string): Promise<HabitAdjustment[]> => {
    try {
        const { data, error } = await supabase
            .from('habit_adjustments')
            .select('*')
            .eq('habit_id', habitId)
            .order('timestamp', { ascending: false });

        if (error) throw error;
        return (data || []).map(row => ({
            id: row.id,
            habitId: row.habit_id,
            timestamp: Number(row.timestamp),
            type: row.type as any,
            previousValue: row.previous_value,
            newValue: row.new_value,
            wasAutoApplied: row.was_auto_applied
        }));
    } catch (error) {
        console.error('getAdjustmentsForHabit error:', error);
        return [];
    }
};

export const getNotifications = async (): Promise<AppNotification[]> => {
    try {
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return (data || []).map(row => ({
            id: row.id,
            userId: row.user_id,
            title: row.title,
            message: row.message,
            type: row.type as any,
            isRead: row.is_read,
            createdAt: new Date(row.created_at).getTime()
        }));
    } catch (error) {
        console.error('getNotifications error:', error);
        return [];
    }
};

export const markNotificationRead = async (id: string) => {
    try {
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', id);

        if (error) throw error;
    } catch (error) {
        console.error('markNotificationRead error:', error);
    }
};

export const createNotification = async (title: string, message: string, type: 'info' | 'warning' | 'success' = 'info') => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return; // Silent fail if no user

        const { error } = await supabase
            .from('notifications')
            .insert({
                user_id: user.id,
                title,
                message,
                type
            });

        if (error) throw error;
    } catch (error) {
        console.error('createNotification error:', error);
    }
};
