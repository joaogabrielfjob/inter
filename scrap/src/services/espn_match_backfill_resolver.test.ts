import { describe, expect, it } from 'bun:test'
import { resolveEspnMatchIdFromFinishedRows } from './espn_match_backfill_resolver'

const match = {
  id: 7,
  homeScore: 1,
  awayScore: 0,
  date: new Date(Date.UTC(2024, 10, 30)),
  homeTeamName: 'Internacional',
  awayTeamName: 'Flamengo',
}

describe('resolveEspnMatchIdFromFinishedRows', () => {
  it('uses the explicit ESPN Match link from the uniquely matching completed-result row', () => {
    expect(resolveEspnMatchIdFromFinishedRows(match, [{
      date: '30 nov.', home: 'Internacional', homeScore: 1, away: 'Flamengo', awayScore: 0,
      matchLink: 'https://www.espn.com.br/futebol/partida/_/jogoId/401234567',
    }], 2024)).toBe(401234567)
  })

  it('does not assign an ID when the historical row cannot be uniquely verified', () => {
    const row = {
      date: '30 nov.', home: 'Internacional', homeScore: 1, away: 'Flamengo', awayScore: 0,
      matchLink: 'https://www.espn.com.br/futebol/partida/_/jogoId/401234567',
    }
    expect(resolveEspnMatchIdFromFinishedRows(match, [row, { ...row, matchLink: row.matchLink.replace('567', '568') }], 2024)).toBeUndefined()
  })
})
