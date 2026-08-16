import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

type DashboardTab = 'watching' | 'completed' | 'favorites';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  public readonly authService = inject(AuthService);
  public activeTab = signal<DashboardTab>('watching');

  public stats = signal({
    watching: 3,
    completed: 18,
    favorites: 7,
    episodesWatched: 248,
  });

  public setTab(tab: DashboardTab): void {
    this.activeTab.set(tab);
  }

  public logout(): void {
    this.authService.logout();
  }
}