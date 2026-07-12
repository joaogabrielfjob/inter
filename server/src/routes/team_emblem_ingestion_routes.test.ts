import { beforeEach, describe, expect, it, mock } from 'bun:test'

const findFirst = mock()
const updateMany = mock()
const update = mock()
const create = mock()
const transaction = mock(async (operations: Promise<unknown>[]) => await Promise.all(operations))
const retain = mock()

mock.module('../lib/prisma', () => ({
  prisma: { teamEmblem: { findFirst, updateMany, update, create }, $transaction: transaction },
}))

mock.module('../services/team_emblem_storage', () => ({
  TeamEmblemStorage: class { retain = retain },
}))

const { teamEmblemIngestionRoutes } = await import('./team_emblem_ingestion_routes')

beforeEach(() => {
  process.env.TEAM_EMBLEM_TOKEN = 'test-token'
  findFirst.mockReset()
  updateMany.mockReset()
  update.mockReset()
  create.mockReset()
  transaction.mockClear()
  retain.mockReset()
})

describe('teamEmblemIngestionRoutes', () => {
  it('reactivates a previously retained Team Emblem instead of creating the same path twice', async () => {
    const current = { id: 1, path: '/team-emblems/2-current.png', contentHash: 'current' }
    const previous = {
      id: 2,
      teamId: 2,
      path: '/team-emblems/2-previous.png',
      contentHash: 'previous',
      mimeType: 'image/png',
      isCurrent: false,
      replacedAt: new Date('2026-07-12T00:00:00Z'),
    }
    findFirst.mockResolvedValueOnce(current).mockResolvedValueOnce(previous)
    retain.mockResolvedValue({ path: previous.path, contentHash: previous.contentHash, mimeType: previous.mimeType })
    updateMany.mockResolvedValue(undefined)
    update.mockResolvedValue(undefined)

    const response = await teamEmblemIngestionRoutes.handle(new Request('http://localhost/internal/teams/2/emblem', {
      method: 'POST',
      headers: { 'content-type': 'image/png', 'x-team-emblem-ingest-token': 'test-token' },
      body: 'emblem',
    }))

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ status: 'success', retained: true })
    expect(create).not.toHaveBeenCalled()
    expect(update).toHaveBeenCalledWith({
      where: { id: previous.id },
      data: { teamId: 2, path: previous.path, contentHash: previous.contentHash, mimeType: previous.mimeType, isCurrent: true, replacedAt: null },
    })
  })
})
