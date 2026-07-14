import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'

const queryRaw = mock()
const findMany = mock()

mock.module('../lib/prisma', () => ({
  prisma: {
    $queryRaw: queryRaw,
    match: { findMany },
  },
}))

const { matchRoutes } = await import('./match_routes')

const databaseMatch = {
  id: 1,
  homeScore: 2,
  awayScore: 1,
  home_team_name: 'Sport Club Internacional',
  away_team_name: 'Grêmio Foot-Ball Porto Alegrense',
  home_emblem_path: '/team-emblems/home-hash.png',
  away_emblem_path: '/team-emblems/away-hash.png',
  date: new Date('2025-04-12T00:00:00.000Z'),
  league: 'Brasileirão',
  status: 'FINISHED',
  time: null,
  espnMatchId: 401234567,
  goal_summary_status: 'VERIFIED',
  goals: [
    { scorer: 'Alan Patrick', minute: '12', team: 'HOME', marker: null },
    { scorer: 'Cristaldo', minute: '45+2', team: 'AWAY', marker: 'P' },
  ],
}

beforeEach(() => {
  queryRaw.mockReset()
  findMany.mockReset()
})

afterEach(() => {
  queryRaw.mockReset()
  findMany.mockReset()
})

describe('Match routes', () => {
  it('returns browser-facing Match Results with goal summaries but no ESPN identity', async () => {
    queryRaw.mockResolvedValue([databaseMatch])

    const response = await matchRoutes.handle(new Request('http://localhost/matches?status=FINISHED&order=DESC'))

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({
      status: 'success',
      matches: [{
        id: 1,
        home: 'Sport Club Internacional',
        homeScore: 2,
        homeEmblem: '/team-emblems/home-hash.png',
        away: 'Grêmio Foot-Ball Porto Alegrense',
        awayScore: 1,
        awayEmblem: '/team-emblems/away-hash.png',
        matchDay: '2025-04-12',
        league: 'Brasileirão',
        goalSummary: {
          status: 'VERIFIED',
          goals: [
            { scorer: 'Alan Patrick', minute: '12', team: 'HOME' },
            { scorer: 'Cristaldo', minute: '45+2', team: 'AWAY', marker: 'P' },
          ],
        },
      }],
    })
  })

  it('returns verified scoreless and unavailable Goal Summaries distinctly', async () => {
    queryRaw.mockResolvedValue([
      { ...databaseMatch, id: 1, homeScore: 0, awayScore: 0, goals: [] },
      { ...databaseMatch, id: 2, goal_summary_status: 'UNAVAILABLE', goals: [] },
    ])

    const response = await matchRoutes.handle(new Request('http://localhost/matches?status=FINISHED&order=DESC'))

    expect(await response.json()).toMatchObject({
      status: 'success',
      matches: [
        { id: 1, goalSummary: { status: 'VERIFIED', goals: [] } },
        { id: 2, goalSummary: { status: 'UNAVAILABLE', goals: [] } },
      ],
    })
  })

  it('continues a Match Results search with a cursor after a twenty-Match batch', async () => {
    const firstBatch = Array.from({ length: 21 }, (_, index) => ({
      ...databaseMatch,
      id: index + 1,
      date: new Date(`2025-04-${String(30 - index).padStart(2, '0')}T00:00:00.000Z`),
    }))
    queryRaw.mockResolvedValueOnce(firstBatch).mockResolvedValueOnce([{ ...databaseMatch, id: 22 }])

    const firstResponse = await matchRoutes.handle(new Request('http://localhost/matches?status=FINISHED&order=DESC'))
    const firstPage = await firstResponse.json() as { matches: { id: number }[]; nextCursor?: string }

    expect(firstPage.matches).toHaveLength(20)
    expect(firstPage.matches.at(-1)).toMatchObject({ id: 20 })
    expect(firstPage.nextCursor).toEqual(expect.any(String))

    const nextResponse = await matchRoutes.handle(new Request(`http://localhost/matches?status=FINISHED&order=DESC&cursor=${firstPage.nextCursor}`))

    expect(await nextResponse.json()).toMatchObject({
      status: 'success',
      matches: [expect.objectContaining({ id: 22 })],
    })
  })

  it('does not limit upcoming Matches to Match Results batch size', async () => {
    queryRaw.mockResolvedValue(Array.from({ length: 21 }, (_, index) => ({ ...databaseMatch, id: index + 1 })))

    const response = await matchRoutes.handle(new Request('http://localhost/matches?status=UPCOMING&order=ASC'))
    const page = await response.json() as { matches: unknown[]; nextCursor?: string }

    expect(page.matches).toHaveLength(21)
    expect(page.nextCursor).toBeUndefined()
  })

  it('rejects a malformed month before reading Matches', async () => {
    const response = await matchRoutes.handle(new Request('http://localhost/matches?status=FINISHED&order=DESC&month=banana'))

    expect(response.status).toBe(422)
    expect(queryRaw).not.toHaveBeenCalled()
  })

  it('returns an empty Match collection for a well-formed search with no Matches', async () => {
    queryRaw.mockResolvedValue([])

    const response = await matchRoutes.handle(new Request('http://localhost/matches?status=FINISHED&order=DESC&team=Unknown'))

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ status: 'success', matches: [] })
  })

  it('returns the finished-Match filter catalogue', async () => {
    queryRaw.mockResolvedValueOnce([{ year: '2025' }]).mockResolvedValueOnce([{ team: 'Internacional' }])
    findMany.mockResolvedValue([{ league: 'Brasileirão' }])

    const response = await matchRoutes.handle(new Request('http://localhost/matches/filters'))

    expect(await response.json()).toEqual({
      status: 'success',
      filters: {
        years: [{ value: '2025', label: '2025' }],
        months: [
          { value: '1', label: 'Janeiro' }, { value: '2', label: 'Fevereiro' }, { value: '3', label: 'Março' },
          { value: '4', label: 'Abril' }, { value: '5', label: 'Maio' }, { value: '6', label: 'Junho' },
          { value: '7', label: 'Julho' }, { value: '8', label: 'Agosto' }, { value: '9', label: 'Setembro' },
          { value: '10', label: 'Outubro' }, { value: '11', label: 'Novembro' }, { value: '12', label: 'Dezembro' },
        ],
        teams: [{ value: 'Internacional', label: 'Internacional' }],
        leagues: [{ value: 'Brasileirão', label: 'Brasileirão' }],
      },
    })
  })
})
