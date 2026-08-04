import { Component } from '@angular/core';
import { Drama, MetricCard } from '../../models/home.model';
import { HotActors } from '../../models/hot-actors.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  public featuredDrama: Drama[];
  public metrics: MetricCard[];
  public hotActors: HotActors[]

  constructor() {
    // Dramas em destaque
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
        posterUrl: 'https://i.mydramalist.com/Lw0pbx_4f.jpg',
        backdropUrl: 'https://papodedorama.com.br/wp-content/uploads/2026/02/Um-Amor-Que-Ilumina-dorama-1280x720.jpg'
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
        posterUrl: 'https://i.mydramalist.com/g0D23r_4f.jpg',
        backdropUrl: 'https://kocowa-img.imgix.net/images/b7f38b0a-bbaf-4084-8281-ee0ef6d76d19.jpg'
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
        posterUrl: 'https://i.mydramalist.com/JB8znp_4f.jpg',
        backdropUrl: 'https://images.portaldejade.com.br/migrated/842858c6389e5b1652942d945fa3b44c.webp'
      }
    ];

    // Métricas gerais
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

    // Atores em alta
    this.hotActors = [
      {
        id: '1',
        name: 'Cha Eun-woo',
        photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/3d/240301_Cha_Eun-woo.jpg'
      },
      {
        id: '2',
        name: 'Park Min-young',
        photoUrl: 'https://br.web.img3.acsta.net/r_1920_1080/pictures/20/07/16/20/07/3501515.jpg'
      },
      {
        id: '3',
        name: 'Goo Yoo',
        photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/9f/Gong_yoo_in_October_2021.png'
      },
      {
        id: '4',
        name: 'Kim Min Ju',
        photoUrl: 'https://i.mydramalist.com/l0nvob_5c.jpg'
      },
      {
        id: '5',
        name: 'Lee Jong-suk',
        photoUrl: 'https://i.mydramalist.com/NdXbQv_5c.jpg'
      },
      {
        id: '6',
        name: 'IU',
        photoUrl: 'https://i.mydramalist.com/73R8zn_5c.jpg'
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
