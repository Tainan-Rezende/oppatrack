import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DramaService } from '../../core/services/drama.service';
import { ActorSummary } from '../../models/actor.model';
import { ActorCard } from '../../shared/components/actor-card/actor-card';
import { Pagination } from '../../shared/components/pagination/pagination';

@Component({
  selector: 'app-actors',
  imports: [CommonModule, FormsModule, ActorCard, Pagination],
  templateUrl: './actors.html',
  styleUrl: './actors.scss',
})
export class Actors implements OnInit {
  private dramaService = inject(DramaService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  public actorList = signal<ActorSummary[]>([]);
  public isLoading = signal<boolean>(true);
  public searchTerm = signal<string>('');
  public currentPage = signal<number>(1);
  public totalPages = signal<number>(1);

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const query = params['q'] || '';
      const page = Number(params['page']) || 1;

      this.searchTerm.set(query);
      this.currentPage.set(page);
      this.fetchActors(query, page);
    });
  }

  public onSearch(term: string): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { q: term.trim() ? term.trim() : null, page: null },
      queryParamsHandling: 'merge',
    });
  }

  public clearSearch(): void {
    this.onSearch('');
  }

  public onPageChange(page: number): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: page > 1 ? page : null },
      queryParamsHandling: 'merge',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private fetchActors(query: string, page: number): void {
    this.isLoading.set(true);

    const request$ = query.trim()
      ? this.dramaService.searchActors(query, page)
      : this.dramaService.getPopularActors(page);

    request$.subscribe({
      next: (res) => {
        this.actorList.set(res.results);
        this.currentPage.set(res.page);
        this.totalPages.set(res.totalPages);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erro ao buscar atores:', err);
        this.isLoading.set(false);
      },
    });
  }
}