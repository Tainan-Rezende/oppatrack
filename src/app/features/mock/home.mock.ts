import { Drama, MetricCard } from "../../models/home.model";

export const FEATURED_DRAMAS_MOCK: Drama[] = [
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
    posterUrl: 'https://i.mydramalist.com/Lw0pbx_4c.jpg?v=1'
  },
  {
    id: '2',
    title: 'Corações Conectados',
    originalTitle: '연결된 마음',
    rating: 8.2,
    releaseDate: '12 de Janeiro de 2026',
    status: 'completed',
    synopsis: 'Um drama emocionante sobre reencontros e escolhas.',
    genres: ['Romance', 'Drama'],
    totalSeasons: 1,
    totalEpisodes: 16,
    posterUrl: 'https://i.mydramalist.com/Lw0pbx_4c.jpg?v=1'
  },
  {
    id: '3',
    title: 'Segredos do Palácio',
    originalTitle: '궁궐의 비밀',
    rating: 9.0,
    releaseDate: '15 de Maio de 2026',
    status: 'upcoming',
    genres: ['Histórico', 'Mistério'],
    totalSeasons: 1,
    totalEpisodes: 12,
    posterUrl: 'https://i.mydramalist.com/Lw0pbx_4c.jpg?v=1'
  }
];

export const METRICS_MOCK: MetricCard[] = [
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