import { create } from 'zustand';
import { addHabitToDB, deleteHabit, getHabits, getLogsForHabit, initDatabase, logCompletionToDB, updateHabitStreak } from '../core/db';
import { HabitEngine } from '../core/HabitEngine';
import { AdjustmentSuggestion, Frequency, Habit, HabitLog } from '../core/types';

interface HabitState {
    habits: Habit[];
    isLoading: boolean;
    suggestions: AdjustmentSuggestion[];

    initialize: () => Promise<void>;
    addHabit: (name: string, icon: string, frequency: Frequency, effort: number, timeWindow: string) => Promise<void>;
    removeHabit: (habitId: string) => Promise<void>;
    logHabit: (habitId: string, status: 'completed' | 'skipped' | 'failed') => Promise<void>;
    refreshSuggestions: () => Promise<void>;
}

export const useHabitStore = create<HabitState>((set, get) => ({
    habits: [],
    isLoading: true,
    suggestions: [],

    initialize: async () => {
        try {
            await initDatabase();
            const habits = await getHabits();
            set({ habits, isLoading: false });
        } catch (e) {
            console.error('Failed to initialize store:', e);
            set({ isLoading: false });
        }
    },

    addHabit: async (name, icon, frequency, effort, timeWindow) => {
        const newHabit: Habit = {
            id: Date.now().toString(36) + Math.random().toString(36).substr(2),
            name,
            icon,
            frequency,
            effortRating: effort,
            createdAt: Date.now(),
            streak: 0,
            timeWindow
        };

        await addHabitToDB(newHabit);
        set(state => ({ habits: [...state.habits, newHabit] }));
    },

    removeHabit: async (habitId) => {
        await deleteHabit(habitId);
        set(state => ({
            habits: state.habits.filter(h => h.id !== habitId),
            suggestions: state.suggestions.filter(s => s.habitId !== habitId)
        }));
    },

    logHabit: async (habitId, status) => {
        const habit = get().habits.find(h => h.id === habitId);
        if (!habit) return;

        const newLog: HabitLog = {
            id: Date.now().toString(36) + Math.random().toString(36).substr(2),
            habitId,
            timestamp: Date.now(),
            status,
            dayOfWeek: new Date().getDay() as any,
        };

        await logCompletionToDB(newLog);

        // Update Streak locally if completed
        let newStreak = habit.streak;
        if (status === 'completed') {
            newStreak += 1;
        } else if (status === 'failed') {
            newStreak = 0;
        }
        // "skipped" maintains streak usually? or neutral? Assuming neutral for now.

        if (newStreak !== habit.streak) {
            await updateHabitStreak(habitId, newStreak);
            set(state => ({
                habits: state.habits.map(h => h.id === habitId ? { ...h, streak: newStreak } : h)
            }));
        }

        // Trigger analysis
        await get().refreshSuggestions();
    },

    refreshSuggestions: async () => {
        const { habits } = get();
        const suggestions: AdjustmentSuggestion[] = [];

        for (const habit of habits) {
            const logs = await getLogsForHabit(habit.id);
            const suggestion = HabitEngine.analyzeHabit(habit, logs);
            if (suggestion) {
                suggestions.push(suggestion);
            }
        }
        set({ suggestions });
    }
}));
