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
  it('returns browser-facing Matches without persistence names or status', async () => {
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
      }],
    })
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
          { value: '1', label: 'Jan' }, { value: '2', label: 'Fev' }, { value: '3', label: 'Mar' },
          { value: '4', label: 'Abr' }, { value: '5', label: 'Mai' }, { value: '6', label: 'Jun' },
          { value: '7', label: 'Jul' }, { value: '8', label: 'Ago' }, { value: '9', label: 'Set' },
          { value: '10', label: 'Out' }, { value: '11', label: 'Nov' }, { value: '12', label: 'Dez' },
        ],
        teams: [{ value: 'Internacional', label: 'Internacional' }],
        leagues: [{ value: 'Brasileirão', label: 'Brasileirão' }],
      },
    })
  })
})
