/**
 * Rarity tier for achievements and visual glow styles.
 */
export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary';

/**
 * Functional category grouping for badges.
 */
export type AchievementCategory = 'volume' | 'diversity' | 'engagement' | 'special';

/**
 * Core Achievement definition.
 */
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: AchievementRarity;
  category: AchievementCategory;
  created_at: string;
}

/**
 * Unlocked achievement representation associated with a user profile.
 */
export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
  achievement?: Achievement;
}