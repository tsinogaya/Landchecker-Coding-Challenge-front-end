import { useEffect, useMemo, useRef, useState } from 'react';
import { SearchFilters } from '../components/SearchFilters';
import { PropertyCard } from '../components/PropertyCard';
import { useInfiniteProperties } from '../hooks/useInfiniteProperties';
import { useWatchlist } from '../context/WatchlistContext';
import type { SearchFilters as Filters } from '../types';

export function PropertySearchPage() {
  const [filters, setFilters] = useState<Filters>({});
  const { items, loading, error, hasMore, loadNext } = useInfiniteProperties(filters);
  const { watchlistIds, toggle, updates } = useWatchlist();
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const target = sentinelRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadNext();
      },
      { rootMargin: '250px' }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [loadNext]);

  const list = useMemo(() => items, [items]);

  return (
    <section>
      <SearchFilters onApply={setFilters} />
      {error && <p className="error">{error}</p>}
      <div className="grid">
        {list.map((property) => (
          <PropertyCard
            key={property.id}
            property={property}
            watched={watchlistIds.has(property.id)}
            livePriceCents={updates[property.id]?.price_cents}
            liveStatus={updates[property.id]?.status}
            onToggleWatch={(id) => void toggle(id)}
          />
        ))}
      </div>
      {loading && <p>Loading properties...</p>}
      {!hasMore && !loading && <p>End of results.</p>}
      <div ref={sentinelRef} />
    </section>
  );
}
