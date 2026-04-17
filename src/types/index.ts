export type PropertyType = 'house' | 'apartment' | 'townhouse' | 'unit' | 'land';

export type Property = {
  id: number;
  title: string;
  address: string;
  property_type: PropertyType;
  bedrooms: number;
  bathrooms: number;
  price_cents: number;
  status: string;
  listed_at: string;
  updated_at: string;
};

export type SearchFilters = {
  min_price?: string;
  max_price?: string;
  bedrooms?: string;
  property_type?: string;
};

export type PaginatedResponse<T> = {
  data: T[];
  meta: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
};
