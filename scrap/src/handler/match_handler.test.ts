import { beforeEach, describe, expect, it, mock, spyOn } from 'bun:test'

const upsertMatch = mock()
mock.module('../services/match_service', () => ({
  matchService: { upsertMatch },
}))

const { ingestUpcomingMatches } = await import('./match_handler')

const fixture = {
  date: '12 abr. 2025',
  home: 'Internacional',
  homeLink: 'https://www.espn.com.br/futebol/time/_/id/1936',
  away: 'Grêmio',
  awayLink: 'https://www.espn.com.br/futebol/time/_/id/627',
  time: '23:30',
  league: 'Brasileirão',
}

beforeEach(() => {
  upsertMatch.mockReset()
  upsertMatch.mockResolvedValue({ id: 1 })
})

describe('ingestUpcomingMatches', () => {
  it('supplies the explicit ESPN Match ID from a calendar Match link', async () => {
    await ingestUpcomingMatches([{
      ...fixture,
      matchLink: 'https://www.espn.com.br/futebol/partida/_/jogoId/401234567/internacional-gremio',
    }])

    expect(upsertMatch).toHaveBeenCalledWith(expect.objectContaining({
      espnMatchId: 401234567,
      status: 'UPCOMING',
      time: '23:30',
    }))
  })

  it('uses no guessed identity and reports a calendar Fixture with no Match link', async () => {
    const consoleWarn = spyOn(console, 'warn').mockImplementation(() => undefined)

    await ingestUpcomingMatches([fixture])

    expect(upsertMatch).toHaveBeenCalledWith(expect.objectContaining({ espnMatchId: undefined }))
    expect(consoleWarn).toHaveBeenCalledWith(expect.stringContaining('used date fallback for upcoming Fixture'))
    consoleWarn.mockRestore()
  })
})
