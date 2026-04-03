import { Badge, BadgeConditionInput } from './types';

export const badgeCatalog: Badge[] = [
    {
        id: 'streak-7',
        name: '7 Day Streak',
        description: 'Maintain a 7-day streak on any habit.',
        condition: ({ habits }: BadgeConditionInput) => habits.some(h => h.streak >= 7),
    },
    {
        id: 'perfect-week',
        name: 'Perfect Week',
        description: 'Complete every scheduled habit this week.',
        condition: ({ report }: BadgeConditionInput) => report.totalMissed === 0 && report.totalCompletions > 0,
    },
    {
        id: 'consistency-king',
        name: 'Consistency King',
        description: 'Keep a habit at 90%+ success for the week.',
        condition: ({ report }: BadgeConditionInput) => report.habitMetrics.some(m => m.successRate >= 90),
    },
    {
        id: 'comeback',
        name: 'Comeback Kid',
        description: 'Bounce back with 3+ completions after misses.',
        condition: ({ report }: BadgeConditionInput) => report.habitMetrics.some(m => m.missed > 0 && m.completions >= 3),
    },
];
