import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PropertyCard } from '../components/PropertyCard';

describe('PropertyCard', () => {
  it('calls toggle when watchlist button is clicked', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();

    render(
      <PropertyCard
        property={{
          id: 1,
          title: 'Test Property',
          address: '123 Test St',
          property_type: 'house',
          bedrooms: 3,
          bathrooms: 2,
          price_cents: 95000000,
          status: 'active',
          listed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }}
        watched={false}
        onToggleWatch={onToggle}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Save to watchlist' }));
    expect(onToggle).toHaveBeenCalledWith(1);
  });
});
