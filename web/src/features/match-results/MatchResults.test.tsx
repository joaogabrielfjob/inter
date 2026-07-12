import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import userEvent from '@testing-library/user-event';
import { MatchResults } from './MatchResults';

const server = setupServer(
  http.get('*/matches/filters', () => HttpResponse.json({
    status: 'success',
    filters: { years: [], months: [], teams: [], leagues: [] },
  })),
  http.get('*/matches', ({ request }) => {
    const url = new URL(request.url);

    if (url.searchParams.get('year') !== '2025') {
      return HttpResponse.json({ status: 'success', matches: [] });
    }

    return HttpResponse.json({
      status: 'success',
      matches: [{
        id: 1,
        home: 'Internacional',
        homeScore: 2,
        homeEmblem: 'home.png',
        away: 'Grêmio',
        awayScore: 1,
        awayEmblem: 'away.png',
        matchDay: '2025-04-12',
        league: 'Brasileirão',
      }],
    });
  }),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  cleanup();
});
afterAll(() => server.close());

function renderMatchResults(initialEntry: string) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <MatchResults />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('MatchResults', () => {
  it('shows an invalid-link state instead of retrieving an invalid Match Results Search', () => {
    renderMatchResults('/resultados?ano=invalid');

    expect(screen.getByText('Link de busca inválido.')).toBeInTheDocument();
  });

  it('retrieves the confirmed Match Results Search from the URL', async () => {
    renderMatchResults('/resultados?ano=2025');

    await waitFor(() => {
      expect(screen.getByText('Internacional')).toBeInTheDocument();
    });
  });

  it('clears Match Results Filters from the toolbar and retrieves the unfiltered search', async () => {
    renderMatchResults('/resultados?ano=2025');

    await screen.findByText('Internacional');

    await userEvent.click(screen.getByRole('button', { name: 'Limpar filtros' }));

    expect(await screen.findByText('Nenhum jogo encontrado.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Limpar filtros' })).toBeInTheDocument();
  });

  it('replaces the screen with an error when Match Results Filter Options cannot load', async () => {
    server.use(
      http.get('*/matches/filters', () => new HttpResponse(null, { status: 500 })),
    );
    renderMatchResults('/resultados');

    expect(await screen.findByText('Não foi possível carregar os resultados.')).toBeInTheDocument();
  });

  it('retries a failed Match Results Search', async () => {
    let attempts = 0;
    server.use(
      http.get('*/matches', () => {
        attempts += 1;
        if (attempts === 1) return new HttpResponse(null, { status: 500 });
        return HttpResponse.json({ status: 'success', matches: [{
          id: 1, home: 'Internacional', homeScore: 2, homeEmblem: 'home.png', away: 'Grêmio', awayScore: 1, awayEmblem: 'away.png', matchDay: '2025-04-12', league: 'Brasileirão',
        }] });
      }),
    );
    renderMatchResults('/resultados?ano=2025');
    await screen.findByText('Não foi possível carregar os resultados.');

    await userEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    expect((await screen.findAllByText('Internacional')).length).toBeGreaterThan(0);
    expect(attempts).toBe(2);
  });
});
