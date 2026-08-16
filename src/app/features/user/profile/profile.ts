import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { UserProfile } from '../../../models/user.model';

type ProfileTab = 'watchlist' | 'completed' | 'favorites';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, RouterLink],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile {
  private readonly route = inject(ActivatedRoute);
  public readonly authService = inject(AuthService);

  public activeTab = signal<ProfileTab>('watchlist');
  public copiedCode = signal<boolean>(false);
  public copiedDiscord = signal<boolean>(false);
  public isLoading = signal<boolean>(false);

  // Perfil exibido (próprio ou de outro usuário)
  public viewedProfile = signal<UserProfile | null>(null);

  // Identifica se a página pertence ao usuário autenticado atual
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

  constructor() {
    this.route.paramMap.subscribe(async (params) => {
      const idOrCode = params.get('id');

      // Se acessou /profile sem ID, exibe o perfil logado
      if (!idOrCode) {
        this.viewedProfile.set(this.authService.currentProfile());
        return;
      }

      const current = this.authService.currentProfile();
      if (current && (current.id === idOrCode || current.profile_code === idOrCode)) {
        this.viewedProfile.set(current);
        return;
      }

      // Se for outro usuário, consulta no banco pelo ID ou pelo código #OPPA-XXXX
      await this.fetchPublicProfile(idOrCode);
    });

    effect(() => {
      const current = this.authService.currentProfile();
      const routeId = this.route.snapshot.paramMap.get('id');
      if (!routeId && current) {
        this.viewedProfile.set(current);
      }
    });
  }

  private async fetchPublicProfile(idOrCode: string): Promise<void> {
    this.isLoading.set(true);
    try {
      const isCode = idOrCode.startsWith('#') || idOrCode.startsWith('OPPA-');
      const cleanCode = idOrCode.startsWith('#') ? idOrCode : `#${idOrCode}`;

      let query = this.authService.getSupabaseClient().from('profiles').select('*');

      if (isCode) {
        query = query.eq('profile_code', cleanCode);
      } else {
        query = query.eq('id', idOrCode);
      }

      const { data, error } = await query.maybeSingle();
      if (error) throw error;

      this.viewedProfile.set(data as UserProfile);
    } catch (err) {
      console.error('Erro ao buscar perfil público:', err);
      this.viewedProfile.set(null);
    } finally {
      this.isLoading.set(false);
    }
  }

  public setTab(tab: ProfileTab): void {
    this.activeTab.set(tab);
  }

  public copyToClipboard(text: string, type: 'code' | 'discord'): void {
    navigator.clipboard.writeText(text);
    if (type === 'code') {
      this.copiedCode.set(true);
      setTimeout(() => this.copiedCode.set(false), 2000);
    } else {
      this.copiedDiscord.set(true);
      setTimeout(() => this.copiedDiscord.set(false), 2000);
    }
  }
}