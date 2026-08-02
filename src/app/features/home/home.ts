import { Component } from '@angular/core';
import { Navbar } from '../components/navbar/navbar';
import { Drama, MetricCard } from '../../models/home..model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [Navbar, CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  public featuredDrama: Drama[];
  public metrics: MetricCard[];

  constructor() {
    this.featuredDrama = [
      {
        id: '1',
        title: 'Um amor que ilumina',
        originalTitle: '샤이닝',
        rating: 6.8,
        releaseDate: '6 de Março de 2026',
        endDate: '10 de Abril de 2026',
        status: 'ongoing',
        releaseDays: ['Sexta-feira', 'Sábado'],
        synopsis: 'Dois jovens de mundos completamente opostos se encontram em um momento difícil de suas vidas e descobrem que a presença um do outro é capaz de acender uma nova esperança no futuro.',
        genres: ['Romance', 'Drama', 'Juventude'],
        totalSeasons: 1,
        totalEpisodes: 10,
        episodesReleased: 6,
        posterUrl: 'https://i.mydramalist.com/Lw0pbx_4f.jpg'
      },
      {
        id: '2',
        title: 'Encontro de corações',
        originalTitle: '하트페어링',
        rating: 8.1,
        releaseDate: '7 de Março de 2026',
        status: 'completed',
        synopsis: 'O amor começa com emoção, mas o que é necessário para os apaixonados se casarem?',
        genres: ['Romance', 'Drama'],
        totalSeasons: 1,
        totalEpisodes: 16,
        posterUrl: 'https://i.mydramalist.com/g0D23r_4f.jpg'
      },
      {
        id: '3',
        title: 'Os Segredos do Palácio Tang',
        originalTitle: '궁궐의 비밀',
        rating: 7.8,
        releaseDate: '5 de Fevereiro de 2026',
        status: 'upcoming',
        genres: ['Histórico', 'Mistério'],
        totalSeasons: 1,
        totalEpisodes: 34,
        posterUrl: 'https://i.mydramalist.com/JB8znp_4f.jpg'
      }
    ];

    // Métricas
    this.metrics = [
      {
        id: 'episodes',
        title: 'Episódios Assistidos',
        value: 84,
        subtitle: '+12% hoje',
        icon: 'fa-solid fa-circle-play'
      },
      {
        id: 'completed',
        title: 'Dramas Concluídos',
        value: 32,
        subtitle: '+21% hoje',
        icon: 'fa-solid fa-trophy'
      },
      {
        id: 'rating',
        title: 'Média Geral da Comunidade',
        value: 9.4,
        subtitle: 'Avaliação média',
        icon: 'fa-solid fa-star',
        isHighlight: true
      },
      {
        id: 'genre',
        title: 'Gênero Mais Popular',
        value: 'Comédia',
        subtitle: '+48% das maratonas hoje',
        icon: 'fa-solid fa-masks-theater'
      },
      {
        id: 'actor',
        title: 'Ator/Atriz em Alta',
        value: 'Cha Eun-woo',
        subtitle: '+322 acessos nos últimos dias',
        icon: 'fa-solid fa-star-half-stroke'
      },
      {
        id: 'pace',
        title: 'Média de Episódios por Dia',
        value: 3.5,
        subtitle: 'Ritmo médio da comunidade',
        icon: 'fa-solid fa-bolt'
      }
    ];
  }

  public getStatusLabel(status?: string): string {
    switch (status) {
      case 'ongoing': return 'Em Exibição';
      case 'completed': return 'Concluído';
      case 'upcoming': return 'Em breve';
      default: return '';
    }
  }

  public onMoreInfo(dramaId: string): void {
    console.log("Abrir detalhes do drama ID: ", dramaId);
  }
}
