import { describe, expect, it } from 'bun:test'
import { removeSupersededEmblems } from './team_emblem_cleanup'

describe('removeSupersededEmblems', () => {
  it('deletes only old superseded assets and their metadata after deleting the file', async () => {
    const calls: string[] = []
    const now = new Date('2026-07-12T12:00:00Z')
    const removed = await removeSupersededEmblems([
      { id: 1, path: '/team-emblems/current.png', replacedAt: null },
      { id: 2, path: '/team-emblems/recent.png', replacedAt: new Date('2026-07-06T12:00:00Z') },
      { id: 3, path: '/team-emblems/old.png', replacedAt: new Date('2026-07-05T11:59:59Z') },
    ], async (path) => { calls.push(`file:${path}`) }, async (id) => { calls.push(`metadata:${id}`) }, now)

    expect(removed).toBe(1)
    expect(calls).toEqual(['file:/team-emblems/old.png', 'metadata:3'])
  })

  it('keeps metadata when file deletion fails', async () => {
    const deleted: number[] = []
    await removeSupersededEmblems(
      [{ id: 3, path: '/team-emblems/old.png', replacedAt: new Date('2026-07-01T00:00:00Z') }],
      async () => { throw new Error('volume unavailable') },
      async (id) => { deleted.push(id) },
      new Date('2026-07-12T12:00:00Z'),
    )
    expect(deleted).toEqual([])
  })
})
