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

  const { favorites, others } = useMemo(() => {
    const favoriteItems = items.filter((property) => watchlistIds.has(property.id));
    const otherItems = items.filter((property) => !watchlistIds.has(property.id));
    return { favorites: favoriteItems, others: otherItems };
  }, [items, watchlistIds]);

  return (
    <section>
      <SearchFilters onApply={setFilters} />
      {error && <p className="error">{error}</p>}
      <div className="dashboard-section">
        <div className="section-header">
          <h2>Favorites First</h2>
          <span>{favorites.length} saved</span>
        </div>
        {favorites.length === 0 ? (
          <p className="empty-state">Save a property to see it pinned at the top of your dashboard.</p>
        ) : (
          <div className="grid">
            {favorites.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                watched={true}
                livePriceCents={updates[property.id]?.price_cents}
                liveStatus={updates[property.id]?.status}
                onToggleWatch={(id) => void toggle(id)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="dashboard-section">
        <div className="section-header">
          <h2>Other Listings</h2>
          <span>{others.length} shown</span>
        </div>
        <div className="grid">
          {others.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              watched={false}
              livePriceCents={updates[property.id]?.price_cents}
              liveStatus={updates[property.id]?.status}
              onToggleWatch={(id) => void toggle(id)}
            />
          ))}
        </div>
      </div>
      {loading && <p>Loading properties...</p>}
      {!hasMore && !loading && <p>End of results.</p>}
      <div ref={sentinelRef} />
    </section>
  );
}
