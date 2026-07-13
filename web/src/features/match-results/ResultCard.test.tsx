import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { ResultCard } from './ResultCard';

const match = {
  id: 1,
  home: 'Internacional',
  homeScore: 2,
  homeEmblem: 'home.png',
  away: 'Grêmio',
  awayScore: 1,
  awayEmblem: 'away.png',
  matchDay: '2025-04-12',
  league: 'Brasileirão',
  goalSummary: {
    status: 'VERIFIED' as const,
    goals: [
      { scorer: 'Alan Patrick', minute: '12', team: 'HOME' as const },
      { scorer: 'Cristaldo', minute: '45+2', team: 'AWAY' as const, marker: 'P' as const },
      { scorer: 'João', minute: '70', team: 'HOME' as const, marker: 'C' as const },
    ],
  },
};

describe('ResultCard', () => {
  afterEach(cleanup);

  it('flips instantly between the result and its loaded Goal Summary', async () => {
    const user = userEvent.setup();
    render(<ResultCard {...match} />);

    expect(screen.getByText('brasileirão')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Ver gols' }));

    expect(screen.getByText("Alan Patrick — 12'")).toBeVisible();
    expect(screen.getByText("'45+2 — Cristaldo (P)")).toBeVisible();
    expect(screen.getByText("João (C) — 70'")).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Voltar ao resultado' }));
    expect(screen.getByText('brasileirão')).toBeVisible();
  });

  it('explains a verified scoreless result', async () => {
    const user = userEvent.setup();
    render(<ResultCard {...match} homeScore={0} awayScore={0} goalSummary={{ status: 'VERIFIED', goals: [] }} />);

    await user.click(screen.getByRole('button', { name: 'Ver gols' }));

    expect(screen.getByText('Sem gols na partida')).toBeVisible();
  });

  it('explains when the final score has no verified Goal Summary', async () => {
    const user = userEvent.setup();
    render(<ResultCard {...match} goalSummary={{ status: 'UNAVAILABLE', goals: [] }} />);

    await user.click(screen.getByRole('button', { name: 'Ver gols' }));

    expect(screen.getByText('Não foi possível encontrar os gols desta partida')).toBeVisible();
  });

  it('shows the minute mark in goal information', async () => {
    const user = userEvent.setup();
    render(<ResultCard {...match} goalSummary={{ status: 'VERIFIED', goals: [{ scorer: 'Alan Patrick', minute: '12', team: 'HOME' }] }} />);

    await user.click(screen.getByRole('button', { name: 'Ver gols' }));

    expect(screen.getByText("Alan Patrick — 12'")).toBeVisible();
  });
});
