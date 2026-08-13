import { Drama } from '../../models/home.model'; // Ajuste o caminho da sua model

export const MOCK_DRAMAS: Drama[] = [
  {
    id: '1',
    title: 'Um amor que ilumina',
    originalTitle: '샤이닝',
    rating: 6.8,
    releaseDate: '2026-03-06',
    endDate: '2026-04-10',
    status: 'ongoing',
    releaseDays: ['Sexta-feira', 'Sábado'],
    synopsis: `Na juventude, Yeon Tae-oh e Mo Eun-ah construíram um mundo só deles em uma pacata cidade do interior. Entre conversas silenciosas e passeios de bicicleta, o amor desajeitado da adolescência fez com que um se tornasse oporto seguro e a luz do outro nos momentos mais difíceis de suas vidas. Porém, as dores do amadurecimento e as escolhas inevitáveis da vida adulta acabaram forçando os dois a seguirem caminhos opostos.

Dez anos se passaram e, agora aos 30 anos, seus caminhos voltam a se cruzar na agitada Seul. Tae-oh trabalha como maquinista de metrô, lidando com a rotina e o peso do passado, enquanto Eun-ah atua como gerente de uma charmosa pousada histórica. Ao se reencontrarem em fases completamente diferentes, eles precisam confrontar antigas feridas não curadas, mágoas guardadas e a descoberta de que aquele sentimento do passado ainda é capaz de iluminar o futuro de ambos.`,
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
    releaseDate: '2026-03-07',
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
    releaseDate: '2026-02-05',
    status: 'upcoming',
    genres: ['Histórico', 'Mistério'],
    totalSeasons: 1,
    totalEpisodes: 34,
    posterUrl: 'https://i.mydramalist.com/JB8znp_4f.jpg',
    backdropUrl: 'https://images.portaldejade.com.br/migrated/842858c6389e5b1652942d945fa3b44c.webp'
  },
  {
    id: '4',
    title: 'Pousando no Amor',
    rating: 9.2,
    releaseDate: '2025-12-14',
    status: 'completed',
    genres: ['Romance', 'Comédia', 'Drama'],
    totalSeasons: 1,
    totalEpisodes: 16,
    posterUrl: 'https://i.mydramalist.com/g0wylo_4f.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/o3Htmlg6BfNs8Ew7yjsRzVnYSEs.jpg'
  },
  {
    id: '5',
    title: 'Tudo Bem Não Ser Normal',
    rating: 8.9,
    releaseDate: '2025-06-20',
    status: 'completed',
    genres: ['Romance', 'Psicológico'],
    totalSeasons: 1,
    totalEpisodes: 16,
    posterUrl: 'https://i.mydramalist.com/NdDvjv_4f.jpg',
    backdropUrl: 'https://i0.wp.com/quintacapa.com.br/wp-content/uploads/2020/08/tudo-bem-nao-ser-normal-destaque-quinta-capa.png?fit=1568%2C996&ssl=1'
  },
  {
    id: '6',
    title: 'Vincenzo',
    rating: 8.7,
    releaseDate: '2025-02-20',
    status: 'completed',
    genres: ['Comédia', 'Ação', 'Crime'],
    totalSeasons: 1,
    totalEpisodes: 20,
    posterUrl: 'https://i.mydramalist.com/vAnBe_4f.jpg',
    backdropUrl: 'https://i.pinimg.com/originals/7c/b6/09/7cb6099d94bd0c50e9653660f17ff511.jpg'
  }
];