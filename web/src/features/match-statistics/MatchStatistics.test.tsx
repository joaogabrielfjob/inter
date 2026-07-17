import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import userEvent from '@testing-library/user-event';
import { MatchStatistics } from './MatchStatistics';

const summary = {
  matchesPlayed: 21, wins: 12, draws: 5, losses: 4,
  goalsScored: 34, goalsConceded: 20, goalDifference: 14,
  winRate: 57.1, cleanSheets: 8,
};
const requests = vi.fn();

const server = setupServer(
  http.get('*/matches/filters', () => HttpResponse.json({
    status: 'success',
    filters: {
      years: [{ value: '2025', label: '2025' }, { value: '2024', label: '2024' }],
      months: [{ value: '1', label: 'Janeiro' }, { value: '12', label: 'Dezembro' }],
      teams: [{ value: 'Grêmio', label: 'Grêmio' }, { value: 'Juventude', label: 'Juventude' }],
      leagues: [{ value: 'Brasileirão', label: 'Brasileirão' }, { value: 'Copa do Brasil', label: 'Copa do Brasil' }],
    },
  })),
  http.get('*/matches/statistics', ({ request }) => {
    requests(new URL(request.url));
    return HttpResponse.json({ status: 'success', summary });
  }),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  cleanup();
  requests.mockReset();
});
afterAll(() => server.close());

function Location() {
  const location = useLocation();
  return <output data-testid='location'>{location.pathname}{location.search}</output>;
}

function renderMatchStatistics(initialEntry: string) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <MatchStatistics />
        <Location />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('MatchStatistics', () => {
  it('keeps a bare Estatísticas URL unfiltered', async () => {
    renderMatchStatistics('/estatisticas');

    await waitFor(() => {
      expect(screen.getByTestId('location')).toHaveTextContent('/estatisticas');
    });
    expect(requests).toHaveBeenCalledWith(expect.objectContaining({ search: '' }));
  });

  it('shows every Complete Performance Summary measure as numeric cards', async () => {
    renderMatchStatistics('/estatisticas?ano=2025');

    expect(await screen.findByText('Partidas jogadas')).toBeInTheDocument();
    expect(screen.getByText('21')).toBeInTheDocument();
    expect(screen.getByText('Vitórias, empates e derrotas')).toBeInTheDocument();
    expect(screen.getByText('12 / 5 / 4')).toBeInTheDocument();
    expect(screen.getByText('Gols marcados')).toBeInTheDocument();
    expect(screen.getByText('34')).toBeInTheDocument();
    expect(screen.getByText('Gols sofridos')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
    expect(screen.getByText('Saldo de gols')).toBeInTheDocument();
    expect(screen.getByText('14')).toBeInTheDocument();
    expect(screen.getByText('Taxa de vitórias')).toBeInTheDocument();
    expect(screen.getByText('57,1%')).toBeInTheDocument();
    expect(screen.getByText('Jogos sem sofrer gols')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
  });

  it('keeps the filter toolbar visible while a Complete Performance Summary loads', async () => {
    let finishRequest: (() => void) | undefined;
    server.use(http.get('*/matches/statistics', async () => {
      await new Promise<void>((resolve) => { finishRequest = resolve; });
      return HttpResponse.json({ status: 'success', summary });
    }));
    renderMatchStatistics('/estatisticas?ano=2025');

    expect(await screen.findByRole('button', { name: 'Buscar estatísticas' })).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByLabelText('Carregando estatísticas')).toBeInTheDocument();

    finishRequest?.();
    expect(await screen.findByText('21')).toBeInTheDocument();
  });

  it('keeps the usual numeric cards for a Zero-Match Performance Summary', async () => {
    server.use(http.get('*/matches/statistics', () => HttpResponse.json({
      status: 'success',
      summary: {
        matchesPlayed: 0, wins: 0, draws: 0, losses: 0,
        goalsScored: 0, goalsConceded: 0, goalDifference: 0, winRate: 0, cleanSheets: 0,
      },
    })));
    renderMatchStatistics('/estatisticas?ano=2025');

    expect(await screen.findByText('Partidas jogadas')).toBeInTheDocument();
    expect(screen.getByText('0 / 0 / 0')).toBeInTheDocument();
    expect(screen.getByText('0,0%')).toBeInTheDocument();
    expect(screen.getAllByText('0')).toHaveLength(5);
  });

  it('confirms drafted Match Statistics Filters through its own URL without cascading options', async () => {
    renderMatchStatistics('/estatisticas?ano=2025');
    await screen.findByText('21');
    requests.mockReset();

    await userEvent.click(screen.getByRole('combobox', { name: 'Mês' }));
    await userEvent.click(screen.getByText('Janeiro'));
    await userEvent.click(screen.getByRole('button', { name: 'Times' }));
    await userEvent.click(screen.getByText('Grêmio'));
    await userEvent.click(screen.getByRole('combobox', { name: 'Campeonato' }));
    await userEvent.click(screen.getByText('Brasileirão'));

    expect(requests).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('combobox', { name: 'Mês' }));
    expect(screen.getByRole('option', { name: 'Dezembro' })).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    await userEvent.click(screen.getByRole('button', { name: 'Grêmio' }));
    expect(screen.getByText('Juventude')).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    await userEvent.click(screen.getByRole('combobox', { name: 'Campeonato' }));
    expect(screen.getByRole('option', { name: 'Copa do Brasil' })).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');

    await userEvent.click(screen.getByRole('button', { name: 'Buscar estatísticas' }));

    await waitFor(() => {
      expect(screen.getByTestId('location')).toHaveTextContent('/estatisticas?ano=2025&mes=1&campeonato=Brasileir%C3%A3o&time=Gr%C3%AAmio');
    });
    expect(requests).toHaveBeenCalledTimes(1);
  });

  it('clears Match Statistics Filters back to the unfiltered search', async () => {
    renderMatchStatistics('/estatisticas?ano=2025&mes=1&campeonato=Brasileir%C3%A3o&time=Gr%C3%AAmio');
    await screen.findByText('Partidas jogadas');

    await userEvent.click(screen.getByRole('button', { name: 'Limpar filtros' }));

    await waitFor(() => {
      expect(screen.getByTestId('location')).toHaveTextContent('/estatisticas');
    });
  });

  it('removes the Year filter without adding a URL value and restores its placeholder', async () => {
    renderMatchStatistics('/estatisticas?ano=2025');
    await screen.findByText('21');

    await userEvent.click(screen.getByRole('button', { name: 'Limpar Ano' }));
    expect(screen.getByRole('combobox', { name: 'Ano' })).toHaveTextContent('Ano');
    await userEvent.click(screen.getByRole('button', { name: 'Buscar estatísticas' }));

    await waitFor(() => {
      expect(screen.getByTestId('location')).toHaveTextContent('/estatisticas');
    });
    await waitFor(() => {
      expect(requests).toHaveBeenLastCalledWith(expect.objectContaining({ search: '' }));
    });
  });

  it('shows an invalid-link state without retrieving Match Statistics', () => {
    renderMatchStatistics('/estatisticas?ano=invalid');

    expect(screen.getByText('Link de busca inválido.')).toBeInTheDocument();
    expect(requests).not.toHaveBeenCalled();
  });

  it('retries a failed Complete Performance Summary request', async () => {
    let attempts = 0;
    server.use(http.get('*/matches/statistics', () => {
      attempts += 1;
      if (attempts === 1) return new HttpResponse(null, { status: 500 });
      return HttpResponse.json({ status: 'success', summary });
    }));
    renderMatchStatistics('/estatisticas?ano=2025');

    expect(await screen.findByText('Não foi possível carregar as estatísticas.')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    expect(await screen.findByText('21')).toBeInTheDocument();
    expect(attempts).toBe(2);
  });

  it('retries a failed Match Statistics Filter Options request', async () => {
    let attempts = 0;
    server.use(http.get('*/matches/filters', () => {
      attempts += 1;
      if (attempts === 1) return new HttpResponse(null, { status: 500 });
      return HttpResponse.json({
        status: 'success',
        filters: { years: [], months: [], teams: [], leagues: [] },
      });
    }));
    renderMatchStatistics('/estatisticas?ano=2025');

    expect(await screen.findByText('Não foi possível carregar as estatísticas.')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    expect(await screen.findByText('21')).toBeInTheDocument();
    expect(attempts).toBe(2);
  });
});
