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
    const { team, alreadyExisted } = await findOrCreateTeam(input)

    if (alreadyExisted && (team.name !== input.name || (!team.espnTeamId && input.espnTeamId))) {
      await prisma.team.update({
        where: { id: team.id },
        data: {
          name: input.name,
          espnTeamId: team.espnTeamId ?? input.espnTeamId,
          aliases: team.name === input.name ? undefined : { push: team.name },
        },
      })
      team.name = input.name
      team.espnTeamId ??= input.espnTeamId ?? null
    }

    const emblemRetained = input.emblemUrl ? await refreshEmblem(team.id, input.emblemUrl) : undefined
    return { team, emblemRetained }
  },
}

async function findOrCreateTeam(input: ScrapedTeam) {
  const existing = await findTeam(input)
  if (existing) return { team: existing, alreadyExisted: true }

  try {
    return {
      team: await prisma.team.create({ data: { name: input.name, espnTeamId: input.espnTeamId } }),
      alreadyExisted: false,
    }
  } catch (error) {
    if (!isUniqueConstraintViolation(error)) throw error

    const concurrent = await findTeam(input)
    if (!concurrent) throw error
    return { team: concurrent, alreadyExisted: true }
  }
}

async function findTeam(input: ScrapedTeam) {
  if (input.espnTeamId) {
    const byEspnId = await prisma.team.findUnique({ where: { espnTeamId: input.espnTeamId } })
    if (byEspnId) return byEspnId
  }

  const team = await prisma.team.findFirst({
    where: { OR: [{ name: { equals: input.name, mode: 'insensitive' } }, { aliases: { has: input.name } }] },
  })
  if (!input.espnTeamId) console.warn(`ESPN Team ID unavailable; used name/alias fallback for ${input.name}`)
  return team
}

function isUniqueConstraintViolation(error: unknown): boolean {
  return typeof error === 'object' && error !== null && (error as { code?: unknown }).code === 'P2002'
}

async function refreshEmblem(teamId: number, sourceUrl: string): Promise<boolean> {
  try {
    const response = await fetch(sourceUrl)
    if (!response.ok) throw new Error(`download returned ${response.status}`)
    const mimeType = response.headers.get('content-type')?.split(';')[0] ?? 'image/png'
    if (!mimeType.startsWith('image/')) throw new Error(`unexpected emblem content type ${mimeType}`)
    const content = new Uint8Array(await response.arrayBuffer())
    return process.env.INTER_SERVER_URL
      ? await retainWithServer(teamId, content, mimeType)
      : await retainLocally(teamId, content, mimeType)
  } catch (error) {
    console.warn(`Could not refresh Team Emblem for team ${teamId}; keeping the last known-good emblem`, error)
    return false
  }
}

async function retainWithServer(teamId: number, content: Uint8Array, mimeType: string): Promise<boolean> {
  if (!process.env.TEAM_EMBLEM_TOKEN) throw new Error('TEAM_EMBLEM_TOKEN is required when INTER_SERVER_URL is configured')
  const response = await fetch(`${process.env.INTER_SERVER_URL}/internal/teams/${teamId}/emblem`, {
    method: 'POST',
    headers: {
      'content-type': mimeType,
      'x-team-emblem-ingest-token': process.env.TEAM_EMBLEM_TOKEN,
    },
    body: content.buffer as ArrayBuffer,
  })
  if (!response.ok) throw new Error(`server retention returned ${response.status}`)
  return true
}

async function retainLocally(teamId: number, content: Uint8Array, mimeType: string): Promise<boolean> {
  const current = await prisma.teamEmblem.findFirst({ where: { teamId, isCurrent: true } })
  const retained = await storage.retain(content, mimeType, current ?? undefined, String(teamId))
  if (current?.contentHash === retained.contentHash) return true

  await prisma.$transaction([
    prisma.teamEmblem.updateMany({ where: { teamId, isCurrent: true }, data: { isCurrent: false, replacedAt: new Date() } }),
    prisma.teamEmblem.create({ data: { teamId, ...retained } }),
  ])
  return true
}

export const teamEmblemRefresh = { refreshEmblem }
