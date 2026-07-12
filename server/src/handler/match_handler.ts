import type { MatchStatus } from '../enums/match_status'
import { matchReadService } from '../services/match_read_service'

interface schema {
  status: MatchStatus
  order: 'ASC' | 'DESC'

  year?: string
  month?: string
  league?: string
  team?: string
}

export const matchHandler = {
  getMatches: async (params: schema) => {
    const matches = await matchReadService.list(params)

    return {
      status: 'success',
      matches: matches
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
