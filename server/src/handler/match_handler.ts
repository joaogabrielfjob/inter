import type { MatchStatus } from '../enums/match_status'
import { matchService } from '../services/match_service'
import type { Combo } from '../common/combo'

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
    const matches = await matchService.getMatches(params)

    return {
      status: 'success',
      matches: matches
    }
  },
  filters: async () => {
    const filters = await matchService.filters()

    const teams: Combo[] = []
    const leagues: Combo[] = []

    for (const { team } of filters.teams) {
      teams.push({ value: team, label: team})
    }

    for (const { league } of filters.leagues) {
      leagues.push({ value: league, label: league})
    }

    return {
      status: 'success',
      filters: {
        teams,
        leagues
      }
    }
  }
}