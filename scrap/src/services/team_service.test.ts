import { beforeEach, describe, expect, it, mock } from 'bun:test'

const findUnique = mock()
const findFirst = mock()
const create = mock()
const update = mock()

mock.module('../lib/prisma', () => ({
  prisma: { team: { findUnique, findFirst, create, update } },
}))

const { teamService } = await import('./team_service')

const legacyTeam = { id: 7, name: 'Internacional', espnTeamId: null, aliases: [] }

beforeEach(() => {
  findUnique.mockReset()
  findFirst.mockReset()
  create.mockReset()
  update.mockReset()
})

describe('teamService.resolve', () => {
  it('matches an existing Team by name when its ESPN Team ID has not been recorded yet', async () => {
    findUnique.mockResolvedValue(null)
    findFirst.mockResolvedValue(legacyTeam)
    create.mockRejectedValue({ code: 'P2002' })
    update.mockResolvedValue(undefined)

    await expect(teamService.resolve({ name: 'Internacional', espnTeamId: 123 })).resolves.toMatchObject({ team: { id: 7 } })

    expect(create).not.toHaveBeenCalled()
    expect(update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 7 },
      data: expect.objectContaining({ espnTeamId: 123 }),
    }))
  })

  it('reuses a Team created concurrently after a unique-constraint collision', async () => {
    const concurrentTeam = { id: 8, name: 'Grêmio', espnTeamId: 456, aliases: [] }
    findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce(concurrentTeam)
    findFirst.mockResolvedValue(null)
    create.mockRejectedValue({ code: 'P2002' })

    await expect(teamService.resolve({ name: 'Grêmio', espnTeamId: 456 })).resolves.toMatchObject({ team: { id: 8 } })
  })
})
