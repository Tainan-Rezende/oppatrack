import { Drama, DramaCountry, DramaStatus, CastMember } from '../../models/drama.model';
import { StreamingPlatform } from '../../models/streaming-platform.model';
import { environment } from '../../../environments/environment';
import { formatActorNames } from '../utils/actor-name.util';

export function mapTmdbToDrama(dto: any): Drama {
  const imgBase = environment.tmdb.imageBaseUrl;

  // Status mapping
  let status: DramaStatus = 'upcoming';
  if (dto.status === 'Returning Series' || dto.status === 'In Production') {
    status = 'ongoing';
  } else if (dto.status === 'Ended' || dto.status === 'Canceled') {
    status = 'completed';
  }

  // Country mapping
  const countryMap: Record<string, DramaCountry> = {
    KR: 'Coreia do Sul',
    CN: 'China',
    JP: 'Japão',
    TH: 'Tailândia',
    TW: 'Taiwan',
  };
  const countryCode = dto.origin_country?.[0];
  const country = countryCode ? countryMap[countryCode] : undefined;

  // Equipe tecnica
  const creators = dto.created_by?.map((c: any) => c.name) || [];
  const director = dto.credits?.crew?.find((c: any) => c.job === 'Director')?.name;
  const screenwriter = dto.credits?.crew?.find((c: any) => c.job === 'Writer' || c.job === 'Screenplay')?.name;

  // Classificacao Indicativa BR ou fallback
  const brRating = dto.content_ratings?.results?.find((r: any) => r.iso_3166_1 === 'BR')?.rating;
  const fallbackRating = dto.content_ratings?.results?.[0]?.rating;

  // Streaming: Plataformas disponiveis
  const rawProviders = dto['watch/providers']?.results?.BR?.flatrate || [];
  const uniqueProviders = rawProviders.filter((p: any) => !p.provider_name.toLowerCase().includes('ads'));

  const streaming: StreamingPlatform[] = uniqueProviders.map((p: any) => {
    const hasDirectMatch = dto.homepage && dto.homepage.toLowerCase().includes(p.provider_name.toLowerCase().replace(/\s+/g, ''));
    const directUrl = hasDirectMatch ? dto.homepage : (dto['watch/providers']?.results?.BR?.link || dto.homepage || '#');

    return {
      id: String(p.provider_id),
      name: p.provider_name,
      logo: `${imgBase}/original${p.logo_path}`,
      url: directUrl,
    };
  });

  // Elenco Completo e Elenco Reduzido
  const rawCast = dto.aggregate_credits?.cast || dto.credits?.cast || [];

  const fullCast: CastMember[] = rawCast
    .filter((c: any) => !!c.name && (!c.character || !c.character.toLowerCase().startsWith('self')))
    .map((c: any) => {
      const names = formatActorNames(c.name, c.original_name, c.also_known_as || []);
      const characterName = c.roles?.[0]?.character || c.character || 'Personagem';

      return {
        id: c.id,
        name: names.name,
        character: characterName,
        profileUrl: c.profile_path ? `${imgBase}/h632${c.profile_path}` : undefined,
      };
    });

  const castPreview: CastMember[] = fullCast.slice(0, 4);

  // Galeria de Fotos (Backdrops e Posteres)
  const backdrops = (dto.images?.backdrops || []).map((img: any) => `${imgBase}/original${img.file_path}`);
  const posters = (dto.images?.posters || []).map((img: any) => `${imgBase}/w500${img.file_path}`);
  
  let photos = [...backdrops, ...posters];
  
  // Fallback caso a galeria do TMDB nao possua imagens secundarias cadastradas
  if (photos.length === 0) {
    if (dto.backdrop_path) photos.push(`${imgBase}/original${dto.backdrop_path}`);
    if (dto.poster_path) photos.push(`${imgBase}/w500${dto.poster_path}`);
  }

  return {
    id: String(dto.id),
    title: dto.name,
    originalTitle: dto.original_name,
    tagline: dto.tagline,
    synopsis: dto.overview,
    rating: dto.vote_average,
    status,
    releaseDate: dto.first_air_date,
    endDate: dto.last_air_date,
    genres: dto.genres?.map((g: any) => g.name) || [],
    country,
    network: dto.networks?.[0]?.name,
    episodeDuration: dto.episode_run_time?.[0] ? `${dto.episode_run_time[0]} min` : undefined,
    ageRating: brRating || fallbackRating,
    director,
    screenwriter,
    creators,
    totalSeasons: dto.number_of_seasons,
    totalEpisodes: dto.number_of_episodes,
    posterUrl: dto.poster_path ? `${imgBase}/w500${dto.poster_path}` : '',
    backdropUrl: dto.backdrop_path ? `${imgBase}/original${dto.backdrop_path}` : '',
    streaming,
    castPreview,
    fullCast,
    photos,
  };
}