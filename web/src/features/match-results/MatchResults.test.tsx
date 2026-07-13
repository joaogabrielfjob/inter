import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import userEvent from '@testing-library/user-event';
import { MatchResults } from './MatchResults';

class MockIntersectionObserver {
  static instances: MockIntersectionObserver[] = [];
  readonly observe = vi.fn();
  readonly unobserve = vi.fn();
  readonly disconnect = vi.fn();
  readonly takeRecords = vi.fn(() => []);

  constructor(readonly callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
    if (options?.rootMargin?.includes('vh')) {
      throw new TypeError('IntersectionObserver constructor: rootMargin must be specified in pixels or percent.');
    }
    MockIntersectionObserver.instances.push(this);
  }

  trigger() {
    this.callback([{ isIntersecting: true } as IntersectionObserverEntry], this as unknown as IntersectionObserver);
  }
}

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

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
  globalThis.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;
});
afterEach(() => {
  server.resetHandlers();
  cleanup();
  MockIntersectionObserver.instances = [];
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

  it('automatically appends the next Match Results batch and shows when the search ends', async () => {
    server.use(
      http.get('*/matches', ({ request }) => {
        const cursor = new URL(request.url).searchParams.get('cursor');

        return HttpResponse.json({
          status: 'success',
          matches: [cursor ? {
            id: 2, home: 'Juventude', homeScore: 0, away: 'Internacional', awayScore: 1, matchDay: '2025-04-05', league: 'Brasileirão',
          } : {
            id: 1, home: 'Internacional', homeScore: 2, away: 'Grêmio', awayScore: 1, matchDay: '2025-04-12', league: 'Brasileirão',
          }],
          ...(cursor ? {} : { nextCursor: 'next-page' }),
        });
      }),
    );
    renderMatchResults('/resultados');

    await screen.findByText('Grêmio');
    MockIntersectionObserver.instances[MockIntersectionObserver.instances.length - 1]?.trigger();

    expect(await screen.findByText('Juventude')).toBeInTheDocument();
    expect(screen.getByText('Todos os resultados foram carregados.')).toBeInTheDocument();
  });

  it('keeps loaded Match Results visible and retries after a later batch fails', async () => {
    let nextPageAttempts = 0;
    server.use(
      http.get('*/matches', ({ request }) => {
        const cursor = new URL(request.url).searchParams.get('cursor');
        if (!cursor) return HttpResponse.json({
          status: 'success',
          matches: [{ id: 1, home: 'Internacional', homeScore: 2, away: 'Grêmio', awayScore: 1, matchDay: '2025-04-12', league: 'Brasileirão' }],
          nextCursor: 'next-page',
        });

        nextPageAttempts += 1;
        if (nextPageAttempts === 1) return new HttpResponse(null, { status: 500 });
        return HttpResponse.json({
          status: 'success',
          matches: [{ id: 2, home: 'Juventude', homeScore: 0, away: 'Internacional', awayScore: 1, matchDay: '2025-04-05', league: 'Brasileirão' }],
        });
      }),
    );
    renderMatchResults('/resultados');

    await screen.findByText('Grêmio');
    MockIntersectionObserver.instances[MockIntersectionObserver.instances.length - 1]?.trigger();

    expect(await screen.findByText('Não foi possível carregar mais resultados.')).toBeInTheDocument();
    expect(screen.getByText('Grêmio')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    expect(await screen.findByText('Juventude')).toBeInTheDocument();
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
