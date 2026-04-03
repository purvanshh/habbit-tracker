import { useCallback, useState } from 'react';
import { DayOfWeek, Frequency, HabitTemplate } from '../core/types';
import { useHabitStore } from '../store/useHabitStore';

export interface TemplateValues {
    name: string;
    icon: string;
    frequency: Frequency;
    selectedDays: DayOfWeek[];
    effort: number;
    timeWindow: string;
}

const allDays: DayOfWeek[] = [0, 1, 2, 3, 4, 5, 6];

const effortLevelToRating = (level: HabitTemplate['effortLevel']): number => {
    switch (level) {
        case 'low': return 1;
        case 'high': return 4;
        default: return 3;
    }
};

const deriveSelectedDays = (defaultFrequency: number): DayOfWeek[] => {
    if (defaultFrequency >= 7) return allDays;
    if (defaultFrequency === 6) return [1, 2, 3, 4, 5, 6]; // skip Sunday
    if (defaultFrequency === 5) return [1, 2, 3, 4, 5]; // weekdays
    if (defaultFrequency === 4) return [1, 3, 5, 6];
    if (defaultFrequency === 3) return [1, 3, 5];
    if (defaultFrequency === 2) return [2, 5];
    return [0];
};

const deriveFrequency = (defaultFrequency: number): Frequency => {
    if (defaultFrequency >= 6) return 'daily';
    if (defaultFrequency === 1) return 'weekly';
    return 'custom';
};

const deriveTemplateValues = (template: HabitTemplate): TemplateValues => {
    const selectedDays = deriveSelectedDays(template.defaultFrequency).sort() as DayOfWeek[];
    const frequency = deriveFrequency(template.defaultFrequency);
    const effort = effortLevelToRating(template.effortLevel);

    return {
        name: template.name,
        icon: template.icon,
        frequency,
        selectedDays,
        effort,
        timeWindow: template.defaultTimeWindow || 'anytime',
    };
};

const normalizeDaysForFrequency = (frequency: Frequency, selectedDays: DayOfWeek[]): DayOfWeek[] => {
    if (frequency === 'daily') return allDays;
    if (frequency === 'weekly') return [1]; // Monday
    return selectedDays.length ? selectedDays : [1, 3, 5];
};

export const useTemplatePrefill = () => {
    const addHabit = useHabitStore(s => s.addHabit);
    const [busyTemplateId, setBusyTemplateId] = useState<string | null>(null);

    const prefillTemplate = useCallback((template: HabitTemplate): TemplateValues => {
        return deriveTemplateValues(template);
    }, []);

    const quickAddTemplate = useCallback(async (template: HabitTemplate) => {
        if (busyTemplateId) return { success: false as const, error: 'busy' };
        const values = deriveTemplateValues(template);
        const finalDays = normalizeDaysForFrequency(values.frequency, values.selectedDays);
        setBusyTemplateId(template.id);
        try {
            await addHabit(values.name, values.icon, values.frequency, finalDays, values.effort, values.timeWindow);
            return { success: true as const };
        } catch (error) {
            console.error('quickAddTemplate error', error);
            return { success: false as const, error: 'failed' };
        } finally {
            setBusyTemplateId(null);
        }
    }, [addHabit, busyTemplateId]);

    return { prefillTemplate, quickAddTemplate, busyTemplateId };
};

export const mapTemplateToFormValues = (template: HabitTemplate): TemplateValues => deriveTemplateValues(template);

export const templateDefaults = {
    normalizeDaysForFrequency,
};
