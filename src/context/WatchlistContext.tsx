import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { createConsumer } from '@rails/actioncable';
import * as watchlistApi from '../api/watchlist';
import { useAuth } from './AuthContext';

type WatchlistContextType = {
  watchlistIds: Set<number>;
  loading: boolean;
  toggle: (propertyId: number) => Promise<void>;
  updates: Record<number, { price_cents: number; status: string }>;
};

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined);

export function WatchlistProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const [watchlistIds, setWatchlistIds] = useState(new Set<number>());
  const [updates, setUpdates] = useState<Record<number, { price_cents: number; status: string }>>({});
  const [loading, setLoading] = useState(false);

  const loadWatchlist = useCallback(async () => {
    setLoading(true);
    try {
      const response = await watchlistApi.fetchWatchlist();
      setWatchlistIds(new Set(response.data.map((property) => property.id)));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!token) {
      setWatchlistIds(new Set<number>());
      setUpdates({});
      setLoading(false);
      return;
    }

    let alive = true;
    loadWatchlist().catch(() => {
      if (!alive) return;
      setWatchlistIds(new Set<number>());
    });

    const cableUrl = `${import.meta.env.VITE_CABLE_URL || 'ws://localhost:3000/cable'}?token=${token}`;
    const consumer = createConsumer(cableUrl);

    const subscription = consumer.subscriptions.create(
      { channel: 'WatchlistChannel' },
      {
        received: (payload: { type: string; property_id: number; price_cents: number; status: string }) => {
          if (payload.type !== 'property_updated') return;
          setUpdates((prev) => ({
            ...prev,
            [payload.property_id]: {
              price_cents: payload.price_cents,
              status: payload.status
            }
          }));
        }
      }
    );

    return () => {
      alive = false;
      subscription.unsubscribe();
      consumer.disconnect();
    };
  }, [token, loadWatchlist]);

  const toggle = useCallback(
    async (propertyId: number) => {
      const isWatching = watchlistIds.has(propertyId);
      if (isWatching) {
        await watchlistApi.removeFromWatchlist(propertyId);
        setWatchlistIds((prev) => {
          const next = new Set(prev);
          next.delete(propertyId);
          return next;
        });
      } else {
        await watchlistApi.addToWatchlist(propertyId);
        setWatchlistIds((prev) => {
          const next = new Set(prev);
          next.add(propertyId);
          return next;
        });
      }

      // Reconcile with backend state to avoid stale favorites after auth/session transitions.
      await loadWatchlist();
    },
    [watchlistIds, loadWatchlist]
  );

  const value = useMemo(() => ({ watchlistIds, loading, toggle, updates }), [watchlistIds, loading, toggle, updates]);

  return <WatchlistContext.Provider value={value}>{children}</WatchlistContext.Provider>;
}

export function useWatchlist() {
  const context = useContext(WatchlistContext);
  if (!context) throw new Error('useWatchlist must be used within WatchlistProvider');
  return context;
}
