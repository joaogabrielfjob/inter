import { Elysia } from 'elysia'
import { cleanupTeamEmblems } from '../services/team_emblem_cleanup'

export const teamEmblemMaintenanceRoutes = new Elysia()
  .post('/internal/team-emblems/cleanup', async ({ request, set }) => {
    const host = request.headers.get('host') ?? ''
    const token = request.headers.get('x-railway-cron-token')
    if (!host.endsWith('.railway.internal') || !process.env.TEAM_EMBLEM_CLEANUP_TOKEN || token !== process.env.TEAM_EMBLEM_CLEANUP_TOKEN) {
      set.status = 404
      return { status: 'error', message: 'Resource not found' }
    }
    const removed = await cleanupTeamEmblems()
    return { status: 'success', removed }
  })
