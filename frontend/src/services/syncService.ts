import { getNetworkStateAsync } from 'expo-network';
import { addHabitToDB, deleteHabit, logCompletionToDB, updateHabit, updateHabitStreak } from '../core/db';
import { SyncQueueItem, enqueue, dequeue, getQueue, incrementRetry, queueSize } from '../core/syncQueue';

const MAX_RETRIES = 5;
const BASE_DELAY_MS = 1000;
const MAX_DELAY_MS = 30000;

type SyncCallbacks = {
    onSynced?: (timestamp: number) => void;
    onQueueChange?: (size: number) => void;
};

let syncing = false;
let callbacks: SyncCallbacks = {};
let pollInterval: NodeJS.Timeout | null = null;

const backoff = (retryCount: number) => Math.min(MAX_DELAY_MS, BASE_DELAY_MS * Math.pow(2, retryCount));

/** Avoid crashing when expo-network is unavailable (e.g. some web/Expo Go edge cases). */
async function getNetworkStateSafe() {
    try {
        return await getNetworkStateAsync();
    } catch {
        return { isConnected: true, isInternetReachable: true as boolean | null };
    }
}

const processItem = async (item: SyncQueueItem) => {
    const { type, payload } = item;
    if (type === 'CREATE') {
        await addHabitToDB(payload.habit as any);
    } else if (type === 'UPDATE') {
        await updateHabit(payload.habitId as string, payload.updates as any);
    } else if (type === 'DELETE') {
        await deleteHabit(payload.habitId as string);
    } else if (type === 'LOG') {
        const logPayload = payload.log as any;
        const habitUpdates = payload.habitUpdates as any;
        await logCompletionToDB(logPayload);
        if (habitUpdates) {
            await updateHabitStreak(
                habitUpdates.habitId,
                habitUpdates.streak,
                habitUpdates.longestStreak,
                habitUpdates.lastCompletedDate,
                habitUpdates.freezeTokens,
            );
            if (habitUpdates.additionalUpdates) {
                await updateHabit(habitUpdates.habitId, habitUpdates.additionalUpdates);
            }
        }
    }
};

const flushQueue = async () => {
    if (syncing) return;
    syncing = true;
    try {
        callbacks.onQueueChange && callbacks.onQueueChange(await queueSize());
        let queue = await getQueue();
        while (queue.length > 0) {
            const item = queue[0];
            try {
                await processItem(item);
                await dequeue();
                callbacks.onQueueChange && callbacks.onQueueChange(await queueSize());
                queue = await getQueue();
            } catch (err) {
                console.warn('Sync item failed, will retry', item.type, err);
                if (item.retryCount + 1 >= MAX_RETRIES) {
                    await dequeue();
                    callbacks.onQueueChange && callbacks.onQueueChange(await queueSize());
                } else {
                    await incrementRetry(item.id);
                    const delay = backoff(item.retryCount + 1);
                    await new Promise(res => setTimeout(res, delay));
                }
                queue = await getQueue();
            }
        }
        callbacks.onSynced && callbacks.onSynced(Date.now());
    } finally {
        syncing = false;
    }
};

export const triggerSync = async () => {
    const state = await getNetworkStateSafe();
    if (!state.isConnected || state.isInternetReachable === false) {
        return;
    }
    return flushQueue();
};

export const startSyncService = (cbs: SyncCallbacks = {}) => {
    callbacks = cbs;
    if (pollInterval) return null;

    // Simple, robust polling (8s); avoids addNetworkStateListener (not reliable with import * as on all platforms)
    pollInterval = setInterval(() => {
        void triggerSync();
    }, 8000);

    void triggerSync();
    return null;
};

export const stopSyncService = () => {
    if (pollInterval) {
        clearInterval(pollInterval);
        pollInterval = null;
    }
};

// Helper to enqueue on failure
export const runOrEnqueue = async (
    type: SyncQueueItem['type'],
    payload: Record<string, unknown>,
    action: () => Promise<void>,
) => {
    try {
        await action();
        await triggerSync();
    } catch (err) {
        console.warn('Falling back to queue for', type, err);
        await enqueue({ type, payload });
        callbacks.onQueueChange && callbacks.onQueueChange(await queueSize());
    }
};
