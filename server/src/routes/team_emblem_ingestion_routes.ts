import { Elysia } from 'elysia'
import { prisma } from '../lib/prisma'
import { TeamEmblemStorage } from '../services/team_emblem_storage'

const storage = new TeamEmblemStorage()

export const teamEmblemIngestionRoutes = new Elysia()
  .post('/internal/teams/:teamId/emblem', async ({ params, request, set }) => {
    const token = request.headers.get('x-team-emblem-ingest-token')
    const mimeType = request.headers.get('content-type')?.split(';')[0] ?? ''
    const teamId = Number(params.teamId)

    if (!process.env.TEAM_EMBLEM_TOKEN || token !== process.env.TEAM_EMBLEM_TOKEN) {
      set.status = 404
      return { status: 'error', message: 'Resource not found' }
    }
    if (!Number.isSafeInteger(teamId) || teamId < 1 || !mimeType.startsWith('image/')) {
      set.status = 400
      return { status: 'error', message: 'Invalid Team Emblem upload' }
    }

    const current = await prisma.teamEmblem.findFirst({ where: { teamId, isCurrent: true } })
    const retained = await storage.retain(new Uint8Array(await request.arrayBuffer()), mimeType, current ?? undefined, String(teamId))
    if (current?.contentHash === retained.contentHash) return { status: 'success', retained: false }

    await prisma.$transaction([
      prisma.teamEmblem.updateMany({ where: { teamId, isCurrent: true }, data: { isCurrent: false, replacedAt: new Date() } }),
      prisma.teamEmblem.create({ data: { teamId, ...retained } }),
    ])
    return { status: 'success', retained: true }
  })
