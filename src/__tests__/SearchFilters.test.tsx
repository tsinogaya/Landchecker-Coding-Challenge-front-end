import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchFilters } from '../components/SearchFilters';

describe('SearchFilters', () => {
  it('applies selected filters', async () => {
    const user = userEvent.setup();
    const onApply = vi.fn();
    render(<SearchFilters onApply={onApply} />);

    await user.type(screen.getByPlaceholderText('Min price'), '500000');
    await user.selectOptions(screen.getByDisplayValue('Any type'), 'house');
    await user.click(screen.getByRole('button', { name: 'Apply' }));

    expect(onApply).toHaveBeenCalledWith(
      expect.objectContaining({
        min_price: '500000',
        property_type: 'house'
      })
    );
  });
});
