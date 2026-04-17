import type { Property } from '../types';
import { request } from './client';

export function fetchWatchlist() {
  return request<{ data: Property[] }>('/watchlist');
}

export function addToWatchlist(propertyId: number) {
  return request<{ data: Property }>(`/watchlist/${propertyId}`, { method: 'POST' });
}

export function removeFromWatchlist(propertyId: number) {
  return request<void>(`/watchlist/${propertyId}`, { method: 'DELETE' });
}
