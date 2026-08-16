import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Drama } from '../../models/drama.model';
import { DramaService } from '../../core/services/drama.service';
import { DramaCard } from '../../shared/components/drama-card/drama-card';
import { Pagination } from '../../shared/components/pagination/pagination';

@Component({
  selector: 'app-catalog',
  imports: [CommonModule, FormsModule, DramaCard, Pagination],
  templateUrl: './catalog.html',
  styleUrl: './catalog.scss',
})
export class Catalog implements OnInit {
  private readonly dramaService = inject(DramaService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  public dramaList = signal<Drama[]>([]);
  public isLoading = signal<boolean>(true);
  public searchTerm = signal<string>('');
  public genreLabel = signal<string>('');
  public currentPage = signal<number>(1);
  public totalPages = signal<number>(1);

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const query = params['q'] || '';
      const genre = params['genre'] || '';
      const keyword = params['keyword'] || '';
      const label = params['label'] || '';
      const page = Number(params['page']) || 1;

      this.searchTerm.set(query);
      this.genreLabel.set(label);
      this.currentPage.set(page);

      this.fetchDramas(query, { genre, keyword }, page);
    });
  }

  public onSearch(term: string): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        q: term.trim() ? term.trim() : null,
        genre: null,
        keyword: null,
        label: null,
        page: null,
      },
    });
  }

  public clearSearch(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
    });
  }

  public onPageChange(page: number): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: page > 1 ? page : null },
      queryParamsHandling: 'merge',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private fetchDramas(query: string, filter: { genre: string; keyword: string }, page: number): void {
    this.isLoading.set(true);

    let request$;
    if (query.trim()) {
      request$ = this.dramaService.searchDramas(query, page);
    } else if (filter.genre || filter.keyword) {
      request$ = this.dramaService.getPopularDramas(page, {
        genre: filter.genre || undefined,
        keyword: filter.keyword || undefined,
      });
    } else {
      request$ = this.dramaService.getPopularDramas(page);
    }

    request$.subscribe({
      next: (res) => {
        this.dramaList.set(res.results);
        this.currentPage.set(res.page);
        this.totalPages.set(res.totalPages);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erro ao buscar doramas:', err);
        this.isLoading.set(false);
      },
    });
  }
}