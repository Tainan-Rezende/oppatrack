import { ActorDetailModel } from '../../models/actor.model';
import { mapTmdbToDrama } from './drama.mapper';
import { environment } from '../../../environments/environment';
import { formatActorNames } from '../utils/actor-name.util';

function calculateAge(birthdayStr?: string): number | undefined {
  if (!birthdayStr) return undefined;
  const birthDate = new Date(birthdayStr);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

export function mapTmdbToActorDetail(dto: any): ActorDetailModel {
  const imgBase = environment.tmdb.imageBaseUrl;

  const photos = (dto.images?.profiles || [])
    .slice(0, 8)
    .map((img: any) => `${imgBase}/w500${img.file_path}`);

  const blockedGenres = [16, 99, 10762, 10764, 10767];
  const rawDramas = dto.tv_credits?.cast || [];

  const validDramas = rawDramas
    .filter((d: any) =>
      d.origin_country?.some((c: string) => ['KR', 'CN', 'JP', 'TH', 'TW'].includes(c))
    )
    .filter((d: any) => !d.genre_ids?.some((g: number) => blockedGenres.includes(g)))
    .filter((d: any) => d.character && !d.character.toLowerCase().startsWith('self'))
    .filter((d: any) => !!d.poster_path)
    .sort((a: any, b: any) => (b.first_air_date || '').localeCompare(a.first_air_date || ''))
    .map((d: any) => mapTmdbToDrama(d));

  const alsoKnownAs = (dto.also_known_as || []).map((n: string) => n.trim());
  const names = formatActorNames(dto.name, dto.original_name, alsoKnownAs);

  return {
    id: String(dto.id),
    name: names.name,
    originalName: names.originalName,
    alsoKnownAs: alsoKnownAs.slice(0, 4),
    biography: dto.biography,
    birthday: dto.birthday,
    age: calculateAge(dto.birthday),
    placeOfBirth: dto.place_of_birth,
    profileUrl: dto.profile_path ? `${imgBase}/h632${dto.profile_path}` : '',
    gender: dto.gender === 1 ? 'Feminino' : 'Masculino',
    knownFor: dto.known_for_department === 'Acting' ? 'Atuação' : dto.known_for_department,
    imdbUrl: dto.imdb_id ? `https://www.imdb.com/name/${dto.imdb_id}` : undefined,
    photos,
    dramas: validDramas,
  };
}