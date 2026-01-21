import { Habit, HabitLog } from '../core/types';

/**
 * NotificationService - Stub implementation
 * 
 * Push notifications require a development build and are not supported in Expo Go.
 * This stub provides a no-op implementation so the app runs without errors.
 * 
 * To enable notifications:
 * 1. Create a development build: npx expo prebuild
 * 2. Run: npx expo run:android or npx expo run:ios
 */
export class NotificationService {
    static async registerForPushNotifications(): Promise<boolean> {
        if (__DEV__) {
            console.log('📱 Push notifications require a development build. Using stub service.');
        }
        return false;
    }

    static async scheduleHabitReminders(_habits: Habit[]): Promise<void> {
        // No-op in Expo Go
    }

    static async sendHighRiskWarning(_habit: Habit, _logs: HabitLog[]): Promise<void> {
        // No-op in Expo Go
    }

    static async sendWeeklyReportNotification(_successRate: number): Promise<void> {
        // No-op in Expo Go
    }

    static async sendStreakMilestone(_habitName: string, _streak: number): Promise<void> {
        // No-op in Expo Go
    }

    static async cancelAll(): Promise<void> {
        // No-op in Expo Go
    }
}
