import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { TrackerService } from '../../../core/services/tracker.service';
import { UserDramaTracker } from '../../../models/tracker.model';

type DashboardTab = 'watching' | 'completed' | 'favorites';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  public readonly authService = inject(AuthService);
  public readonly trackerService = inject(TrackerService);

  public activeTab = signal<DashboardTab>('watching');
  public userDramas = signal<UserDramaTracker[]>([]);
  public isLoadingList = signal<boolean>(true);

  // Métricas calculadas dinamicamente
  public stats = computed(() => {
    const list = this.userDramas();
    return {
      watching: list.filter((d) => d.status === 'watching').length,
      completed: list.filter((d) => d.status === 'completed').length,
      favorites: list.filter((d) => d.is_favorite).length,
      episodesWatched: list.reduce((acc, curr) => acc + (curr.current_episode || 0), 0),
    };
  });

  // Lista filtrada de acordo com a aba ativa
  public currentList = computed(() => {
    const tab = this.activeTab();
    const list = this.userDramas();

    if (tab === 'watching') {
      return list.filter((d) => d.status === 'watching' || d.status === 'on_hold' || d.status === 'plan_to_watch');
    }
    if (tab === 'completed') {
      return list.filter((d) => d.status === 'completed');
    }
    if (tab === 'favorites') {
      return list.filter((d) => d.is_favorite);
    }
    return [];
  });

  constructor() {
    // Recarrega a lista quando o modal de tracker fecha ou o perfil carrega
    effect(() => {
      const user = this.authService.currentProfile();
      const isModalOpen = this.trackerService.isModalOpen();

      if (user && !isModalOpen) {
        this.loadUserDramas(user.id);
      }
    });
  }

  public async loadUserDramas(userId: string): Promise<void> {
    this.isLoadingList.set(true);
    try {
      const dramas = await this.trackerService.getUserDramas(userId);
      this.userDramas.set(dramas);
    } catch (err) {
      console.error('Erro ao carregar dramas do usuário:', err);
    } finally {
      this.isLoadingList.set(false);
    }
  }

  public setTab(tab: DashboardTab): void {
    this.activeTab.set(tab);
  }

  public openEditTracker(drama: UserDramaTracker, event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    this.trackerService.openTracker({
      drama_id: drama.drama_id,
      drama_title: drama.drama_title,
      drama_poster: drama.drama_poster,
      total_episodes: drama.total_episodes,
    });
  }

  public logout(): void {
    this.authService.logout();
  }
}