import { HabitTemplate } from './types';

export const CATEGORY_COLORS: Record<HabitTemplate['category'], string> = {
    sleep: '#38BDF8',
    fitness: '#22C55E',
    mindfulness: '#A855F7',
    study: '#F97316',
};

export const habitTemplates: HabitTemplate[] = [
    {
        id: 'sleep-8h',
        name: 'Sleep 8 hours',
        category: 'sleep',
        icon: 'bed',
        defaultFrequency: 7,
        defaultTimeWindow: 'evening',
        effortLevel: 'medium',
    },
    {
        id: 'morning-run',
        name: 'Morning Run',
        category: 'fitness',
        icon: 'walk',
        defaultFrequency: 4,
        defaultTimeWindow: 'morning',
        effortLevel: 'high',
    },
    {
        id: 'meditation',
        name: '10m Meditation',
        category: 'mindfulness',
        icon: 'leaf',
        defaultFrequency: 5,
        defaultTimeWindow: 'morning',
        effortLevel: 'low',
    },
    {
        id: 'reading',
        name: 'Read 20 pages',
        category: 'study',
        icon: 'book',
        defaultFrequency: 5,
        defaultTimeWindow: 'evening',
        effortLevel: 'medium',
    },
    {
        id: 'stretching',
        name: 'Stretch & Mobility',
        category: 'fitness',
        icon: 'body',
        defaultFrequency: 6,
        defaultTimeWindow: 'afternoon',
        effortLevel: 'low',
    },
    {
        id: 'focus-block',
        name: 'Deep Work Block',
        category: 'study',
        icon: 'code-slash',
        defaultFrequency: 4,
        defaultTimeWindow: 'afternoon',
        effortLevel: 'high',
    },
    {
        id: 'gratitude',
        name: 'Gratitude Journal',
        category: 'mindfulness',
        icon: 'heart',
        defaultFrequency: 7,
        defaultTimeWindow: 'evening',
        effortLevel: 'low',
    },
];
