export interface PaginatedResponse<T = unknown> {
  data: T[];
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
  from: number;
  to: number;
  [key: string]: unknown;
}
