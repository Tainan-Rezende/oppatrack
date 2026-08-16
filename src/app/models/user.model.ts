export interface SocialLinks {
  instagram?: string;
  twitter?: string;
  tiktok?: string;
  telegram?: string;
  discord?: string;
  mydramalist?: string;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  profile_code: string;
  avatar_url?: string;
  bio?: string;
  favorite_drama_id?: string;
  social_links?: SocialLinks;
  preferred_countries?: string[];
  created_at: string;
}