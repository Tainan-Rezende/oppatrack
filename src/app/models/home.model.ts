export interface MetricCard {
  id: string;
  title: string;
  value: string | number;
  subtitle: string;
  icon: string;
  isHighlight?: boolean;
}

export interface CategoryItem {
  name: string;
  icon: string;
  genre?: string;
  keyword?: string;
}

export const HOME_CATEGORIES: CategoryItem[] = [
  { name: 'Romance', keyword: '9840|210024', icon: 'fa-solid fa-heart' },
  { name: 'Comédia', genre: '35', icon: 'fa-solid fa-face-laugh-beam' },
  { name: 'Mistério & Crime', genre: '9648|80', icon: 'fa-solid fa-user-secret' },
  { name: 'Fantasia & Sci-Fi', genre: '10765', icon: 'fa-solid fa-wand-magic-sparkles' },
  { name: 'Histórico (Sageuk)', genre: '10768', icon: 'fa-solid fa-landmark' },
  { name: 'Ação & Suspense', genre: '10759', icon: 'fa-solid fa-shield-halved' },
];