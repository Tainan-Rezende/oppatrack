import { inject, Injectable } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { AuthService } from './auth.service';
import { Achievement, UserAchievement } from '../../models/achievement.model';

/**
 * AchievementService
 * Manages retrieval, evaluation, and selection of user achievements and badges.
 */
@Injectable({
  providedIn: 'root',
})
export class AchievementService {
  private readonly authService = inject(AuthService);

  private get supabase(): SupabaseClient {
    return this.authService.getSupabaseClient();
  }

  /**
   * Fetches all registered achievements in the global catalog.
   *
   * @returns A promise resolving to an array of Achievement entities.
   */
  public async getAllAchievements(): Promise<Achievement[]> {
    const { data, error } = await this.supabase
      .from('achievements')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('[AchievementService] Error fetching achievements catalog:', error.message);
      throw error;
    }
    return data || [];
  }

  /**
   * Evaluates and fetches all achievements unlocked by a specific user.
   *
   * @param userId Unique identifier of target user profile.
   * @returns A promise resolving to an array of UserAchievement join records.
   */
  public async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    try {
      // Trigger database auto-evaluation stored procedure
      await this.supabase.rpc('evaluate_user_achievements', { target_user_id: userId });
    } catch (rpcErr) {
      console.warn('[AchievementService] RPC evaluation notice:', rpcErr);
    }

    const { data, error } = await this.supabase
      .from('user_achievements')
      .select(`
        id,
        user_id,
        achievement_id,
        unlocked_at,
        achievement:achievements (*)
      `)
      .eq('user_id', userId);

    if (error) {
      console.error('[AchievementService] Error fetching user achievements:', error.message);
      throw error;
    }

    return (data || []).map((row: any) => ({
      ...row,
      achievement: Array.isArray(row.achievement) ? row.achievement[0] : row.achievement,
    }));
  }

  /**
   * Sets or unsets the featured achievement badge displayed on the active user's hero card.
   *
   * @param badgeId Target achievement ID or null to remove featured pin.
   */
  public async setFeaturedBadge(badgeId: string | null): Promise<void> {
    const currentUser = this.authService.currentUser();
    if (!currentUser) throw new Error('[AchievementService] User is not authenticated.');

    const { error } = await this.supabase
      .from('profiles')
      .update({ featured_badge_id: badgeId })
      .eq('id', currentUser.id);

    if (error) {
      console.error('[AchievementService] Error setting featured badge:', error.message);
      throw error;
    }

    await this.authService.fetchProfile(currentUser.id);
  }
}