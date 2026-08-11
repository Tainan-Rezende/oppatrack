import { Drama } from "../../models/home.model";

export const MOCK_DRAMAS: Drama[] = [
    {
        id: '1',
        title: 'Um amor que ilumina',
        rating: 6.8,
        releaseDate: '6 de Março de 2026',
        status: 'ongoing',
        genres: ['Romance', 'Drama'],
        totalSeasons: 1,
        totalEpisodes: 16,
        episodesReleased: 4,
        posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600',
        backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200'
    },
    {
        id: '2',
        title: 'Encontro de corações',
        rating: 8.1,
        releaseDate: '7 de Março de 2026',
        status: 'ongoing',
        genres: ['Romance', 'Comédia'],
        totalSeasons: 1,
        totalEpisodes: 12,
        episodesReleased: 2,
        posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600',
        backdropUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1200'
    },
    {
        id: '3',
        title: 'Os Segredos do Palácio Tang',
        rating: 7.8,
        releaseDate: '5 de Fevereiro de 2026',
        status: 'completed',
        genres: ['Histórico', 'Mistério'],
        totalSeasons: 1,
        totalEpisodes: 40,
        episodesReleased: 40,
        posterUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=600',
        backdropUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1200'
    },
    {
        id: '4',
        title: 'Pousando no Amor',
        rating: 9.2,
        releaseDate: '14 de Dezembro de 2025',
        status: 'completed',
        genres: ['Romance', 'Comédia', 'Drama'],
        totalSeasons: 1,
        totalEpisodes: 16,
        posterUrl: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?q=80&w=600'
    },
    {
        id: '5',
        title: 'Tudo Bem Não Ser Normal',
        rating: 8.9,
        releaseDate: '20 de Junho de 2025',
        status: 'completed',
        genres: ['Romance', 'Psicológico'],
        totalSeasons: 1,
        totalEpisodes: 16,
        posterUrl: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=600'
    },
    {
        id: '6',
        title: 'Vincenzo',
        rating: 8.7,
        releaseDate: '20 de Fevereiro de 2025',
        status: 'completed',
        genres: ['Comédia', 'Ação', 'Crime'],
        totalSeasons: 1,
        totalEpisodes: 20,
        posterUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=600'
    }
];