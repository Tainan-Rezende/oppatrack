import { Component, OnInit, OnDestroy, HostListener, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Drama } from '../../models/drama.model';
import { ActorSummary } from '../../models/actor.model';
import { MetricCard } from '../../models/home.model';
import { CategoryItem, HOME_CATEGORIES } from '../../models/home.model';
import { DramaService } from '../../core/services/drama.service';
import { DramaCard } from '../../shared/components/drama-card/drama-card';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink, DramaCard],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit, OnDestroy {
  private readonly dramaService = inject(DramaService);

  // Lista de Categorias centralizada do model
  public categories: CategoryItem[] = HOME_CATEGORIES;

  // Estados reativos da página
  public heroDrama = signal<Drama | null>(null);
  public featuredDramas = signal<Drama[]>([]);
  public onAirDramas = signal<Drama[]>([]);
  public topRatedDramas = signal<Drama[]>([]);
  public hotActors = signal<ActorSummary[]>([]);
  public metrics = signal<MetricCard[]>([]);
  public isLoading = signal<boolean>(true);

  // Controle de tempo decorrido
  public lastUpdated = signal<Date>(new Date());
  public timeAgoText = signal<string>('Atualizado agora');
  private timerId?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    this.loadHomeData();
    this.startTimeTracker();
  }

  ngOnDestroy(): void {
    this.stopTimeTracker();
  }

  public loadHomeData(): void {
    this.isLoading.set(true);
    this.lastUpdated.set(new Date());
    this.timeAgoText.set('Atualizado agora');

    // Executa as requisições da Home em paralelo
    forkJoin({
      popularRes: this.dramaService.getPopularDramas(1),
      onAirRes: this.dramaService.getOnAirDramas(),
      topRatedRes: this.dramaService.getTopRatedDramas(),
      actorsRes: this.dramaService.getPopularActors(1),
    }).subscribe({
      next: ({ popularRes, onAirRes, topRatedRes, actorsRes }) => {
        const topDramas = popularRes.results;
        const topActors = actorsRes.results.slice(0, 6);

        // Hero banner recebe o dorama número 1
        this.heroDrama.set(topDramas[0] || null);

        // Top 3 cards
        this.featuredDramas.set(topDramas.slice(0, 3));

        // Seções de lançamentos e clássicos
        this.onAirDramas.set(onAirRes);
        this.topRatedDramas.set(topRatedRes);

        // Atores em alta
        this.hotActors.set(topActors);

        // Métricas
        const topGenre = topDramas[0]?.genres?.[0] || 'Romance';
        const topActor = topActors[0]?.name || 'Cha Eun-woo';

        this.metrics.set([
          {
            id: 'episodes',
            title: 'Episódios Catalogados',
            value: 1240,
            subtitle: '+24 novos esta semana',
            icon: 'fa-solid fa-circle-play',
          },
          {
            id: 'completed',
            title: 'Dramas Concluídos',
            value: 480,
            subtitle: '+18 finalizados recentemente',
            icon: 'fa-solid fa-trophy',
          },
          {
            id: 'rating',
            title: 'Média de Avaliação',
            value: 8.7,
            subtitle: 'Nota média dos top doramas',
            icon: 'fa-solid fa-star',
            isHighlight: true,
          },
          {
            id: 'genre',
            title: 'Gênero em Alta',
            value: topGenre,
            subtitle: 'Mais assistido na plataforma',
            icon: 'fa-solid fa-masks-theater',
          },
          {
            id: 'actor',
            title: 'Artista em Destaque',
            value: topActor,
            subtitle: 'Maior volume de buscas recentes',
            icon: 'fa-solid fa-fire',
          },
          {
            id: 'pace',
            title: 'Média de Maratonas',
            value: 3.8,
            subtitle: 'Episódios diários por usuário',
            icon: 'fa-solid fa-bolt',
          },
        ]);

        this.lastUpdated.set(new Date());
        this.timeAgoText.set('Atualizado agora');
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erro ao carregar dados da Home:', err);
        this.isLoading.set(false);
        this.timeAgoText.set('Falha ao atualizar');
      },
    });
  }

  private startTimeTracker(): void {
    this.timerId = setInterval(() => {
      this.updateTimeAgo();
    }, 1000);
  }

  private stopTimeTracker(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
    }
  }

  private updateTimeAgo(): void {
    if (this.isLoading()) return;

    const diffSeconds = Math.floor((Date.now() - this.lastUpdated().getTime()) / 1000);

    if (diffSeconds < 5) {
      this.timeAgoText.set('Atualizado agora');
    } else if (diffSeconds < 60) {
      this.timeAgoText.set(`Atualizado há ${diffSeconds}s`);
    } else {
      const diffMinutes = Math.floor(diffSeconds / 60);
      if (diffMinutes < 60) {
        this.timeAgoText.set(`Atualizado há ${diffMinutes}min`);
      } else {
        const diffHours = Math.floor(diffMinutes / 60);
        this.timeAgoText.set(`Atualizado há ${diffHours}h`);
      }
    }
  }

  @HostListener('document:visibilitychange')
  public onVisibilityChange(): void {
    if (document.visibilityState === 'visible') {
      this.updateTimeAgo();
      const diffMinutes = Math.floor((Date.now() - this.lastUpdated().getTime()) / 60000);
      if (diffMinutes >= 10) {
        this.loadHomeData();
      }
    }
  }
}