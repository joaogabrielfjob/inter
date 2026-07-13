import { MatchStatus } from '../enums/match_status'
import { prisma } from '../lib/prisma'
import { type ScrapedTeam, teamService } from './team_service'

interface CreateRequest {
  date: Date
  homeTeam: ScrapedTeam
  homeScore: number
  awayTeam: ScrapedTeam
  awayScore: number
  championship: string
  status: MatchStatus
  time?: string
  espnMatchId?: number
}

export const matchService = {
  upsertMatch: async (request: CreateRequest) => {
    const [home, away] = await Promise.all([teamService.resolve(request.homeTeam), teamService.resolve(request.awayTeam)])
    const { team: homeTeam } = home
    const { team: awayTeam } = away
    const match = prisma.match.upsert({
      where: {
        homeTeamId_awayTeamId_date: {
          homeTeamId: homeTeam.id,
          awayTeamId: awayTeam.id,
          date: request.date
        }
      },
      update: {
        homeScore: request.homeScore,
        awayScore: request.awayScore,
        homeTeamId: homeTeam.id,
        awayTeamId: awayTeam.id,
        status: request.status,
        time: request.time,
        espnMatchId: request.espnMatchId,
      },
      create: {
        homeScore: request.homeScore,
        awayScore: request.awayScore,
        date: request.date,
        homeTeamId: homeTeam.id,
        awayTeamId: awayTeam.id,
        league: request.championship,
        status: request.status,
        time: request.time,
        espnMatchId: request.espnMatchId,
      }
    })

    return match
  },
}
