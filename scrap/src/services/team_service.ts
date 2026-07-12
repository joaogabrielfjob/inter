import { prisma } from '../lib/prisma'
import { TeamEmblemStorage } from './team_emblem_storage'

export type ScrapedTeam = {
  name: string
  espnTeamId?: number
  emblemUrl?: string
}

const storage = new TeamEmblemStorage()

export const teamService = {
  async resolve(input: ScrapedTeam) {
    const team = await findTeam(input)
    const resolved = team ?? await prisma.team.create({
      data: { name: input.name, espnTeamId: input.espnTeamId },
    })

    if (team && (team.name !== input.name || (!team.espnTeamId && input.espnTeamId))) {
      await prisma.team.update({
        where: { id: team.id },
        data: {
          name: input.name,
          espnTeamId: team.espnTeamId ?? input.espnTeamId,
          aliases: team.name === input.name ? undefined : { push: team.name },
        },
      })
      resolved.name = input.name
      resolved.espnTeamId ??= input.espnTeamId ?? null
    }

    const emblemRetained = input.emblemUrl ? await refreshEmblem(resolved.id, input.emblemUrl) : undefined
    return { team: resolved, emblemRetained }
  },
}

async function findTeam(input: ScrapedTeam) {
  if (input.espnTeamId) {
    const byEspnId = await prisma.team.findUnique({ where: { espnTeamId: input.espnTeamId } })
    return byEspnId
  }

  const team = await prisma.team.findFirst({
    where: { OR: [{ name: { equals: input.name, mode: 'insensitive' } }, { aliases: { has: input.name } }] },
  })
  if (!input.espnTeamId) console.warn(`ESPN Team ID unavailable; used name/alias fallback for ${input.name}`)
  return team
}

async function refreshEmblem(teamId: number, sourceUrl: string): Promise<boolean> {
  const current = await prisma.teamEmblem.findFirst({ where: { teamId, isCurrent: true } })
  try {
    const response = await fetch(sourceUrl)
    if (!response.ok) throw new Error(`download returned ${response.status}`)
    const mimeType = response.headers.get('content-type')?.split(';')[0] ?? 'image/png'
    if (!mimeType.startsWith('image/')) throw new Error(`unexpected emblem content type ${mimeType}`)
    const retained = await storage.retain(new Uint8Array(await response.arrayBuffer()), mimeType, current ?? undefined, String(teamId))
    if (current?.contentHash === retained.contentHash) return true

    await prisma.$transaction([
      prisma.teamEmblem.updateMany({ where: { teamId, isCurrent: true }, data: { isCurrent: false, replacedAt: new Date() } }),
      prisma.teamEmblem.create({ data: { teamId, ...retained } }),
    ])
    return true
  } catch (error) {
    console.warn(`Could not refresh Team Emblem for team ${teamId}; keeping the last known-good emblem`, error)
    return false
  }
}

export const teamEmblemRefresh = { refreshEmblem }
