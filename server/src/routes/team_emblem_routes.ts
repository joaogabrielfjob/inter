import { Elysia } from 'elysia'
import { TeamEmblemStorage } from '../services/team_emblem_storage'

const storage = new TeamEmblemStorage()

export const teamEmblemRoutes = new Elysia()
  .get('/team-emblems/:filename', ({ params, set }) => {
    const file = storage.file(`/team-emblems/${params.filename}`)
    if (!file || file.size === 0) {
      set.status = 404
      return { status: 'error', message: 'Team Emblem not found' }
    }
    return file
  })
