import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of, map, switchMap, catchError } from 'rxjs';
import { Drama } from '../../models/drama.model';
import { ActorSummary, ActorDetailModel } from '../../models/actor.model';
import { PaginatedResult } from '../../models/pagination.model';
import { TmdbTvDetailsDto } from '../dtos/tmdb-tv.dto';
import { mapTmdbToDrama } from '../mappers/drama.mapper';
import { mapTmdbToActorDetail } from '../mappers/actor.mapper';
import { environment } from '../../../environments/environment';
import { formatActorNames } from '../utils/actor-name.util';

@Injectable({
  providedIn: 'root',
})
export class DramaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.tmdb.baseUrl;

  // Generos bloqueados: 16 (Animacao), 10762 (Kids/Tokusatsu), 10764 (Reality), 10767 (Talk Show), 10763 (Noticias)
  private readonly blockedGenres = '16,10762,10764,10767,10763';

  // 1. Verificação aprofundada de produções e atores asiáticos
  private isAsianProduction(item: any): boolean {
    if (!item) return false;
    const asianLangs = ['ko', 'ja', 'zh', 'th', 'cn', 'vi', 'yue'];
    const asianCountries = ['KR', 'JP', 'CN', 'TH', 'TW', 'HK'];

    const hasAsianLang = asianLangs.includes(item.original_language?.toLowerCase());
    const hasAsianCountry = item.origin_country?.some((c: string) =>
      asianCountries.includes(c?.toUpperCase()),
    );

    return hasAsianLang || hasAsianCountry;
  }

  private isAsianActor(p: any): boolean {
    // Detecta se o nome original contém escrita asiática (Hangul, Hanzi, Kanji, Kana)
    const cjkRegex =
      /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f\uac00-\ud7af]/;
    if (cjkRegex.test(p.name) || cjkRegex.test(p.original_name)) {
      return true;
    }

    // Valida se as produções conhecidas do artista são asiáticas
    if (p.known_for && Array.isArray(p.known_for)) {
      return p.known_for.some((k: any) => this.isAsianProduction(k));
    }

    return false;
  }

  // Detalhes completos do dorama por ID
  getDramaById(id: string | number): Observable<Drama> {
    const url = `${this.baseUrl}/tv/${id}`;
    const params = {
      append_to_response: 'credits,aggregate_credits,images,watch/providers,content_ratings',
      include_image_language: 'pt,en,ko,ja,zh,null',
    };
    return this.http.get<TmdbTvDetailsDto>(url, { params }).pipe(map((dto) => mapTmdbToDrama(dto)));
  }

  // Doramas populares paginados
  getPopularDramas(
    page: number = 1,
    filter?: { genre?: string; keyword?: string },
  ): Observable<PaginatedResult<Drama>> {
    const url = `${this.baseUrl}/discover/tv`;
    const today = new Date().toISOString().split('T')[0];

    const params: Record<string, string> = {
      page: String(page),
      sort_by: 'popularity.desc',
      with_origin_country: 'KR|CN|JP|TH|TW',
      without_genres: this.blockedGenres,
      'vote_count.gte': filter?.genre || filter?.keyword ? '5' : '15',
      'air_date.lte': today,
      'first_air_date.gte': '2010-01-01',
    };

    if (filter?.genre) {
      params['with_genres'] = filter.genre;
    }
    if (filter?.keyword) {
      params['with_keywords'] = filter.keyword;
    }

    return this.http
      .get<{
        results: TmdbTvDetailsDto[];
        page: number;
        total_pages: number;
        total_results: number;
      }>(url, { params })
      .pipe(
        map((res) => ({
          results: res.results.filter((dto) => !!dto.poster_path).map((dto) => mapTmdbToDrama(dto)),
          page: res.page,
          totalPages: Math.min(res.total_pages, 500),
          totalResults: res.total_results,
        })),
      );
  }

  // Doramas em exibicao recente (estreias reais dos ultimos 6 meses)
  getOnAirDramas(): Observable<Drama[]> {
    const url = `${this.baseUrl}/discover/tv`;
    const today = new Date().toISOString().split('T')[0];
    const sixMonthsAgo = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    const params = {
      sort_by: 'popularity.desc',
      with_origin_country: 'KR|CN|JP|TH|TW',
      with_genres: '18',
      without_genres: this.blockedGenres,
      'first_air_date.gte': sixMonthsAgo, // A serie precisa ter estreado recentemente
      'first_air_date.lte': today,
      'vote_count.gte': '5',
    };

    return this.http.get<{ results: any[] }>(url, { params }).pipe(
      map((res) =>
        res.results
          .filter((dto) => !!dto.poster_path)
          .slice(0, 6)
          .map((dto) => mapTmdbToDrama(dto)),
      ),
    );
  }

  // Doramas classicos mais bem avaliados (anos 2000 em diante)
  getTopRatedDramas(): Observable<Drama[]> {
    const url = `${this.baseUrl}/discover/tv`;

    const params = {
      sort_by: 'vote_average.desc',
      with_origin_country: 'KR|CN|JP|TH|TW',
      with_genres: '18',
      without_genres: this.blockedGenres,
      'first_air_date.gte': '2010-01-01', // Inicio da era moderna dos doramas
      'first_air_date.lte': '2023-12-31', // Apenas producoes consolidadas ate 2023
      'vote_count.gte': '600', // Exige alto volume historico de votos
    };

    return this.http.get<{ results: any[] }>(url, { params }).pipe(
      map((res) =>
        res.results
          .filter((dto) => !!dto.poster_path)
          .slice(0, 6)
          .map((dto) => mapTmdbToDrama(dto)),
      ),
    );
  }

  // Pesquisa de doramas
  searchDramas(query: string, page: number = 1): Observable<PaginatedResult<Drama>> {
    if (!query.trim()) {
      return this.getPopularDramas(page);
    }

    const url = `${this.baseUrl}/search/tv`;
    const params = { query: query.trim(), page: String(page), include_adult: 'false' };
    const blockedList = [16, 10762, 10764, 10767, 10763];

    return this.http
      .get<{ results: any[]; page: number; total_pages: number; total_results: number }>(url, {
        params,
      })
      .pipe(
        map((res) => {
          const filtered = res.results
            .filter((dto) =>
              dto.origin_country?.some((c: string) => ['KR', 'CN', 'JP', 'TH', 'TW'].includes(c)),
            )
            .filter((dto) => !dto.genre_ids?.some((id: number) => blockedList.includes(id)))
            .filter((dto) => (dto.vote_count ?? 0) >= 5)
            .filter((dto) => !!dto.poster_path)
            .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
            .map((dto) => mapTmdbToDrama(dto));

          return {
            results: filtered,
            page: res.page,
            totalPages: Math.min(res.total_pages, 500),
            totalResults: res.total_results,
          };
        }),
      );
  }

  // Detalhes do ator por ID
  getActorById(id: string | number): Observable<ActorDetailModel> {
    const url = `${this.baseUrl}/person/${id}`;
    const params = { append_to_response: 'tv_credits,images' };
    return this.http.get<any>(url, { params }).pipe(map((dto) => mapTmdbToActorDetail(dto)));
  }

  // Atores populares baseados nos top dramas
  getPopularActors(page: number = 1): Observable<PaginatedResult<ActorSummary>> {
    const imgBase = environment.tmdb.imageBaseUrl;
    const url = `${this.baseUrl}/discover/tv`;
    const params = {
      page: String(page),
      sort_by: 'popularity.desc',
      with_origin_country: 'KR|CN|JP|TH|TW',
      with_genres: '18',
      without_genres: this.blockedGenres,
      'first_air_date.gte': '2010-01-01',
      'vote_count.gte': '15',
    };

    return this.http
      .get<{ results: any[]; page: number; total_pages: number; total_results: number }>(url, {
        params,
      })
      .pipe(
        switchMap((dramaRes) => {
          // Pega os 16 doramas da pagina para extrair o elenco
          const topDramas = dramaRes.results.slice(0, 16);

          const creditsRequests = topDramas.map((drama) =>
            this.http.get<{ cast: any[] }>(`${this.baseUrl}/tv/${drama.id}/credits`).pipe(
              map((creditRes) => ({
                dramaTitle: drama.name,
                cast: (creditRes.cast || []).slice(0, 4),
              })),
              catchError(() => of({ dramaTitle: drama.name, cast: [] })),
            ),
          );

          return forkJoin(creditsRequests).pipe(
            map((dramaCredits) => {
              const uniqueActorsMap = new Map<number, ActorSummary>();

              dramaCredits.forEach(({ dramaTitle, cast }) => {
                cast.forEach((actor) => {
                  if (
                    actor.profile_path &&
                    !uniqueActorsMap.has(actor.id) &&
                    uniqueActorsMap.size < 20
                  ) {
                    uniqueActorsMap.set(actor.id, {
                      id: String(actor.id),
                      name: actor.name,
                      originalName:
                        actor.original_name !== actor.name ? actor.original_name : undefined,
                      profileUrl: `${imgBase}/h632${actor.profile_path}`,
                      knownFor: `${dramaTitle} (${actor.character})`,
                    });
                  }
                });
              });

              return {
                results: Array.from(uniqueActorsMap.values()),
                page: dramaRes.page,
                totalPages: Math.min(dramaRes.total_pages, 100),
                totalResults: dramaRes.total_results,
              };
            }),
          );
        }),
      );
  }

  // 2. Busca refinada de Artistas
  searchActors(query: string, page: number = 1): Observable<PaginatedResult<ActorSummary>> {
    if (!query.trim()) {
      return this.getPopularActors(page);
    }

    const url = `${this.baseUrl}/search/person`;
    const imgBase = environment.tmdb.imageBaseUrl;
    const params = {
      query: query.trim(),
      page: String(page),
      include_adult: 'false',
    };

    return this.http
      .get<{ results: any[]; page: number; total_pages: number; total_results: number }>(url, {
        params,
      })
      .pipe(
        map((res) => {
          const filteredActors = res.results
            // 1. Apenas atores e atrizes
            .filter((p) => p.known_for_department === 'Acting')
            // 2. Obrigatoriamente com foto cadastrada (elimina os cards pretos vazios)
            .filter((p) => !!p.profile_path)
            // 3. Apenas atores de doramas / asiáticos
            .filter((p) => this.isAsianActor(p))
            // 4. Ordena por relevância e popularidade (IU fica no topo)
            .sort((a, b) => (b.popularity || 0) - (a.popularity || 0));

          return {
            results: filteredActors.map((p) => {
              const names = formatActorNames(p.name, p.original_name, p.also_known_as || []);
              return {
                id: String(p.id),
                name: names.name,
                originalName: names.originalName,
                profileUrl: `${imgBase}/h632${p.profile_path}`,
                knownFor: p.known_for
                  ?.map((k: any) => k.name || k.title)
                  .filter(Boolean)
                  .slice(0, 2)
                  .join(', '),
              };
            }),
            page: res.page,
            totalPages: Math.min(res.total_pages, 500),
            totalResults: filteredActors.length,
          };
        }),
      );
  }
}
