import type { PaginatedResponse, Property, SearchFilters } from '../types';
import { request } from './client';

export function fetchProperties(filters: SearchFilters, page: number, perPage = 20) {
  const query = new URLSearchParams();
  query.set('page', String(page));
  query.set('per_page', String(perPage));

  Object.entries(filters).forEach(([key, value]) => {
    if (value) query.set(key, value);
  });

  return request<PaginatedResponse<Property>>(`/properties?${query.toString()}`);
}
