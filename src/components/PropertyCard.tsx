import { memo } from 'react';
import type { Property } from '../types';

type Props = {
  property: Property;
  watched: boolean;
  livePriceCents?: number;
  liveStatus?: string;
  onToggleWatch: (id: number) => void;
};

function formatMoney(priceCents: number) {
  return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: 0 }).format(
    priceCents / 100
  );
}

export const PropertyCard = memo(function PropertyCard({
  property,
  watched,
  livePriceCents,
  liveStatus,
  onToggleWatch
}: Props) {
  const price = livePriceCents ?? property.price_cents;
  const status = liveStatus ?? property.status;

  return (
    <article className="property-card">
      <header>
        <h3>{property.title}</h3>
        <span className={`status status-${status}`}>{status}</span>
      </header>
      <p>{property.address}</p>
      <p>
        {property.bedrooms} bed • {property.bathrooms} bath • {property.property_type}
      </p>
      <p className="price">{formatMoney(price)}</p>
      <button onClick={() => onToggleWatch(property.id)}>{watched ? 'Remove from watchlist' : 'Save to watchlist'}</button>
    </article>
  );
});
