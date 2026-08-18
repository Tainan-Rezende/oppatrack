export type DramaStatus = 'watching' | 'completed' | 'plan_to_watch' | 'on_hold' | 'dropped';

export interface UserDramaTracker {
  id?: string;
  user_id: string;
  drama_id: string;
  drama_title: string;
  drama_poster?: string;
  total_episodes: number;
  current_episode: number;
  status: DramaStatus;
  rating?: number | null;
  is_favorite: boolean;
  review_text?: string;
  is_review_public: boolean;
  start_date?: string | null;
  end_date?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface DramaModalPayload {
  drama_id: string;
  drama_title: string;
  drama_poster?: string;
  total_episodes: number;
}