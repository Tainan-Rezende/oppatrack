import { StreamingPlatform } from './streaming-platform.model';

export type DramaStatus = 'ongoing' | 'completed' | 'upcoming';

export type DayOfWeek =
  | 'Domingo'
  | 'Segunda-feira'
  | 'Terça-feira'
  | 'Quarta-feira'
  | 'Quinta-feira'
  | 'Sexta-feira'
  | 'Sábado';

export type DramaCountry = 'Coreia do Sul' | 'China' | 'Japão' | 'Tailândia' | 'Taiwan';

export interface CastMember {
  id: number | string;
  name: string;
  originalName?: string;
  character: string;
  profileUrl?: string;
}

export interface Drama {
  id: string;
  title: string;
  originalTitle?: string;
  tagline?: string;
  synopsis?: string;
  rating: number;
  status?: DramaStatus;
  releaseDate: string;
  endDate?: string;
  releaseDays?: DayOfWeek[];
  genres?: string[];
  country?: DramaCountry;
  network?: string;
  episodeDuration?: string;
  ageRating?: string;
  director?: string;
  screenwriter?: string;
  creators?: string[];
  totalSeasons?: number;
  totalEpisodes?: number;
  episodesReleased?: number;
  posterUrl: string;
  backdropUrl?: string;
  trailerUrl?: string;
  streaming?: StreamingPlatform[];
  castPreview?: CastMember[];
  fullCast?: CastMember[]; 
  photos?: string[];
}