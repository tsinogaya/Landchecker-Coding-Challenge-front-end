import { useState } from 'react';
import type { SearchFilters } from '../types';

type Props = {
  onApply: (filters: SearchFilters) => void;
};

export function SearchFilters({ onApply }: Props) {
  const [filters, setFilters] = useState<SearchFilters>({});

  return (
    <div className="filters">
      <input
        placeholder="Min price"
        inputMode="numeric"
        value={filters.min_price || ''}
        onChange={(e) => setFilters((prev) => ({ ...prev, min_price: e.target.value }))}
      />
      <input
        placeholder="Max price"
        inputMode="numeric"
        value={filters.max_price || ''}
        onChange={(e) => setFilters((prev) => ({ ...prev, max_price: e.target.value }))}
      />
      <select
        value={filters.bedrooms || ''}
        onChange={(e) => setFilters((prev) => ({ ...prev, bedrooms: e.target.value || undefined }))}
      >
        <option value="">Any bedrooms</option>
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
        <option value="4">4</option>
        <option value="5">5</option>
      </select>
      <select
        value={filters.property_type || ''}
        onChange={(e) => setFilters((prev) => ({ ...prev, property_type: e.target.value || undefined }))}
      >
        <option value="">Any type</option>
        <option value="house">House</option>
        <option value="apartment">Apartment</option>
        <option value="townhouse">Townhouse</option>
        <option value="unit">Unit</option>
        <option value="land">Land</option>
      </select>
      <button onClick={() => onApply(filters)}>Apply</button>
    </div>
  );
}
