import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { TrackerService } from '../../../core/services/tracker.service';
import { UserProfile } from '../../../models/user.model';
import { UserDramaTracker } from '../../../models/tracker.model';

export type BacklogTab = 'plan_to_watch' | 'on_hold' | 'dropped';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, RouterLink],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile {
  private readonly route = inject(ActivatedRoute);
  public readonly authService = inject(AuthService);
  public readonly trackerService = inject(TrackerService);

  public activeBacklogTab = signal<BacklogTab>('plan_to_watch');
  public copiedDiscord = signal<boolean>(false);
  public isLoadingProfile = signal<boolean>(true);
  public isLoadingDramas = signal<boolean>(false);

  public viewedProfile = signal<UserProfile | null>(null);
  public userDramas = signal<UserDramaTracker[]>([]);

  // Compara se o perfil exibido pertence ao usuário logado
  public isOwnProfile = computed(() => {
    const current = this.authService.currentProfile();
    const viewed = this.viewedProfile();
    if (!current || !viewed) return false;
    return current.id === viewed.id;
  });

  public readonly countryLabels: Record<string, string> = {
    KR: 'Coreia do Sul',
    JP: 'Japão',
    CN: 'China',
    TH: 'Tailândia',
    TW: 'Taiwan',
  };

  public stats = computed(() => {
    const list = this.userDramas();
    return {
      watching: list.filter((d) => d.status === 'watching').length,
      completed: list.filter((d) => d.status === 'completed').length,
      planToWatch: list.filter((d) => d.status === 'plan_to_watch').length,
      onHold: list.filter((d) => d.status === 'on_hold').length,
      dropped: list.filter((d) => d.status === 'dropped').length,
      favorites: list.filter((d) => d.is_favorite).length,
    };
  });

  public favoriteDramas = computed(() => this.userDramas().filter((d) => d.is_favorite));
  public watchingDramas = computed(() => this.userDramas().filter((d) => d.status === 'watching'));
  public completedDramas = computed(() => this.userDramas().filter((d) => d.status === 'completed'));

  public backlogDramas = computed(() => {
    const tab = this.activeBacklogTab();
    return this.userDramas().filter((d) => d.status === tab);
  });

  constructor() {
    effect(() => {
      this.trackerService.lastUpdated();
      const profile = this.viewedProfile();
      if (profile) {
        this.loadUserDramas(profile.id);
      }
    });

    this.route.paramMap.subscribe(async (params) => {
      // 1. Extrai o parâmetro com fallback seguro
      let targetUser =
        params.get('username') ||
        params.get('id') ||
        params.get('user') ||
        params.get('name');

      // Se o roteador não mapeou nome de parâmetro, pega o segmento final da URL
      if (!targetUser) {
        const segments = window.location.pathname.split('/').filter(Boolean);
        const lastSegment = segments[segments.length - 1];
        if (lastSegment && lastSegment !== 'profile' && lastSegment !== 'u') {
          targetUser = decodeURIComponent(lastSegment);
        }
      }

      await this.authService.waitForAuth();

      // Se realmente não houver parâmetro nenhum na rota (ex: /account/profile)
      if (!targetUser) {
        const current = this.authService.currentProfile();
        this.viewedProfile.set(current);
        if (current) this.loadUserDramas(current.id);
        this.isLoadingProfile.set(false);
        return;
      }

      const cleanUsername = decodeURIComponent(targetUser).trim();
      await this.fetchProfileByUsername(cleanUsername);
    });
  }

  private async fetchProfileByUsername(targetUsername: string): Promise<void> {
    this.isLoadingProfile.set(true);
    try {
      const current = this.authService.currentProfile();

      // Se for exatamente o usuário logado, reaproveita a sessão
      if (
        current &&
        current.username &&
        current.username.toLowerCase() === targetUsername.toLowerCase()
      ) {
        this.viewedProfile.set(current);
        await this.loadUserDramas(current.id);
        return;
      }

      // Busca case-insensitive no Supabase via .ilike()
      const { data, error } = await this.authService
        .getSupabaseClient()
        .from('profiles')
        .select('*')
        .ilike('username', targetUsername)
        .maybeSingle();

      if (error) {
        console.error('[Profile] Erro ao consultar perfil:', error);
        throw error;
      }

      // Define os dados do outro perfil (preservando o case original do banco)
      this.viewedProfile.set(data as UserProfile);

      if (data) {
        await this.loadUserDramas(data.id);
      }
    } catch (err) {
      console.error('[Profile] Falha ao carregar perfil público:', err);
      this.viewedProfile.set(null);
    } finally {
      this.isLoadingProfile.set(false);
    }
  }

  private async loadUserDramas(userId: string): Promise<void> {
    this.isLoadingDramas.set(true);
    try {
      const dramas = await this.trackerService.getUserDramas(userId);
      this.userDramas.set(dramas);
    } catch (err) {
      console.error('[Profile] Erro ao carregar dramas do perfil:', err);
    } finally {
      this.isLoadingDramas.set(false);
    }
  }

  public setBacklogTab(tab: BacklogTab): void {
    this.activeBacklogTab.set(tab);
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

  public scrollTrack(elementId: string, direction: 'left' | 'right'): void {
    const el = document.getElementById(elementId);
    if (!el) return;
    const scrollAmount = direction === 'left' ? -380 : 380;
    el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  }

  public copyToClipboard(text: string, type: 'discord'): void {
    navigator.clipboard.writeText(text);
    this.copiedDiscord.set(true);
    setTimeout(() => this.copiedDiscord.set(false), 2000);
  }
}