import { Component, HostListener, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TrackerService } from '../../../core/services/tracker.service';
import { DramaStatus } from '../../../models/tracker.model';

@Component({
  selector: 'app-drama-tracker-modal',
  imports: [CommonModule, FormsModule],
  templateUrl: './drama-tracker-modal.html',
  styleUrl: './drama-tracker-modal.scss',
})
export class DramaTrackerModal {
  public readonly trackerService = inject(TrackerService);

  public isSaving = signal<boolean>(false);
  public isRemoving = signal<boolean>(false);

  // Form State
  public status = signal<DramaStatus>('watching');
  public currentEpisode = signal<number>(1);
  public totalEpisodes = signal<number>(16);
  public rating = signal<number>(0);
  public isFavorite = signal<boolean>(false);
  public reviewText = signal<string>('');
  public isReviewPublic = signal<boolean>(true);
  public startDate = signal<string>('');
  public endDate = signal<string>('');

  public readonly statusOptions: { value: DramaStatus; label: string; icon: string }[] = [
    { value: 'watching', label: 'Assistindo', icon: 'fa-play' },
    { value: 'completed', label: 'Concluído', icon: 'fa-check' },
    { value: 'plan_to_watch', label: 'Quero Ver', icon: 'fa-bookmark' },
    { value: 'on_hold', label: 'Em Espera', icon: 'fa-pause' },
    { value: 'dropped', label: 'Abandonei', icon: 'fa-ban' },
  ];

  constructor() {
    // Sincroniza dados sempre que o modal abre ou os dados do dorama carregam
    effect(() => {
      const payload = this.trackerService.activePayload();
      const current = this.trackerService.currentTrackedDrama();

      if (payload) {
        this.totalEpisodes.set(payload.total_episodes || 16);

        if (current) {
          this.status.set(current.status);
          this.currentEpisode.set(current.current_episode);
          this.rating.set(current.rating || 0);
          this.isFavorite.set(current.is_favorite || false);
          this.reviewText.set(current.review_text || '');
          this.isReviewPublic.set(current.is_review_public ?? true);
          this.startDate.set(current.start_date || '');
          this.endDate.set(current.end_date || '');
        } else {
          // Defaults para novo dorama salvo
          this.status.set('watching');
          this.currentEpisode.set(1);
          this.rating.set(0);
          this.isFavorite.set(false);
          this.reviewText.set('');
          this.isReviewPublic.set(true);
          this.startDate.set(this.getTodayDateString());
          this.endDate.set('');
        }
      }
    });
  }

  @HostListener('document:keydown.escape')
  public onEscape(): void {
    this.close();
  }

  public close(): void {
    this.trackerService.closeModal();
  }

  private getTodayDateString(): string {
    return new Date().toISOString().split('T')[0];
  }

  public onStatusChange(newStatus: DramaStatus): void {
    this.status.set(newStatus);

    if (newStatus === 'completed') {
      this.currentEpisode.set(this.totalEpisodes());
      if (!this.endDate()) {
        this.endDate.set(this.getTodayDateString());
      }
    } else if (newStatus === 'watching') {
      if (!this.startDate()) {
        this.startDate.set(this.getTodayDateString());
      }
    }
  }

  public incrementEpisode(): void {
    if (this.currentEpisode() < this.totalEpisodes()) {
      this.currentEpisode.update((v) => v + 1);
      if (this.currentEpisode() === this.totalEpisodes()) {
        this.status.set('completed');
        if (!this.endDate()) this.endDate.set(this.getTodayDateString());
      }
    }
  }

  public decrementEpisode(): void {
    if (this.currentEpisode() > 0) {
      this.currentEpisode.update((v) => v - 1);
    }
  }

  public onEpisodeInput(value: any): void {
    let ep = parseInt(value, 10);
    if (isNaN(ep) || ep < 0) ep = 0;
    if (ep > this.totalEpisodes()) ep = this.totalEpisodes();
    this.currentEpisode.set(ep);

    if (ep === this.totalEpisodes()) {
      this.status.set('completed');
      if (!this.endDate()) this.endDate.set(this.getTodayDateString());
    }
  }

  public toggleFavorite(): void {
    this.isFavorite.update((v) => !v);
  }

  public setRating(score: number): void {
    this.rating.set(this.rating() === score ? 0 : score);
  }

  public async onSave(): Promise<void> {
    this.isSaving.set(true);
    try {
      await this.trackerService.saveTracker({
        status: this.status(),
        current_episode: this.currentEpisode(),
        rating: this.rating() > 0 ? this.rating() : null,
        is_favorite: this.isFavorite(),
        review_text: this.reviewText().trim() || undefined,
        is_review_public: this.isReviewPublic(),
        start_date: this.startDate() || null,
        end_date: this.endDate() || null,
      });
    } catch (err) {
      console.error('Erro ao salvar tracker:', err);
    } finally {
      this.isSaving.set(false);
    }
  }

  public async onRemove(): Promise<void> {
    const payload = this.trackerService.activePayload();
    if (!payload) return;

    if (!confirm('Deseja remover este dorama de todas as suas listas?')) return;

    this.isRemoving.set(true);
    try {
      await this.trackerService.removeTracker(payload.drama_id);
    } catch (err) {
      console.error('Erro ao remover dorama:', err);
    } finally {
      this.isRemoving.set(false);
    }
  }
}