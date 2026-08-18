import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { TrackerService } from '../../../core/services/tracker.service';
import { UserProfile, UserRole, SocialLinks } from '../../../models/user.model';
import { UserDramaTracker } from '../../../models/tracker.model';

export type BacklogTab = 'plan_to_watch' | 'on_hold' | 'dropped';

/**
 * Profile Component
 * Manages user profile presentation, role badges (Admin, Moderator, Curator),
 * staff moderation modal, watchlist statistics, showcase favorites, and categorized drama tracks.
 */
@Component({
  selector: 'app-profile',
  imports: [CommonModule, RouterLink, FormsModule],
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

  // Moderation modal state and editable form fields
  public isModerationModalOpen = signal<boolean>(false);
  public isSavingModeration = signal<boolean>(false);
  public modBio = signal<string>('');
  public modAvatarUrl = signal<string>('');
  public modRole = signal<UserRole>('user');
  public modSocials = signal<SocialLinks>({});

  /**
   * Computes whether the currently rendered profile belongs to the authenticated user.
   */
  public isOwnProfile = computed(() => {
    const current = this.authService.currentProfile();
    const viewed = this.viewedProfile();
    if (!current || !viewed) return false;
    return current.id === viewed.id;
  });

  /**
   * Computes whether the active user has moderation access for the currently viewed profile.
   */
  public canModerate = computed(() => {
    const current = this.authService.currentProfile();
    if (!current || this.isOwnProfile()) return false;
    return current.role === 'admin' || current.role === 'moderator';
  });

  /**
   * Computes whether the active user is an Admin.
   */
  public isAdmin = computed(() => {
    return this.authService.currentProfile()?.role === 'admin';
  });

  public readonly countryLabels: Record<string, string> = {
    KR: 'Coreia do Sul',
    JP: 'Japão',
    CN: 'China',
    TH: 'Tailândia',
    TW: 'Taiwan',
  };

  /**
   * Computes watchlist aggregation counts.
   */
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
      let targetUser =
        params.get('username') ||
        params.get('id') ||
        params.get('user') ||
        params.get('name');

      if (!targetUser) {
        const segments = window.location.pathname.split('/').filter(Boolean);
        const lastSegment = segments[segments.length - 1];
        if (lastSegment && lastSegment !== 'profile' && lastSegment !== 'u') {
          targetUser = decodeURIComponent(lastSegment);
        }
      }

      await this.authService.waitForAuth();

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

  /**
   * Fetches user profile record by username from Supabase.
   *
   * @param targetUsername Target username query string.
   */
  private async fetchProfileByUsername(targetUsername: string): Promise<void> {
    this.isLoadingProfile.set(true);
    try {
      const current = this.authService.currentProfile();

      if (
        current &&
        current.username &&
        current.username.toLowerCase() === targetUsername.toLowerCase()
      ) {
        this.viewedProfile.set(current);
        await this.loadUserDramas(current.id);
        return;
      }

      const { data, error } = await this.authService
        .getSupabaseClient()
        .from('profiles')
        .select('*')
        .ilike('username', targetUsername)
        .maybeSingle();

      if (error) {
        console.error('[Profile] Error querying user profile:', error);
        throw error;
      }

      this.viewedProfile.set(data as UserProfile);

      if (data) {
        await this.loadUserDramas(data.id);
      }
    } catch (err) {
      console.error('[Profile] Error loading public profile:', err);
      this.viewedProfile.set(null);
    } finally {
      this.isLoadingProfile.set(false);
    }
  }

  /**
   * Returns a localized description tooltip for user roles.
   *
   * @param role User authorization role.
   * @returns Formatted tooltip string.
   */
  public getRoleTooltip(role?: string): string {
    switch (role) {
      case 'admin':
        return 'Administrador do OppaTrack';
      case 'moderator':
        return 'Moderador da Comunidade';
      case 'curator':
        return 'Curador Oficial de Conteúdo';
      default:
        return 'Membro da Comunidade';
    }
  }

  /**
   * Opens the staff moderation modal populated with current profile values.
   */
  public openModerationModal(): void {
    const user = this.viewedProfile();
    if (!user) return;

    this.modBio.set(user.bio || '');
    this.modAvatarUrl.set(user.avatar_url || '');
    this.modRole.set(user.role || 'user');
    this.modSocials.set({ ...(user.social_links || {}) });
    this.isModerationModalOpen.set(true);
    document.body.style.overflow = 'hidden';
  }

  /**
   * Closes the staff moderation modal.
   */
  public closeModerationModal(): void {
    this.isModerationModalOpen.set(false);
    document.body.style.overflow = '';
  }

  /**
   * Resets the avatar image URL to an empty state.
   */
  public clearAvatar(): void {
    this.modAvatarUrl.set('');
  }

  /**
   * Persists profile changes made via the staff moderation modal.
   */
  public async saveModerationChanges(): Promise<void> {
    const user = this.viewedProfile();
    if (!user || this.isSavingModeration()) return;

    this.isSavingModeration.set(true);
    try {
      const updates: Partial<UserProfile> = {
        bio: this.modBio().trim(),
        avatar_url: this.modAvatarUrl().trim() || undefined,
        social_links: this.modSocials(),
      };

      // Only administrators are authorized to alter user roles
      if (this.isAdmin()) {
        updates.role = this.modRole();
      }

      const { data, error } = await this.authService
        .getSupabaseClient()
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select('*')
        .single();

      if (error) throw error;

      this.viewedProfile.set(data as UserProfile);
      this.closeModerationModal();
    } catch (err) {
      console.error('[Profile] Error saving profile moderation changes:', err);
    } finally {
      this.isSavingModeration.set(false);
    }
  }

  /**
   * Loads tracked drama records for the given user ID.
   *
   * @param userId Target user unique ID.
   */
  private async loadUserDramas(userId: string): Promise<void> {
    this.isLoadingDramas.set(true);
    try {
      const dramas = await this.trackerService.getUserDramas(userId);
      this.userDramas.set(dramas);
    } catch (err) {
      console.error('[Profile] Error loading user drama watchlist:', err);
    } finally {
      this.isLoadingDramas.set(false);
    }
  }

  /**
   * Sets active tab for backlog section.
   *
   * @param tab Target backlog category.
   */
  public setBacklogTab(tab: BacklogTab): void {
    this.activeBacklogTab.set(tab);
  }

  /**
   * Opens the drama tracker update modal.
   *
   * @param drama Tracked drama entity.
   * @param event Optional DOM click event.
   */
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

  /**
   * Smoothly scrolls a carousel track element left or right.
   *
   * @param elementId DOM container ID.
   * @param direction 'left' or 'right'.
   */
  public scrollTrack(elementId: string, direction: 'left' | 'right'): void {
    const el = document.getElementById(elementId);
    if (!el) return;
    const scrollAmount = direction === 'left' ? -380 : 380;
    el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  }

  /**
   * Copies text payload to clipboard and triggers confirmation state.
   *
   * @param text Text value to copy.
   * @param type Target payload descriptor.
   */
  public copyToClipboard(text: string, type: 'discord'): void {
    navigator.clipboard.writeText(text);
    this.copiedDiscord.set(true);
    setTimeout(() => this.copiedDiscord.set(false), 2000);
  }
}