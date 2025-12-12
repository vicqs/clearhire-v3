/**
 * Servicio de Badges con Supabase
 */

import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import type { Badge } from '../../types/profile';

export class BadgeService {

    /**
     * Obtener badges del usuario
     */
    async getBadges(profileId: string): Promise<Badge[]> {
        if (!isSupabaseConfigured()) {
            return [];
        }

        try {
            const { data, error } = await supabase!
                .from('badges')
                .select('*')
                .eq('profile_id', profileId)
                .order('earned_at', { ascending: false });

            if (error) throw error;

            return (data || []).map(badge => ({
                id: badge.id,
                name: badge.name,
                description: badge.description,
                icon: badge.icon,
                earnedAt: new Date(badge.earned_at),
                rarity: badge.rarity as 'common' | 'rare' | 'epic'
            }));
        } catch (error) {
            console.error('Error obteniendo badges:', error);
            return [];
        }
    }
}

export const badgeService = new BadgeService();
