import { Component, inject, OnInit, OnDestroy, signal, HostListener, effect, computed, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Drama } from '../../models/drama.model';
import { DramaService } from '../../core/services/drama.service';
import { TrackerService } from '../../core/services/tracker.service';
import { ReviewService } from '../../core/services/review.service';
import { AuthService } from '../../core/services/auth.service';
import { UserDramaTracker } from '../../models/tracker.model';
import { DramaReview, ReviewSortOption } from '../../models/review.model';

export type DetailTab = 'info' | 'cast' | 'photos';

/**
 * DramaDetail Component
 * Manages full presentation of a drama, technical metadata, user watchlist tracking,
 * community reviews breakdown, custom dropdown filters, pagination, and photo gallery lightbox.
 */
@Component({
  selector: 'app-drama-detail',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './drama-detail.html',
  styleUrl: './drama-detail.scss',
})
export class DramaDetail implements OnInit, OnDestroy {
  // Service Injections
  private readonly route = inject(ActivatedRoute);
  private readonly dramaService = inject(DramaService);
  private readonly reviewService = inject(ReviewService);
  private readonly elementRef = inject(ElementRef);
  public readonly trackerService = inject(TrackerService);
  public readonly authService = inject(AuthService);

  // Drama & Navigation State
  public drama = signal<Drama | null>(null);
  public isLoading = signal<boolean>(true);
  public activeTab = signal<DetailTab>('info');

  // Personal Watchlist Tracking State
  public currentTracker = signal<UserDramaTracker | null>(null);

  // Reviews and Discussion State
  public rawReviews = signal<DramaReview[]>([]);
  public isLoadingReviews = signal<boolean>(false);
  public isSubmittingReview = signal<boolean>(false);
  public newReviewContent = signal<string>('');
  public newReviewRating = signal<number>(10);
  public readonly maxReviewLength = 3000;

  // Custom Dropdown & Filter State
  public isSortDropdownOpen = signal<boolean>(false);
  public selectedScoreFilter = signal<number | null>(null);
  public selectedSort = signal<ReviewSortOption>('relevant');

  // Pagination State (5 reviews per page)
  public currentPage = signal<number>(1);
  public readonly pageSize = 5;

  // Human-readable labels for the custom sort dropdown
  public readonly sortLabels: Record<ReviewSortOption, string> = {
    relevant: 'Mais Relevantes (Úteis)',
    newest: 'Mais Recentes',
    oldest: 'Mais Antigos',
    highest: 'Maior Nota',
    lowest: 'Menor Nota',
  };

  // Fullscreen photo gallery state
  public selectedPhotoIndex = signal<number | null>(null);

  private routeSubscription?: Subscription;

  /**
   * Computes the overall average community rating from all reviews.
   */
  public internalCommunityRating = computed(() => {
    const list = this.rawReviews();
    if (list.length === 0) return null;
    const sum = list.reduce((acc, curr) => acc + curr.rating, 0);
    return (sum / list.length).toFixed(1);
  });

  /**
   * Computes the distribution breakdown of ratings from 10 down to 1 star (Amazon-style).
   */
  public ratingBreakdown = computed(() => {
    const list = this.rawReviews();
    const total = list.length;
    const scores = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1];

    return scores.map((score) => {
      const count = list.filter((r) => Math.round(r.rating) === score).length;
      const percentage = total > 0 ? (count / total) * 100 : 0;
      return { score, count, percentage };
    });
  });

  /**
   * Computes the filtered and sorted review list before pagination.
   */
  public displayedReviews = computed(() => {
    let list = [...this.rawReviews()];
    const scoreFilter = this.selectedScoreFilter();
    const sort = this.selectedSort();

    if (scoreFilter !== null) {
      list = list.filter((r) => Math.round(r.rating) === scoreFilter);
    }

    switch (sort) {
      case 'relevant':
        list.sort((a, b) => b.likes_count - a.likes_count || new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'newest':
        list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'oldest':
        list.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case 'highest':
        list.sort((a, b) => b.rating - a.rating);
        break;
      case 'lowest':
        list.sort((a, b) => a.rating - b.rating);
        break;
    }

    return list;
  });

  /**
   * Computes total number of pages based on filtered reviews.
   */
  public totalPages = computed(() => {
    return Math.ceil(this.displayedReviews().length / this.pageSize) || 1;
  });

  /**
   * Computes the paginated slice of reviews for the current page.
   */
  public pagedReviews = computed(() => {
    const list = this.displayedReviews();
    const startIndex = (this.currentPage() - 1) * this.pageSize;
    return list.slice(startIndex, startIndex + this.pageSize);
  });

  constructor() {
    // Synchronize tracker state whenever a change occurs
    effect(() => {
      this.trackerService.lastUpdated();
      const currentDrama = this.drama();
      if (currentDrama) {
        this.loadTrackingStatus(currentDrama.id.toString());
      }
    });
  }

  ngOnInit(): void {
    this.routeSubscription = this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.fetchDramaDetails(id);
      }
    });
  }

  /**
   * Fetches detailed drama metadata, watchlist state, and community reviews.
   *
   * @param id TMDB Drama identifier.
   */
  private fetchDramaDetails(id: string): void {
    this.isLoading.set(true);
    this.activeTab.set('info');

    this.dramaService.getDramaById(id).subscribe({
      next: (data) => {
        this.drama.set(data);
        this.isLoading.set(false);
        this.loadTrackingStatus(data.id.toString());
        this.loadDramaReviews(data.id.toString());
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      error: (err) => {
        console.error('[DramaDetail] Error fetching drama metadata:', err);
        this.isLoading.set(false);
      },
    });
  }

  /**
   * Loads personal tracking status and auto-fills the review score if previously rated.
   *
   * @param dramaId Unique identifier of the drama.
   */
  public async loadTrackingStatus(dramaId: string): Promise<void> {
    const tracking = await this.trackerService.getDramaTracking(dramaId);
    this.currentTracker.set(tracking);

    if (tracking && tracking.rating && tracking.rating > 0) {
      this.newReviewRating.set(Math.round(tracking.rating));
    }
  }

  /**
   * Loads community reviews and discussion comments for the drama.
   *
   * @param dramaId Unique identifier of the drama.
   */
  public async loadDramaReviews(dramaId: string): Promise<void> {
    this.isLoadingReviews.set(true);
    try {
      const data = await this.reviewService.getDramaReviews(dramaId);
      this.rawReviews.set(data);
    } catch (err) {
      console.error('[DramaDetail] Error loading community reviews:', err);
    } finally {
      this.isLoadingReviews.set(false);
    }
  }

  /**
   * Navigates to a specific page of reviews.
   *
   * @param page Target page number.
   */
  public goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  /**
   * Navigates to the previous reviews page.
   */
  public prevPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update((p) => p - 1);
    }
  }

  /**
   * Navigates to the next reviews page.
   */
  public nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update((p) => p + 1);
    }
  }

  /**
   * Toggles the open state of the custom sort dropdown.
   */
  public toggleSortDropdown(event?: Event): void {
    if (event) event.stopPropagation();
    this.isSortDropdownOpen.update((v) => !v);
  }

  /**
   * Selects a sort option from the custom dropdown and resets pagination to page 1.
   *
   * @param sort Target sort strategy.
   */
  public selectSortOption(sort: ReviewSortOption): void {
    this.selectedSort.set(sort);
    this.isSortDropdownOpen.set(false);
    this.currentPage.set(1);
  }

  /**
   * Toggles filtering of reviews by star rating and resets pagination to page 1.
   *
   * @param score Target score (1 to 10).
   */
  public toggleScoreFilter(score: number): void {
    this.selectedScoreFilter.update((current) => (current === score ? null : score));
    this.currentPage.set(1);
  }

  /**
   * Clears the current star rating filter and resets pagination to page 1.
   */
  public clearScoreFilter(): void {
    this.selectedScoreFilter.set(null);
    this.currentPage.set(1);
  }

  /**
   * Handles optimistic upvote toggle for helpful review feedback.
   *
   * @param review Target review instance.
   */
  public async onToggleLike(review: DramaReview): Promise<void> {
    if (!this.authService.currentProfile()) {
      this.authService.openLoginModal();
      return;
    }

    const previousLiked = review.has_liked;
    const previousCount = review.likes_count;

    review.has_liked = !previousLiked;
    review.likes_count += review.has_liked ? 1 : -1;
    this.rawReviews.set([...this.rawReviews()]);

    try {
      await this.reviewService.toggleReviewLike(review.id, !!previousLiked);
    } catch (err) {
      review.has_liked = previousLiked;
      review.likes_count = previousCount;
      this.rawReviews.set([...this.rawReviews()]);
    }
  }

  /**
   * Submits a new user review and rating to the database.
   */
  public async submitReview(): Promise<void> {
    const drama = this.drama();
    const content = this.newReviewContent().trim();
    if (!drama || !content || this.isSubmittingReview()) return;

    if (!this.authService.currentProfile()) {
      this.authService.openLoginModal();
      return;
    }

    this.isSubmittingReview.set(true);
    try {
      await this.reviewService.postReview({
        drama_id: drama.id.toString(),
        rating: this.newReviewRating(),
        content: content,
      });

      this.newReviewContent.set('');
      await this.loadDramaReviews(drama.id.toString());
      this.currentPage.set(1);
    } catch (err) {
      console.error('[DramaDetail] Error submitting review:', err);
    } finally {
      this.isSubmittingReview.set(false);
    }
  }

  /**
   * Deletes a review owned by the authenticated user.
   *
   * @param reviewId Unique review identifier.
   */
  public async deleteReview(reviewId: string): Promise<void> {
    const drama = this.drama();
    if (!drama) return;

    if (!confirm('Deseja realmente excluir sua avaliação?')) return;

    try {
      await this.reviewService.deleteReview(reviewId);
      await this.loadDramaReviews(drama.id.toString());
      if (this.currentPage() > this.totalPages()) {
        this.currentPage.set(this.totalPages());
      }
    } catch (err) {
      console.error('[DramaDetail] Error deleting review:', err);
    }
  }

  /**
   * Opens the watchlist tracking modal with current drama parameters.
   */
  public openTracker(): void {
    const d = this.drama();
    if (!d) return;

    this.trackerService.openTracker({
      drama_id: d.id.toString(),
      drama_title: d.title,
      drama_poster: d.posterUrl,
      total_episodes: d.totalEpisodes || 16,
    });
  }

  /**
   * Switches the active navigation tab.
   *
   * @param tab Target tab identifier.
   */
  public setTab(tab: DetailTab): void {
    this.activeTab.set(tab);
  }

  /**
   * Smoothly scrolls to the community discussion section.
   */
  public scrollToReviews(): void {
    this.activeTab.set('info');
    setTimeout(() => {
      const section = document.getElementById('community-reviews-section');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
  }

  /**
   * Opens the fullscreen image gallery modal at a specific photo index.
   *
   * @param index Target photo index.
   */
  public openGallery(index: number): void {
    this.selectedPhotoIndex.set(index);
    document.body.style.overflow = 'hidden';
  }

  /**
   * Closes the fullscreen image gallery modal.
   */
  public closeGallery(): void {
    this.selectedPhotoIndex.set(null);
    document.body.style.overflow = '';
  }

  /**
   * Navigates to the previous photo in the gallery modal.
   *
   * @param event Optional DOM event.
   */
  public prevPhoto(event?: Event): void {
    if (event) event.stopPropagation();
    const current = this.selectedPhotoIndex();
    const photos = this.drama()?.photos;
    if (current !== null && photos && photos.length > 0) {
      this.selectedPhotoIndex.set(current > 0 ? current - 1 : photos.length - 1);
    }
  }

  /**
   * Navigates to the next photo in the gallery modal.
   *
   * @param event Optional DOM event.
   */
  public nextPhoto(event?: Event): void {
    if (event) event.stopPropagation();
    const current = this.selectedPhotoIndex();
    const photos = this.drama()?.photos;
    if (current !== null && photos && photos.length > 0) {
      this.selectedPhotoIndex.set(current < photos.length - 1 ? current + 1 : 0);
    }
  }

  /**
   * Triggers download of the full-resolution photo file.
   *
   * @param url Remote photo URL.
   * @param event Optional DOM event.
   */
  public async downloadPhoto(url: string, event?: Event): Promise<void> {
    if (event) event.stopPropagation();
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      const currentIdx = (this.selectedPhotoIndex() ?? 0) + 1;
      link.download = `${this.drama()?.title || 'drama'}-photo-${currentIdx}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(url, '_blank');
    }
  }

  /**
   * Global document listener to close custom dropdown when clicking outside.
   */
  @HostListener('document:click', ['$event'])
  public onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isSortDropdownOpen.set(false);
    }
  }

  /**
   * Handles keyboard shortcuts for lightbox navigation and dismissal.
   */
  @HostListener('document:keydown', ['$event'])
  public handleKeyboardEvent(event: KeyboardEvent): void {
    if (this.selectedPhotoIndex() === null) return;

    if (event.key === 'Escape') {
      this.closeGallery();
    } else if (event.key === 'ArrowLeft') {
      this.prevPhoto();
    } else if (event.key === 'ArrowRight') {
      this.nextPhoto();
    }
  }

  ngOnDestroy(): void {
    document.body.style.overflow = '';
    this.routeSubscription?.unsubscribe();
  }
}