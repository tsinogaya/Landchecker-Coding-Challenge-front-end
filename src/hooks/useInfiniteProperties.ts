import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchProperties } from '../api/properties';
import type { Property, SearchFilters } from '../types';

export function useInfiniteProperties(filters: SearchFilters) {
  const [items, setItems] = useState<Property[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currentRequest = useRef(0);

  const load = useCallback(
    async (nextPage: number, reset = false) => {
      setLoading(true);
      setError(null);
      const reqId = Date.now();
      currentRequest.current = reqId;

      try {
        const response = await fetchProperties(filters, nextPage);
        if (currentRequest.current !== reqId) return;

        setItems((prev) => (reset ? response.data : [...prev, ...response.data]));
        setPage(nextPage);
        setHasMore(nextPage < response.meta.total_pages);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load properties');
      } finally {
        setLoading(false);
      }
    },
    [filters]
  );

  useEffect(() => {
    load(1, true);
  }, [load]);

  const loadNext = useCallback(() => {
    if (loading || !hasMore) return;
    void load(page + 1);
  }, [page, hasMore, loading, load]);

  return { items, loading, error, hasMore, loadNext };
}
