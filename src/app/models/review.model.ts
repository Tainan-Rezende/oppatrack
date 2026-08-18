import { UserProfile } from './user.model';

/**
 * Represents a community review for a specific drama.
 */
export interface DramaReview {
  id: string;
  drama_id: string;
  user_id: string;
  rating: number;
  content: string;
  created_at: string;
  updated_at: string;
  profiles?: UserProfile;
  likes_count: number;
  has_liked?: boolean;
}

/**
 * Payload data required to submit a new review.
 */
export interface CreateReviewPayload {
  drama_id: string;
  rating: number;
  content: string;
}

/**
 * Sort options available for community reviews.
 */
export type ReviewSortOption = 'relevant' | 'newest' | 'oldest' | 'highest' | 'lowest';