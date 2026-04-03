import { supabase } from '../lib/supabase';
import { badgeCatalog } from './badges';
import { BadgeConditionInput, UserBadge } from './types';

/** PostgREST: relation not exposed / missing from schema cache (e.g. table not created yet). */
function isMissingUserBadgesTable(error: unknown): boolean {
    return typeof error === 'object' && error !== null && (error as { code?: string }).code === 'PGRST205';
}

let warnedUserBadgesMigration = false;
function warnUserBadgesMigrationOnce() {
    if (!__DEV__ || warnedUserBadgesMigration) return;
    warnedUserBadgesMigration = true;
    console.warn(
        '[badges] Add the user_badges table: run server/database/user-badges-migration.sql in the Supabase SQL editor.'
    );
}

export const evaluateBadges = (input: BadgeConditionInput): string[] => {
    return badgeCatalog.filter(badge => badge.condition(input)).map(badge => badge.id);
};

export const fetchUserBadges = async (): Promise<UserBadge[]> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        const { data, error } = await supabase
            .from('user_badges')
            .select('*')
            .eq('user_id', user.id)
            .order('unlocked_at', { ascending: false });

        if (error) {
            if (isMissingUserBadgesTable(error)) {
                warnUserBadgesMigrationOnce();
                return [];
            }
            throw error;
        }

        return (data || []).map(row => ({
            badgeId: row.badge_id,
            unlockedAt: new Date(row.unlocked_at).getTime(),
        }));
    } catch (error) {
        if (isMissingUserBadgesTable(error)) {
            warnUserBadgesMigrationOnce();
            return [];
        }
        console.error('fetchUserBadges error:', error);
        return [];
    }
};

export const saveNewBadges = async (existingBadges: UserBadge[], badgeIds: string[]): Promise<UserBadge[]> => {
    if (!badgeIds.length) return existingBadges;

    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return existingBadges;

        const existingSet = new Set(existingBadges.map(b => b.badgeId));
        const newIds = badgeIds.filter(id => !existingSet.has(id));
        if (!newIds.length) return existingBadges;

        const nowIso = new Date().toISOString();
        const rows = newIds.map(id => ({
            user_id: user.id,
            badge_id: id,
            unlocked_at: nowIso,
        }));

        const { error } = await supabase
            .from('user_badges')
            .insert(rows);

        if (error) {
            if (isMissingUserBadgesTable(error)) {
                warnUserBadgesMigrationOnce();
                return existingBadges;
            }
            throw error;
        }

        const newBadges: UserBadge[] = newIds.map(id => ({ badgeId: id, unlockedAt: Date.parse(nowIso) }));
        return [...existingBadges, ...newBadges];
    } catch (error) {
        if (isMissingUserBadgesTable(error)) {
            warnUserBadgesMigrationOnce();
            return existingBadges;
        }
        console.error('saveNewBadges error:', error);
        return existingBadges;
    }
};
