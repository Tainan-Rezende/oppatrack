import { Drama } from './drama.model';

export interface ActorSummary {
  id: string;
  name: string;
  originalName?: string;
  profileUrl: string;
  knownFor?: string;
}

export interface ActorDetailModel {
  id: string;
  name: string;
  originalName?: string;
  alsoKnownAs?: string[];
  biography?: string;
  birthday?: string;
  age?: number;
  placeOfBirth?: string;
  profileUrl: string;
  gender: string;
  knownFor: string;
  imdbUrl?: string;
  photos: string[]; // Galeria de fotos oficiais
  dramas: Drama[]; // Lista limpa de doramas roteirizados
}
