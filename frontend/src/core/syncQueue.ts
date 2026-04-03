import AsyncStorage from '@react-native-async-storage/async-storage';

export type SyncQueueType = 'CREATE' | 'UPDATE' | 'DELETE' | 'LOG';

export interface SyncQueueItem {
    id: string;
    type: SyncQueueType;
    payload: Record<string, unknown>;
    createdAt: number;
    retryCount: number;
}

const STORAGE_KEY = 'syncQueue:v1';

type Listener = (items: SyncQueueItem[]) => void;

let queue: SyncQueueItem[] = [];
let initialized = false;
const listeners: Set<Listener> = new Set();

const emit = () => {
    listeners.forEach((cb) => cb([...queue]));
};

const saveQueue = async () => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
    emit();
};

const loadQueue = async () => {
    if (initialized) return queue;
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    queue = raw ? JSON.parse(raw) : [];
    initialized = true;
    emit();
    return queue;
};

export const subscribe = (listener: Listener) => {
    listeners.add(listener);
    listener([...queue]);
    return () => listeners.delete(listener);
};

export const getQueue = async () => {
    await loadQueue();
    return [...queue];
};

export const enqueue = async (item: Omit<SyncQueueItem, 'id' | 'createdAt' | 'retryCount'> & { id?: string }) => {
    await loadQueue();
    const newItem: SyncQueueItem = {
        id: item.id || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`,
        type: item.type,
        payload: item.payload,
        createdAt: Date.now(),
        retryCount: 0,
    };
    queue.push(newItem);
    await saveQueue();
    return newItem;
};

export const dequeue = async () => {
    await loadQueue();
    const item = queue.shift();
    if (item) await saveQueue();
    return item;
};

export const updateItem = async (id: string, updater: (item: SyncQueueItem) => SyncQueueItem) => {
    await loadQueue();
    queue = queue.map((item) => (item.id === id ? updater(item) : item));
    await saveQueue();
};

export const clearQueue = async () => {
    queue = [];
    await saveQueue();
};

export const incrementRetry = async (id: string) => {
    await updateItem(id, (item) => ({ ...item, retryCount: item.retryCount + 1 }));
};

export const queueSize = async () => {
    await loadQueue();
    return queue.length;
};
