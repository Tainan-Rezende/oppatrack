export interface PaginatedResult<T> {
  results: T[];
  page: number;
  totalPages: number;
  totalResults: number;
}