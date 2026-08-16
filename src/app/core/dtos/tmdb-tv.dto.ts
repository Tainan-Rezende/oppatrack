export interface TmdbTvDetailsDto {
  id: number;
  name: string;
  original_name: string;
  overview: string;
  vote_average: number;
  first_air_date: string;
  last_air_date: string;
  status: string; // 'Returning Series', 'Ended', 'Planned', etc.
  number_of_seasons: number;
  number_of_episodes: number;
  episode_run_time: number[];
  origin_country: string[];
  genres: { id: number; name: string }[];
  networks: { id: number; name: string; logo_path: string }[];
  poster_path: string | null;
  backdrop_path: string | null;

  // Anexados via append_to_response
  credits?: {
    cast: { id: number; name: string; character: string; profile_path: string | null }[];
    crew: { id: number; name: string; job: string }[];
  };
  'watch/providers'?: {
    results: {
      BR?: {
        link?: string;
        flatrate?: { provider_id: number; provider_name: string; logo_path: string }[];
      };
    };
  };
  content_ratings?: {
    results: { iso_3166_1: string; rating: string }[];
  };
}
