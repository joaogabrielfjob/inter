import { MatchStatus } from '../enums/match_status'
import { prisma } from '../lib/prisma'

interface CreateRequest {
  date: Date
  homeTeam: string
  homeScore: number
  homeEmblem: string
  awayTeam: string
  awayScore: number
  awayEmblem: string
  championship: string
  status: MatchStatus
  time?: string
}

export const matchService = {
  upsertMatch: (request: CreateRequest) => {
    const match = prisma.match.upsert({
      where: {
        home_away_date: {
          home: request.homeTeam,
          away: request.awayTeam,
          date: request.date
        }
      },
      update: {
        homeScore: request.homeScore,
        homeEmblem: request.homeEmblem,
        awayScore: request.awayScore,
        awayEmblem: request.awayEmblem,
        status: request.status,
        time: request.time
      },
      create: {
        home: request.homeTeam,
        homeScore: request.homeScore,
        homeEmblem: request.homeEmblem,
        away: request.awayTeam,
        awayScore: request.awayScore,
        awayEmblem: request.awayEmblem,
        date: request.date,
        league: request.championship,
        status: request.status,
        time: request.time
      }
    })

    return match
  }
}