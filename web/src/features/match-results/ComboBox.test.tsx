import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ComboBox } from './ComboBox';

describe('ComboBox', () => {
  it('finds an accented team name from an unaccented prefix', async () => {
    render(<ComboBox data={[{ value: 'Grêmio', label: 'Grêmio' }]} placeholder='Times' onChange={vi.fn()} />);

    await userEvent.click(screen.getByRole('button', { name: 'Times' }));
    await userEvent.type(screen.getByPlaceholderText('Pesquise um time...'), 'Gre');

    expect(screen.getByText('Grêmio')).toBeInTheDocument();
  });
});
