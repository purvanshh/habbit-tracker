import * as SQLite from 'expo-sqlite';
import { Habit, HabitAdjustment, HabitLog, WeeklyReport, getWeekNumber } from './types';

let db: SQLite.SQLiteDatabase | null = null;
let initPromise: Promise<SQLite.SQLiteDatabase | null> | null = null;

const DB_NAME = 'habits_v3.db';

const ensureDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
    if (db) return db;

    if (!initPromise) {
        initPromise = (async () => {
            try {
                const database = await SQLite.openDatabaseAsync(DB_NAME);

                await database.execAsync(`PRAGMA journal_mode = WAL;`);

                await database.execAsync(`
                    CREATE TABLE IF NOT EXISTS habits (
                        id TEXT PRIMARY KEY NOT NULL,
                        name TEXT NOT NULL,
                        icon TEXT DEFAULT 'barbell',
                        frequency TEXT NOT NULL,
                        selectedDays TEXT DEFAULT '[]',
                        effortRating INTEGER NOT NULL,
                        createdAt INTEGER NOT NULL,
                        streak INTEGER DEFAULT 0,
                        timeWindow TEXT NOT NULL,
                        isPaused INTEGER DEFAULT 0,
                        pausedUntil INTEGER,
                        skipsUsedThisWeek INTEGER DEFAULT 0,
                        maxSkipsPerWeek INTEGER DEFAULT 2,
                        lastSkipResetWeek INTEGER DEFAULT 0
                    );
                `);

                await database.execAsync(`
                    CREATE TABLE IF NOT EXISTS logs (
                        id TEXT PRIMARY KEY NOT NULL,
                        habitId TEXT NOT NULL,
                        timestamp INTEGER NOT NULL,
                        status TEXT NOT NULL,
                        dayOfWeek INTEGER NOT NULL
                    );
                `);

                await database.execAsync(`
                    CREATE TABLE IF NOT EXISTS weekly_reports (
                        id TEXT PRIMARY KEY NOT NULL,
                        weekStart INTEGER NOT NULL,
                        weekEnd INTEGER NOT NULL,
                        generatedAt INTEGER NOT NULL,
                        data TEXT NOT NULL
                    );
                `);

                await database.execAsync(`
                    CREATE TABLE IF NOT EXISTS habit_adjustments (
                        id TEXT PRIMARY KEY NOT NULL,
                        habitId TEXT NOT NULL,
                        timestamp INTEGER NOT NULL,
                        type TEXT NOT NULL,
                        previousValue TEXT,
                        newValue TEXT,
                        wasAutoApplied INTEGER DEFAULT 0
                    );
                `);

                db = database;
                return database;
            } catch (error) {
                console.error('Database initialization failed:', error);
                db = null;
                initPromise = null;
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
        const rows = await database.getAllAsync<any>('SELECT * FROM habits');
        const currentWeek = getWeekNumber();

        return rows.map(row => {
            // Reset skips if new week
            const skipsUsed = row.lastSkipResetWeek === currentWeek ? row.skipsUsedThisWeek : 0;

            return {
                ...row,
                icon: row.icon || 'barbell',
                selectedDays: JSON.parse(row.selectedDays || '[]'),
                isPaused: row.isPaused === 1,
                skipsUsedThisWeek: skipsUsed,
                maxSkipsPerWeek: row.maxSkipsPerWeek || 2,
                lastSkipResetWeek: row.lastSkipResetWeek || currentWeek,
            };
        });
    } catch (error) {
        console.error('getHabits error:', error);
        return [];
    }
};

export const addHabitToDB = async (habit: Habit) => {
    try {
        const database = await ensureDatabase();
        await database.runAsync(
            'INSERT INTO habits (id, name, icon, frequency, selectedDays, effortRating, createdAt, streak, timeWindow, isPaused, pausedUntil, skipsUsedThisWeek, maxSkipsPerWeek, lastSkipResetWeek) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            habit.id, habit.name, habit.icon || 'barbell', habit.frequency, JSON.stringify(habit.selectedDays || []), habit.effortRating, habit.createdAt, habit.streak, habit.timeWindow, habit.isPaused ? 1 : 0, habit.pausedUntil ?? null, habit.skipsUsedThisWeek || 0, habit.maxSkipsPerWeek || 2, habit.lastSkipResetWeek || getWeekNumber()
        );
    } catch (error) {
        console.error('addHabitToDB error:', error);
        throw error;
    }
};

export const updateHabit = async (habitId: string, updates: Partial<Habit>) => {
    try {
        const database = await ensureDatabase();
        const fields: string[] = [];
        const values: any[] = [];

        if (updates.name !== undefined) { fields.push('name = ?'); values.push(updates.name); }
        if (updates.icon !== undefined) { fields.push('icon = ?'); values.push(updates.icon); }
        if (updates.frequency !== undefined) { fields.push('frequency = ?'); values.push(updates.frequency); }
        if (updates.selectedDays !== undefined) { fields.push('selectedDays = ?'); values.push(JSON.stringify(updates.selectedDays)); }
        if (updates.effortRating !== undefined) { fields.push('effortRating = ?'); values.push(updates.effortRating); }
        if (updates.timeWindow !== undefined) { fields.push('timeWindow = ?'); values.push(updates.timeWindow); }
        if (updates.isPaused !== undefined) { fields.push('isPaused = ?'); values.push(updates.isPaused ? 1 : 0); }
        if (updates.pausedUntil !== undefined) { fields.push('pausedUntil = ?'); values.push(updates.pausedUntil); }
        if (updates.streak !== undefined) { fields.push('streak = ?'); values.push(updates.streak); }
        if (updates.skipsUsedThisWeek !== undefined) { fields.push('skipsUsedThisWeek = ?'); values.push(updates.skipsUsedThisWeek); }
        if (updates.lastSkipResetWeek !== undefined) { fields.push('lastSkipResetWeek = ?'); values.push(updates.lastSkipResetWeek); }

        if (fields.length > 0) {
            values.push(habitId);
            await database.runAsync(`UPDATE habits SET ${fields.join(', ')} WHERE id = ?`, ...values);
        }
    } catch (error) {
        console.error('updateHabit error:', error);
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
            'SELECT COUNT(*) as count FROM logs WHERE habitId = ? AND timestamp >= ? AND timestamp < ? AND (status = ? OR status = ?)',
            habitId, startOfDay, endOfDay, 'completed', 'skipped'
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

export const getLogsForWeek = async (weekStart: number, weekEnd: number): Promise<HabitLog[]> => {
    try {
        const database = await ensureDatabase();
        return await database.getAllAsync<HabitLog>(
            'SELECT * FROM logs WHERE timestamp >= ? AND timestamp < ? ORDER BY timestamp DESC',
            weekStart, weekEnd
        );
    } catch (error) {
        console.error('getLogsForWeek error:', error);
        return [];
    }
};

export const deleteHabit = async (habitId: string) => {
    try {
        const database = await ensureDatabase();
        await database.runAsync('DELETE FROM logs WHERE habitId = ?', habitId);
        await database.runAsync('DELETE FROM habits WHERE id = ?', habitId);
    } catch (error) {
        console.error('deleteHabit error:', error);
        throw error;
    }
};

export const saveWeeklyReport = async (report: WeeklyReport) => {
    try {
        const database = await ensureDatabase();
        await database.runAsync(
            'INSERT OR REPLACE INTO weekly_reports (id, weekStart, weekEnd, generatedAt, data) VALUES (?, ?, ?, ?, ?)',
            report.id, report.weekStart, report.weekEnd, report.generatedAt, JSON.stringify(report)
        );
    } catch (error) {
        console.error('saveWeeklyReport error:', error);
    }
};

export const getWeeklyReports = async (limit = 4): Promise<WeeklyReport[]> => {
    try {
        const database = await ensureDatabase();
        const rows = await database.getAllAsync<{ data: string }>(
            'SELECT data FROM weekly_reports ORDER BY weekStart DESC LIMIT ?', limit
        );
        return rows.map(row => JSON.parse(row.data));
    } catch (error) {
        console.error('getWeeklyReports error:', error);
        return [];
    }
};

export const getLatestWeeklyReport = async (): Promise<WeeklyReport | null> => {
    try {
        const database = await ensureDatabase();
        const row = await database.getFirstAsync<{ data: string }>(
            'SELECT data FROM weekly_reports ORDER BY weekStart DESC LIMIT 1'
        );
        return row ? JSON.parse(row.data) : null;
    } catch (error) {
        console.error('getLatestWeeklyReport error:', error);
        return null;
    }
};

export const saveAdjustment = async (adjustment: HabitAdjustment) => {
    try {
        const database = await ensureDatabase();
        await database.runAsync(
            'INSERT INTO habit_adjustments (id, habitId, timestamp, type, previousValue, newValue, wasAutoApplied) VALUES (?, ?, ?, ?, ?, ?, ?)',
            adjustment.id, adjustment.habitId, adjustment.timestamp, adjustment.type, adjustment.previousValue, adjustment.newValue, adjustment.wasAutoApplied ? 1 : 0
        );
    } catch (error) {
        console.error('saveAdjustment error:', error);
    }
};

export const getAdjustmentsForHabit = async (habitId: string): Promise<HabitAdjustment[]> => {
    try {
        const database = await ensureDatabase();
        const rows = await database.getAllAsync<any>(
            'SELECT * FROM habit_adjustments WHERE habitId = ? ORDER BY timestamp DESC', habitId
        );
        return rows.map(row => ({ ...row, wasAutoApplied: row.wasAutoApplied === 1 }));
    } catch (error) {
        console.error('getAdjustmentsForHabit error:', error);
        return [];
    }
};
