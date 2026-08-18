import { inject, Injectable } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { AuthService } from './auth.service';
import { DramaReview, CreateReviewPayload } from '../../models/review.model';

/**
 * ReviewService
 * Handles database operations for drama reviews and community discussions,
 * including retrieval, creation, deletion, helpful upvotes, and moderation permissions.
 */
@Injectable({
  providedIn: 'root',
})
export class ReviewService {
  public readonly authService = inject(AuthService);

  /**
   * Getter accessing the Supabase client instance via AuthService's public method.
   */
  private get supabase(): SupabaseClient {
    return this.authService.getSupabaseClient();
  }

  /**
   * Fetches all community reviews for a given drama, joins author profile data,
   * and calculates total helpful upvotes along with the active user's like status.
   *
   * @param dramaId Unique TMDB drama identifier string.
   * @returns A promise resolving to an array of formatted DramaReview entities.
   */
  public async getDramaReviews(dramaId: string): Promise<DramaReview[]> {
    const currentUserId = this.authService.currentProfile()?.id;

    const { data: reviews, error } = await this.supabase
      .from('drama_reviews')
      .select(`
        id,
        drama_id,
        user_id,
        rating,
        content,
        created_at,
        updated_at,
        profiles (
          id,
          username,
          avatar_url,
          role
        ),
        review_likes (
          user_id
        )
      `)
      .eq('drama_id', dramaId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[ReviewService] Error fetching drama reviews:', error.message);
      throw error;
    }

    return (reviews || []).map((row: any) => {
      const likesList: Array<{ user_id: string }> = row.review_likes || [];
      const hasLiked = currentUserId ? likesList.some((l) => l.user_id === currentUserId) : false;
      const profileData = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;

      return {
        id: row.id,
        drama_id: row.drama_id,
        user_id: row.user_id,
        rating: row.rating,
        content: row.content,
        created_at: row.created_at,
        updated_at: row.updated_at,
        profiles: profileData,
        likes_count: likesList.length,
        has_liked: hasLiked,
      } as DramaReview;
    });
  }

  /**
   * Submits a new user review and star rating for a specific drama.
   *
   * @param payload Object containing target drama_id, numerical rating (1-10), and review text content.
   * @returns A promise resolving to the newly inserted DramaReview record.
   * @throws Error if the user is unauthenticated or insertion fails.
   */
  public async postReview(payload: CreateReviewPayload): Promise<DramaReview> {
    const currentUser = this.authService.currentProfile();
    if (!currentUser) {
      throw new Error('[ReviewService] User must be authenticated to post a review.');
    }

    const { data, error } = await this.supabase
      .from('drama_reviews')
      .insert({
        drama_id: payload.drama_id,
        user_id: currentUser.id,
        rating: payload.rating,
        content: payload.content.trim(),
      })
      .select(`
        id,
        drama_id,
        user_id,
        rating,
        content,
        created_at,
        updated_at,
        profiles (
          id,
          username,
          avatar_url,
          role
        )
      `)
      .single();

    if (error) {
      console.error('[ReviewService] Error inserting review:', error.message);
      throw error;
    }

    const profileData = Array.isArray(data.profiles) ? data.profiles[0] : data.profiles;

    return {
      id: data.id,
      drama_id: data.drama_id,
      user_id: data.user_id,
      rating: data.rating,
      content: data.content,
      created_at: data.created_at,
      updated_at: data.updated_at,
      profiles: profileData,
      likes_count: 0,
      has_liked: false,
    } as DramaReview;
  }

  /**
   * Deletes a review from the database by its unique identifier.
   * Server-side Row Level Security (RLS) policies permit authors, moderators, and admins.
   *
   * @param reviewId Unique identifier of the target review.
   * @returns A promise resolving upon deletion confirmation.
   */
  public async deleteReview(reviewId: string): Promise<void> {
    const { error } = await this.supabase
      .from('drama_reviews')
      .delete()
      .eq('id', reviewId);

    if (error) {
      console.error('[ReviewService] Error deleting review:', error.message);
      throw error;
    }
  }

  /**
   * Toggles helpful upvote status on a community review for the active user.
   *
   * @param reviewId Unique identifier of the review.
   * @param hasLiked Boolean indicating whether the active user has already upvoted the review.
   * @returns A promise resolving when the database operation completes.
   */
  public async toggleReviewLike(reviewId: string, hasLiked: boolean): Promise<void> {
    const currentUser = this.authService.currentProfile();
    if (!currentUser) {
      throw new Error('[ReviewService] User must be authenticated to upvote reviews.');
    }

    if (hasLiked) {
      const { error } = await this.supabase
        .from('review_likes')
        .delete()
        .eq('review_id', reviewId)
        .eq('user_id', currentUser.id);

      if (error) {
        console.error('[ReviewService] Error removing review like:', error.message);
        throw error;
      }
    } else {
      const { error } = await this.supabase
        .from('review_likes')
        .insert({
          review_id: reviewId,
          user_id: currentUser.id,
        });

      if (error) {
        console.error('[ReviewService] Error adding review like:', error.message);
        throw error;
      }
    }
  }

  /**
   * Evaluates if the active authenticated user has permissions to delete a given review.
   * Permissions are granted to the author or users holding 'admin' / 'moderator' roles.
   *
   * @param review Target DramaReview entity.
   * @returns Boolean indicating whether deletion is authorized.
   */
  public canDeleteReview(review: DramaReview): boolean {
    const myProfile = this.authService.currentProfile();
    if (!myProfile) {
      return false;
    }

    const isAuthor = myProfile.id === review.user_id;
    const isStaff = myProfile.role === 'admin' || myProfile.role === 'moderator';

    return isAuthor || isStaff;
  }
}