import { Injectable, inject, signal } from '@angular/core';
import { AuthService } from './auth.service';
import { DramaModalPayload, UserDramaTracker } from '../../models/tracker.model';

@Injectable({
  providedIn: 'root',
})
export class TrackerService {
  private readonly authService = inject(AuthService);

  // Sinal de notificação para sincronização em tempo real
  public lastUpdated = signal<number>(Date.now());

  public isModalOpen = signal<boolean>(false);
  public activePayload = signal<DramaModalPayload | null>(null);
  public currentTrackedDrama = signal<UserDramaTracker | null>(null);
  public isLoadingTracking = signal<boolean>(false);

  public async openTracker(payload: DramaModalPayload): Promise<void> {
    const user = this.authService.currentProfile();
    if (!user) {
      this.authService.openLoginModal();
      return;
    }

    this.activePayload.set(payload);
    this.isModalOpen.set(true);
    this.isLoadingTracking.set(true);

    try {
      const { data, error } = await this.authService
        .getSupabaseClient()
        .from('user_drama_tracker')
        .select('*')
        .eq('user_id', user.id)
        .eq('drama_id', payload.drama_id)
        .maybeSingle();

      if (error) throw error;
      this.currentTrackedDrama.set(data as UserDramaTracker);
    } catch (err) {
      console.error('Erro ao buscar status do drama:', err);
      this.currentTrackedDrama.set(null);
    } finally {
      this.isLoadingTracking.set(false);
    }
  }

  public closeModal(): void {
    this.isModalOpen.set(false);
    this.activePayload.set(null);
    this.currentTrackedDrama.set(null);
  }

  public async saveTracker(data: Partial<UserDramaTracker>): Promise<void> {
    const user = this.authService.currentProfile();
    const payload = this.activePayload();
    if (!user || !payload) return;

    const record: Partial<UserDramaTracker> = {
      ...data,
      user_id: user.id,
      drama_id: payload.drama_id,
      drama_title: payload.drama_title,
      drama_poster: payload.drama_poster,
      total_episodes: payload.total_episodes || 16,
      updated_at: new Date().toISOString(),
    };

    const { error } = await this.authService
      .getSupabaseClient()
      .from('user_drama_tracker')
      .upsert(record, { onConflict: 'user_id, drama_id' });

    if (error) throw error;

    // Dispara a atualização imediata para toda a aplicação
    this.lastUpdated.set(Date.now());
    this.closeModal();
  }

  public async removeTracker(dramaId: string): Promise<void> {
    const user = this.authService.currentProfile();
    if (!user) return;

    const { error } = await this.authService
      .getSupabaseClient()
      .from('user_drama_tracker')
      .delete()
      .eq('user_id', user.id)
      .eq('drama_id', dramaId);

    if (error) throw error;

    // Dispara a atualização imediata para toda a aplicação
    this.lastUpdated.set(Date.now());
    this.closeModal();
  }

  public async getDramaTracking(dramaId: string): Promise<UserDramaTracker | null> {
    const user = this.authService.currentProfile();
    if (!user) return null;

    const { data, error } = await this.authService
      .getSupabaseClient()
      .from('user_drama_tracker')
      .select('*')
      .eq('user_id', user.id)
      .eq('drama_id', dramaId)
      .maybeSingle();

    if (error || !data) return null;
    return data as UserDramaTracker;
  }

  public async getUserDramas(userId: string): Promise<UserDramaTracker[]> {
    const { data, error } = await this.authService
      .getSupabaseClient()
      .from('user_drama_tracker')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Erro ao listar dramas do usuário:', error);
      return [];
    }

    return (data as UserDramaTracker[]) || [];
  }
}