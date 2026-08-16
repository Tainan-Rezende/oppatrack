import { Component, inject, signal, OnDestroy, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { filter, Subscription, forkJoin } from 'rxjs';
import { Login } from '../login/login';
import { MenuItem } from '../../../models/navbar-item';
import { DramaService } from '../../../core/services/drama.service';
import { AuthService } from '../../../core/services/auth.service';
import { Drama } from '../../../models/drama.model';
import { ActorSummary } from '../../../models/actor.model';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterLink, RouterLinkActive, Login],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar implements OnDestroy {
  private readonly router = inject(Router);
  private readonly dramaService = inject(DramaService);
  public readonly authService = inject(AuthService);
  private readonly elementRef = inject(ElementRef);
  private routeSub: Subscription;
  private searchDebounceTimer?: ReturnType<typeof setTimeout>;

  public isMenuOpen = signal<boolean>(false);
  public isAuthOpen = signal<boolean>(false);
  public isUserDropdownOpen = signal<boolean>(false);

  // Estados da Busca Rápida (Dropdown)
  public isSearching = signal<boolean>(false);
  public showDropdown = signal<boolean>(false);
  public quickDramas = signal<Drama[]>([]);
  public quickActors = signal<ActorSummary[]>([]);

  public menuList: MenuItem[] = [
    { label: 'Início', route: '/home', icon: 'fa-solid fa-house', exact: true },
    { label: 'Dramas', route: '/dramas', icon: 'fa-solid fa-film' },
    { label: 'Atores', route: '/actors', icon: 'fa-solid fa-users' },
  ];

  constructor() {
    this.routeSub = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.closeMenu();
        this.closeDropdown();
        this.closeUserDropdown();
      });
  }

  ngOnDestroy(): void {
    this.routeSub.unsubscribe();
    document.body.style.overflow = '';
  }

  // Fecha os dropdowns ao clicar fora do componente da barra
  @HostListener('document:click', ['$event'])
  public onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.closeDropdown();
      this.closeUserDropdown();
    }
  }

  public toggleMenu(): void {
    const nextState = !this.isMenuOpen();
    this.isMenuOpen.set(nextState);
    document.body.style.overflow = nextState ? 'hidden' : '';
  }

  public closeMenu(): void {
    this.isMenuOpen.set(false);
    document.body.style.overflow = '';
  }

  public openAuth(): void {
    this.isAuthOpen.set(true);
    this.closeMenu();
  }

  public closeAuth(): void {
    this.isAuthOpen.set(false);
  }

  public toggleUserDropdown(): void {
    this.isUserDropdownOpen.update((v) => !v);
    this.showDropdown.set(false);
  }

  public closeUserDropdown(): void {
    this.isUserDropdownOpen.set(false);
  }

  public closeDropdown(): void {
    this.showDropdown.set(false);
  }

  public onLogout(): void {
    this.closeUserDropdown();
    this.closeMenu();
    this.authService.logout();
  }

  // Busca instantânea
  public onSearchInput(term: string): void {
    const query = term.trim();

    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer);
    }

    if (query.length < 2) {
      this.quickDramas.set([]);
      this.quickActors.set([]);
      this.showDropdown.set(false);
      this.isSearching.set(false);
      return;
    }

    this.isSearching.set(true);
    this.showDropdown.set(true);
    this.closeUserDropdown();

    this.searchDebounceTimer = setTimeout(() => {
      forkJoin({
        dramas: this.dramaService.searchDramas(query, 1),
        actors: this.dramaService.searchActors(query, 1),
      }).subscribe({
        next: ({ dramas, actors }) => {
          this.quickDramas.set(dramas.results.slice(0, 3));
          this.quickActors.set(actors.results.slice(0, 3));
          this.isSearching.set(false);
        },
        error: () => {
          this.isSearching.set(false);
        },
      });
    }, 300);
  }

  public navigateToSearch(term: string, target: 'dramas' | 'actors'): void {
    const query = term.trim();
    if (!query) return;

    this.closeDropdown();
    this.closeMenu();
    this.router.navigate([`/${target}`], { queryParams: { q: query } });
  }

  public onHeaderSearch(term: string): void {
    const target = this.router.url.startsWith('/actors') ? 'actors' : 'dramas';
    this.navigateToSearch(term, target);
  }
}