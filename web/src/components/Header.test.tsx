import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { Header } from './Header';

describe('Header', () => {
  it('offers Estatísticas alongside Jogos and Resultados', () => {
    render(<MemoryRouter><Header /></MemoryRouter>);

    expect(screen.getByRole('link', { name: 'Jogos' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'Resultados' })).toHaveAttribute('href', '/resultados');
    expect(screen.getByRole('link', { name: 'Estatísticas' })).toHaveAttribute('href', '/estatisticas');
  });
});
