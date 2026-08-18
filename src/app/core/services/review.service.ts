import { Injectable, inject } from '@angular/core';
import { AuthService } from './auth.service';
import { CreateReviewPayload, DramaReview } from '../../models/review.model';

@Injectable({
  providedIn: 'root',
})
export class ReviewService {
  private readonly authService = inject(AuthService);

  /**
   * Fetches all reviews for a drama including user profile and like statistics.
   *
   * @param dramaId Unique identifier of the drama.
   * @returns A promise resolving to an array of DramaReview objects.
   */
  public async getDramaReviews(dramaId: string): Promise<DramaReview[]> {
    const supabase = this.authService.getSupabaseClient();
    const currentUser = this.authService.currentProfile();

    const { data: reviewsData, error: reviewsError } = await supabase
      .from('drama_reviews')
      .select('*, profiles(id, username, avatar_url), drama_review_likes(user_id)')
      .eq('drama_id', dramaId)
      .order('created_at', { ascending: false });

    if (reviewsError) {
      console.error('[ReviewService] Error loading reviews:', reviewsError);
      return [];
    }

    return (reviewsData || []).map((row: any) => {
      const likesList: { user_id: string }[] = row.drama_review_likes || [];
      const hasLiked = currentUser ? likesList.some((l) => l.user_id === currentUser.id) : false;

      return {
        id: row.id,
        drama_id: row.drama_id,
        user_id: row.user_id,
        rating: Number(row.rating),
        content: row.content,
        created_at: row.created_at,
        updated_at: row.updated_at,
        profiles: row.profiles,
        likes_count: likesList.length,
        has_liked: hasLiked,
      };
    });
  }

  /**
   * Posts a new review for the authenticated user.
   *
   * @param payload Content and rating information.
   * @returns A promise resolving when the review is successfully created.
   */
  public async postReview(payload: CreateReviewPayload): Promise<void> {
    const user = this.authService.currentProfile();
    if (!user) {
      this.authService.openLoginModal();
      throw new Error('Authentication required.');
    }

    const { error } = await this.authService
      .getSupabaseClient()
      .from('drama_reviews')
      .insert({
        drama_id: payload.drama_id,
        user_id: user.id,
        rating: payload.rating,
        content: payload.content.trim(),
        created_at: new Date().toISOString(),
      });

    if (error) throw error;
  }

  /**
   * Toggles helpful upvote on a review.
   *
   * @param reviewId Unique identifier of the review.
   * @param hasLiked Boolean indicating if the user currently likes the review.
   * @returns A promise resolving when the upvote status is toggled.
   */
  public async toggleReviewLike(reviewId: string, hasLiked: boolean): Promise<void> {
    const user = this.authService.currentProfile();
    if (!user) {
      this.authService.openLoginModal();
      return;
    }

    const supabase = this.authService.getSupabaseClient();

    if (hasLiked) {
      await supabase
        .from('drama_review_likes')
        .delete()
        .eq('review_id', reviewId)
        .eq('user_id', user.id);
    } else {
      await supabase
        .from('drama_review_likes')
        .insert({ review_id: reviewId, user_id: user.id });
    }
  }

  /**
   * Deletes a review owned by the authenticated user.
   *
   * @param reviewId Unique identifier of the review.
   * @returns A promise resolving when deletion is finished.
   */
  public async deleteReview(reviewId: string): Promise<void> {
    const user = this.authService.currentProfile();
    if (!user) return;

    const { error } = await this.authService
      .getSupabaseClient()
      .from('drama_reviews')
      .delete()
      .eq('id', reviewId)
      .eq('user_id', user.id);

    if (error) throw error;
  }
}