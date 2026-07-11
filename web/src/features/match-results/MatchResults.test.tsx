import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MatchResults } from './MatchResults';

const server = setupServer(
  http.get('*/matches/filters', () => HttpResponse.json({
    status: 'success',
    filters: { teams: [], leagues: [] },
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
        home_score: 2,
        home_emblem: 'home.png',
        away: 'Grêmio',
        away_score: 1,
        away_emblem: 'away.png',
        date: '2025-04-12T00:00:00.000Z',
        league: 'Brasileirão',
        status: 'FINISHED',
      }],
    });
  }),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
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

  it('replaces the screen with an error when Match Results Filter Options cannot load', async () => {
    server.use(
      http.get('*/matches/filters', () => new HttpResponse(null, { status: 500 })),
    );
    renderMatchResults('/resultados');

    expect(await screen.findByText('Não foi possível carregar os resultados.')).toBeInTheDocument();
  });
});
