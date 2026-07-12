import { prisma } from '../lib/prisma'
import { TeamEmblemStorage } from './team_emblem_storage'

const retentionMs = 7 * 24 * 60 * 60 * 1000

export type SupersededEmblem = { id: number; path: string; replacedAt: Date | null }

export async function removeSupersededEmblems(
  emblems: SupersededEmblem[],
  removeFile: (path: string) => Promise<void>,
  removeMetadata: (id: number) => Promise<unknown>,
  now = new Date(),
): Promise<number> {
  let removed = 0
  for (const emblem of emblems) {
    if (!emblem.replacedAt || now.getTime() - emblem.replacedAt.getTime() <= retentionMs) continue
    try {
      await removeFile(emblem.path)
      await removeMetadata(emblem.id)
      removed += 1
    } catch (error) {
      console.error(`Could not remove superseded Team Emblem ${emblem.id}`, error)
    }
  }
  return removed
}

export async function cleanupTeamEmblems() {
  const storage = new TeamEmblemStorage()
  const emblems = await prisma.teamEmblem.findMany({ where: { isCurrent: false }, select: { id: true, path: true, replacedAt: true } })
  return removeSupersededEmblems(emblems, (path) => storage.remove(path), (id) => prisma.teamEmblem.delete({ where: { id } }))
}
