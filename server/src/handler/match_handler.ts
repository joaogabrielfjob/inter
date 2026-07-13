import type { MatchStatus } from '../enums/match_status'
import { matchReadService } from '../services/match_read_service'

interface schema {
  status: MatchStatus
  order: 'ASC' | 'DESC'
  cursor?: string

  year?: string
  month?: string
  league?: string
  team?: string
}

export const matchHandler = {
  getMatches: async (params: schema) => {
    const page = await matchReadService.list(params)

    return {
      status: 'success',
      ...page,
    }
  },
  filters: async () => {
    const filters = await matchReadService.matchResultsFilterCatalogue()

    return {
      status: 'success',
      filters: {
        ...filters,
      }
    }
  }
}
