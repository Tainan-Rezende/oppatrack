// Tipos para garantir consistência
export type DramaStatus = 'ongoing' | 'completed' | 'upcoming';
export type DayOfWeek = 'Domingo' | 'Segunda-feira' | 'Terça-feira' | 'Quarta-feira' | 'Quinta-feira' | 'Sexta-feira' | 'Sábado';

export interface Drama {
  id: string;
  title: string;
  rating: number;
  releaseDate: string;         // Data de lançamento/estreia
  endDate?: string;            // Data do último episódio (opcional)
  status?: DramaStatus;        // Status atual (opcional)
  releaseDays?: DayOfWeek[];   // Dias da semana em que saem novos episódios (opcional)
  synopsis?: string;           // Sinopse/resumo da trama (opcional)
  originalTitle?: string;      // Título original (em coreano/japonês/chinês) (opcional)
  genres?: string[];           // Lista de gêneros: Ex: ['Romance', 'Comédia'] (opcional)
  totalSeasons: number;
  totalEpisodes: number;
  episodesReleased?: number;   // Quantos episódios já saíram até agora (opcional)
  posterUrl: string;
  backdropUrl?: string;        // Imagem de fundo horizontal / Hero (opcional)
}

export interface MetricCard {
  id: string;
  title: string;
  value: string | number;
  subtitle: string;
  icon: string;
  isHighlight?: boolean;
}