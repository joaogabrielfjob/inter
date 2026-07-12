import { cleanup, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { Matches } from './Matches';

const server = setupServer(
  http.get('*/matches', () => HttpResponse.json({
    status: 'success',
    matches: [{
      id: 1,
      home: 'Internacional',
      homeScore: 0,
      homeEmblem: 'home.png',
      away: 'Grêmio',
      awayScore: 0,
      awayEmblem: 'away.png',
      matchDay: '2025-04-12',
      kickoffTime: '18:30',
      league: 'Brasileirão',
    }],
  })),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  cleanup();
});
afterAll(() => server.close());

describe('Matches', () => {
  it('shows an upcoming Match from the shared browser-facing Match response', async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    render(
      <QueryClientProvider client={queryClient}>
        <Matches />
      </QueryClientProvider>,
    );

    expect(await screen.findByText('Internacional')).toBeInTheDocument();
    expect(screen.getByText('12/04/25')).toBeInTheDocument();
    expect(screen.getByText('18:30')).toBeInTheDocument();
  });
});
