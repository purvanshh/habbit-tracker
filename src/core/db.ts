import * as SQLite from 'expo-sqlite';
import { Habit, HabitLog } from './types';

// Database singleton with initialization lock
let db: SQLite.SQLiteDatabase | null = null;
let initPromise: Promise<SQLite.SQLiteDatabase | null> | null = null;
let initError: Error | null = null;

const ensureDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
    if (db) return db;
    if (initError) throw initError;

    if (!initPromise) {
        initPromise = (async () => {
            try {
                const database = await SQLite.openDatabaseAsync('habits.db');

                // Create tables if they don't exist
                await database.execAsync(`
                    PRAGMA journal_mode = WAL;
                    CREATE TABLE IF NOT EXISTS habits (
                        id TEXT PRIMARY KEY NOT NULL,
                        name TEXT NOT NULL,
                        frequency TEXT NOT NULL,
                        effortRating INTEGER NOT NULL,
                        createdAt INTEGER NOT NULL,
                        streak INTEGER DEFAULT 0,
                        timeWindow TEXT NOT NULL
                    );

                    CREATE TABLE IF NOT EXISTS logs (
                        id TEXT PRIMARY KEY NOT NULL,
                        habitId TEXT NOT NULL,
                        timestamp INTEGER NOT NULL,
                        status TEXT NOT NULL,
                        dayOfWeek INTEGER NOT NULL,
                        FOREIGN KEY (habitId) REFERENCES habits (id)
                    );
                `);

                db = database;
                return database;
            } catch (error) {
                initError = error as Error;
                console.error('Database initialization failed:', error);
                throw error;
            }
        })();
    }

    const result = await initPromise;
    if (!result) throw new Error('Database initialization failed');
    return result;
};

export const initDatabase = async () => {
    try {
        await ensureDatabase();
    } catch (error) {
        console.error('Failed to initialize database:', error);
    }
};

export const getHabits = async (): Promise<Habit[]> => {
    try {
        const database = await ensureDatabase();
        return await database.getAllAsync<Habit>('SELECT * FROM habits');
    } catch (error) {
        console.error('getHabits error:', error);
        return [];
    }
};

export const addHabitToDB = async (habit: Habit) => {
    try {
        const database = await ensureDatabase();
        await database.runAsync(
            'INSERT INTO habits (id, name, frequency, effortRating, createdAt, streak, timeWindow) VALUES (?, ?, ?, ?, ?, ?, ?)',
            habit.id, habit.name, habit.frequency, habit.effortRating, habit.createdAt, habit.streak, habit.timeWindow
        );
    } catch (error) {
        console.error('addHabitToDB error:', error);
        throw error;
    }
};

export const logCompletionToDB = async (log: HabitLog) => {
    try {
        const database = await ensureDatabase();
        await database.runAsync(
            'INSERT INTO logs (id, habitId, timestamp, status, dayOfWeek) VALUES (?, ?, ?, ?, ?)',
            log.id, log.habitId, log.timestamp, log.status, log.dayOfWeek
        );
    } catch (error) {
        console.error('logCompletionToDB error:', error);
        throw error;
    }
};

export const updateHabitStreak = async (habitId: string, streak: number) => {
    try {
        const database = await ensureDatabase();
        await database.runAsync('UPDATE habits SET streak = ? WHERE id = ?', streak, habitId);
    } catch (error) {
        console.error('updateHabitStreak error:', error);
    }
};

export const resetAllStreaks = async () => {
    try {
        const database = await ensureDatabase();
        await database.runAsync('UPDATE habits SET streak = 1');
    } catch (error) {
        console.error('resetAllStreaks error:', error);
    }
};

export const getLogsForHabit = async (habitId: string): Promise<HabitLog[]> => {
    try {
        const database = await ensureDatabase();
        return await database.getAllAsync<HabitLog>('SELECT * FROM logs WHERE habitId = ? ORDER BY timestamp DESC', habitId);
    } catch (error) {
        console.error('getLogsForHabit error:', error);
        return [];
    }
};

export const isCompletedToday = async (habitId: string): Promise<boolean> => {
    try {
        const database = await ensureDatabase();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const startOfDay = today.getTime();
        const endOfDay = startOfDay + 24 * 60 * 60 * 1000;

        const result = await database.getFirstAsync<{ count: number }>(
            'SELECT COUNT(*) as count FROM logs WHERE habitId = ? AND timestamp >= ? AND timestamp < ? AND status = ?',
            habitId, startOfDay, endOfDay, 'completed'
        );
        return (result?.count ?? 0) > 0;
    } catch (error) {
        console.error('isCompletedToday error:', error);
        return false;
    }
};

export const getAllLogs = async (): Promise<HabitLog[]> => {
    try {
        const database = await ensureDatabase();
        return await database.getAllAsync<HabitLog>('SELECT * FROM logs ORDER BY timestamp DESC');
    } catch (error) {
        console.error('getAllLogs error:', error);
        return [];
    }
};

export const deleteHabit = async (habitId: string) => {
    try {
        const database = await ensureDatabase();
        // Delete logs first (foreign key)
        await database.runAsync('DELETE FROM logs WHERE habitId = ?', habitId);
        // Delete habit
        await database.runAsync('DELETE FROM habits WHERE id = ?', habitId);
    } catch (error) {
        console.error('deleteHabit error:', error);
        throw error;
    }
};
