import { Component, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { AchievementService } from '../../../core/services/achievement.service';
import { AvatarCropper } from '../../../shared/components/avatar-cropper/avatar-cropper';
import { SocialLinks } from '../../../models/user.model';
import { Achievement, UserAchievement } from '../../../models/achievement.model';

type SettingsTab = 'profile' | 'achievements' | 'security' | 'preferences';

/**
 * Settings Component
 * Manages user profile identity, social handles, achievement gallery,
 * password updates, and regional drama preferences.
 */
@Component({
  selector: 'app-settings',
  imports: [CommonModule, FormsModule, AvatarCropper],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
})
export class Settings {
  public readonly authService = inject(AuthService);
  public readonly achievementService = inject(AchievementService);

  public activeTab = signal<SettingsTab>('profile');
  public isSaving = signal<boolean>(false);
  public isUploadingAvatar = signal<boolean>(false);
  public successMessage = signal<string | null>(null);
  public errorMessage = signal<string | null>(null);

  // Avatar Cropping State
  public selectedFileForCrop = signal<File | null>(null);

  // Avatar & Profile Form State
  public avatarUrl = signal<string | null>(null);
  public username = signal<string>('');
  public bio = signal<string>('');

  // Social Links State
  public instagram = signal<string>('');
  public twitter = signal<string>('');
  public tiktok = signal<string>('');
  public telegram = signal<string>('');
  public discord = signal<string>('');
  public mydramalist = signal<string>('');

  // Password Update State
  public newPassword = signal<string>('');
  public confirmPassword = signal<string>('');

  // Regional Preferences
  public availableCountries = [
    { code: 'KR', label: 'Coreia do Sul' },
    { code: 'JP', label: 'Japão' },
    { code: 'CN', label: 'China' },
    { code: 'TH', label: 'Tailândia' },
    { code: 'TW', label: 'Taiwan' },
  ];
  public selectedCountries = signal<string[]>(['KR', 'JP', 'CN']);

  // Achievements State
  public catalogAchievements = signal<Achievement[]>([]);
  public userAchievements = signal<UserAchievement[]>([]);
  public featuredBadgeId = signal<string | null>(null);
  public isLoadingAchievements = signal<boolean>(false);

  constructor() {
    effect(() => {
      const profile = this.authService.currentProfile();
      if (profile) {
        this.avatarUrl.set(profile.avatar_url || null);
        this.username.set(profile.username || '');
        this.bio.set(profile.bio || '');
        this.selectedCountries.set(profile.preferred_countries || ['KR', 'JP', 'CN']);
        this.featuredBadgeId.set(profile.featured_badge_id || null);

        const links = profile.social_links || {};
        this.instagram.set(links.instagram || '');
        this.twitter.set(links.twitter || '');
        this.tiktok.set(links.tiktok || '');
        this.telegram.set(links.telegram || '');
        this.discord.set(links.discord || '');
        this.mydramalist.set(links.mydramalist || '');
      }
    });
  }

  /**
   * Switches active settings navigation tab.
   *
   * @param tab Target SettingsTab identifier.
   */
  public async setTab(tab: SettingsTab): Promise<void> {
    this.activeTab.set(tab);
    this.successMessage.set(null);
    this.errorMessage.set(null);

    if (tab === 'achievements') {
      await this.loadAchievementsData();
    }
  }

  /**
   * Loads the global achievement catalog and user unlocked badges.
   */
  public async loadAchievementsData(): Promise<void> {
    const user = this.authService.currentUser();
    if (!user) return;

    this.isLoadingAchievements.set(true);
    try {
      const [allBadges, unlocked] = await Promise.all([
        this.achievementService.getAllAchievements(),
        this.achievementService.getUserAchievements(user.id),
      ]);

      this.catalogAchievements.set(allBadges);
      this.userAchievements.set(unlocked);
    } catch (err: any) {
      console.error('[Settings] Error loading achievements data:', err);
    } finally {
      this.isLoadingAchievements.set(false);
    }
  }

  /**
   * Checks if an achievement from the catalog has been unlocked by the active user.
   *
   * @param achievementId Unique identifier string.
   */
  public isUnlocked(achievementId: string): boolean {
    return this.userAchievements().some((u) => u.achievement_id === achievementId);
  }

  /**
   * Sets or unsets an achievement as the featured showcase badge on profile hero.
   *
   * @param badge Target achievement entity.
   */
  public async toggleFeaturedBadge(badge: Achievement): Promise<void> {
    if (!this.isUnlocked(badge.id)) return;

    const currentPin = this.featuredBadgeId();
    const newPin = currentPin === badge.id ? null : badge.id;

    try {
      await this.achievementService.setFeaturedBadge(newPin);
      this.featuredBadgeId.set(newPin);
      this.successMessage.set(
        newPin ? `Conquista "${badge.name}" destacada no seu perfil!` : 'Destaque de conquista removido.'
      );
    } catch (err: any) {
      this.errorMessage.set('Erro ao alterar conquista em destaque.');
    }
  }

  public onAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    if (file.size > 5 * 1024 * 1024) {
      this.errorMessage.set('A imagem deve ter no máximo 5MB.');
      return;
    }

    this.selectedFileForCrop.set(file);
    input.value = '';
  }

  public async uploadCroppedAvatar(croppedBlob: Blob): Promise<void> {
    const user = this.authService.currentUser();
    if (!user) return;

    this.selectedFileForCrop.set(null);
    this.isUploadingAvatar.set(true);
    this.errorMessage.set(null);

    try {
      const filePath = `${user.id}/avatar.webp`;

      const { error: uploadError } = await this.authService
        .getSupabaseClient()
        .storage.from('avatars')
        .upload(filePath, croppedBlob, {
          upsert: true,
          contentType: 'image/webp',
        });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = this.authService
        .getSupabaseClient()
        .storage.from('avatars')
        .getPublicUrl(filePath);

      const publicUrl = `${publicUrlData.publicUrl}?t=${Date.now()}`;

      const { error: updateError } = await this.authService
        .getSupabaseClient()
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      this.avatarUrl.set(publicUrl);
      await this.authService.fetchProfile(user.id);
      this.successMessage.set('Foto de perfil atualizada com sucesso!');
    } catch (err: any) {
      this.errorMessage.set(err.message || 'Erro ao enviar a foto de perfil.');
    } finally {
      this.isUploadingAvatar.set(false);
    }
  }

  public cancelCrop(): void {
    this.selectedFileForCrop.set(null);
  }

  public toggleCountry(code: string): void {
    const current = this.selectedCountries();
    if (current.includes(code)) {
      if (current.length > 1) {
        this.selectedCountries.set(current.filter((c) => c !== code));
      }
    } else {
      this.selectedCountries.set([...current, code]);
    }
  }

  public async onSaveProfile(): Promise<void> {
    const user = this.authService.currentUser();
    if (!user || this.isSaving()) return;

    this.isSaving.set(true);
    this.successMessage.set(null);
    this.errorMessage.set(null);

    const social_links: SocialLinks = {
      instagram: this.instagram().trim() || undefined,
      twitter: this.twitter().trim() || undefined,
      tiktok: this.tiktok().trim() || undefined,
      telegram: this.telegram().trim() || undefined,
      discord: this.discord().trim() || undefined,
      mydramalist: this.mydramalist().trim() || undefined,
    };

    try {
      const { error } = await this.authService
        .getSupabaseClient()
        .from('profiles')
        .update({
          username: this.username().trim(),
          bio: this.bio().trim(),
          social_links,
          preferred_countries: this.selectedCountries(),
        })
        .eq('id', user.id);

      if (error) throw error;

      await this.authService.fetchProfile(user.id);
      this.successMessage.set('Perfil atualizado com sucesso!');
    } catch (err: any) {
      this.errorMessage.set(err.message || 'Erro ao salvar alterações.');
    } finally {
      this.isSaving.set(false);
    }
  }

  public async onUpdatePassword(): Promise<void> {
    if (this.newPassword().length < 6) {
      this.errorMessage.set('A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }
    if (this.newPassword() !== this.confirmPassword()) {
      this.errorMessage.set('As senhas não coincidem.');
      return;
    }

    this.isSaving.set(true);
    this.successMessage.set(null);
    this.errorMessage.set(null);

    try {
      const { error } = await this.authService.getSupabaseClient().auth.updateUser({
        password: this.newPassword(),
      });

      if (error) throw error;

      this.newPassword.set('');
      this.confirmPassword.set('');
      this.successMessage.set('Senha alterada com sucesso!');
    } catch (err: any) {
      this.errorMessage.set(err.message || 'Erro ao redefinir a senha.');
    } finally {
      this.isSaving.set(false);
    }
  }
}