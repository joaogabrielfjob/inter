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
    const data = {
      homeScore: request.homeScore,
      awayScore: request.awayScore,
      date: request.date,
      homeTeamId: homeTeam.id,
      awayTeamId: awayTeam.id,
      league: request.championship,
      status: request.status,
      time: request.time,
    }

    if (request.espnMatchId !== undefined) {
      return prisma.match.upsert({
        where: { espnMatchId: request.espnMatchId },
        update: { ...data, espnMatchId: request.espnMatchId },
        create: { ...data, espnMatchId: request.espnMatchId },
      })
    }

    const existing = await prisma.match.findFirst({
      where: {
        homeTeamId: homeTeam.id,
        awayTeamId: awayTeam.id,
        date: request.date,
        espnMatchId: null,
      },
    })
    return existing
      ? prisma.match.update({ where: { id: existing.id }, data })
      : prisma.match.create({ data })
  },
}
