import { beforeEach, describe, expect, it, mock } from 'bun:test'

const upsert = mock()
const findFirst = mock()
const create = mock()
const update = mock()
const resolve = mock()

mock.module('../lib/prisma', () => ({
  prisma: { match: { upsert, findFirst, create, update } },
}))

mock.module('./team_service', () => ({
  teamService: { resolve },
}))

const { matchService } = await import('./match_service')

const originalMatch = {
  date: new Date('2025-04-12T00:00:00.000Z'),
  homeTeam: { name: 'Internacional' },
  homeScore: 1,
  awayTeam: { name: 'Grêmio' },
  awayScore: 0,
  championship: 'Brasileirão',
  status: 'FINISHED' as never,
  time: '16:00',
  espnMatchId: 401234567,
}

beforeEach(() => {
  upsert.mockReset()
  findFirst.mockReset()
  create.mockReset()
  update.mockReset()
  resolve.mockReset()
  resolve.mockResolvedValueOnce({ team: { id: 1 } }).mockResolvedValueOnce({ team: { id: 2 } })
})

describe('matchService.upsertMatch', () => {
  it('uses ESPN Match ID to refresh a completed Match with corrected schedule and Match data', async () => {
    upsert.mockResolvedValue({ id: 1 })

    await matchService.upsertMatch({
      ...originalMatch,
      date: new Date('2025-04-13T00:00:00.000Z'),
      homeTeam: { name: 'Internacional', espnTeamId: 1936 },
      homeScore: 2,
      awayTeam: { name: 'Juventude', espnTeamId: 1940 },
      awayScore: 1,
      championship: 'Copa do Brasil',
      time: '18:30',
    })

    expect(upsert).toHaveBeenCalledWith(expect.objectContaining({
      where: { espnMatchId: 401234567 },
      update: expect.objectContaining({
        date: new Date('2025-04-13T00:00:00.000Z'),
        homeTeamId: 1,
        homeScore: 2,
        awayTeamId: 2,
        awayScore: 1,
        league: 'Copa do Brasil',
        status: 'FINISHED',
        time: '18:30',
        espnMatchId: 401234567,
      }),
    }))
  })

  it('uses ESPN Match ID to refresh an upcoming Fixture after a correction across midnight', async () => {
    upsert.mockResolvedValue({ id: 1 })

    await matchService.upsertMatch({
      ...originalMatch,
      date: new Date('2025-04-13T00:00:00.000Z'),
      status: 'UPCOMING' as never,
      time: '00:30',
    })

    expect(upsert).toHaveBeenCalledWith(expect.objectContaining({
      where: { espnMatchId: 401234567 },
      update: expect.objectContaining({
        date: new Date('2025-04-13T00:00:00.000Z'),
        status: 'UPCOMING',
        time: '00:30',
      }),
    }))
  })

  it('falls back to an unidentified Match with the same Teams and Match Day only without an ESPN Match ID', async () => {
    findFirst.mockResolvedValue({ id: 1 })
    update.mockResolvedValue({ id: 1 })

    await matchService.upsertMatch({ ...originalMatch, espnMatchId: undefined })

    expect(findFirst).toHaveBeenCalledWith({
      where: {
        homeTeamId: 1,
        awayTeamId: 2,
        date: originalMatch.date,
        espnMatchId: null,
      },
    })
    expect(update).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 1 } }))
    expect(upsert).not.toHaveBeenCalled()
  })
})
