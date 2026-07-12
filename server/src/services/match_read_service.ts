import { Prisma, type Match } from '@prisma/client'
import type { Combo } from '../common/combo'
import { MatchStatus } from '../enums/match_status'
import { prisma } from '../lib/prisma'

export type MatchRead = {
  id: number
  home: string
  homeScore: number
  homeEmblem: string
  away: string
  awayScore: number
  awayEmblem: string
  matchDay: string
  league: string
  kickoffTime?: string
}

export type MatchReadQuery = {
  status: MatchStatus
  order: 'ASC' | 'DESC'
  year?: string
  month?: string
  league?: string
  team?: string
}

export type MatchResultsFilterCatalogue = {
  years: Combo[]
  months: Combo[]
  teams: Combo[]
  leagues: Combo[]
}

const months: Combo[] = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
].map((label, index) => ({ value: String(index + 1), label }))

export const matchReadService = {
  list: async ({ status, order, year, month, league, team }: MatchReadQuery): Promise<MatchRead[]> => {
    const where = conditions(status, year, month, league, team)
    const query = Prisma.sql`SELECT * FROM match ${where} ORDER BY date ${Prisma.raw(order)}`
    const matches = await prisma.$queryRaw<Match[]>(query)

    return matches.map(toMatchRead)
  },
  matchResultsFilterCatalogue: async (): Promise<MatchResultsFilterCatalogue> => {
    const [years, teams, leagues] = await Promise.all([
      prisma.$queryRaw<{ year: string }[]>`
        SELECT DISTINCT EXTRACT(YEAR FROM date)::text AS year
        FROM match
        WHERE status = ${MatchStatus.FINISHED}
        ORDER BY year DESC
      `,
      prisma.$queryRaw<{ team: string }[]>`
        SELECT DISTINCT home AS team FROM match WHERE status = ${MatchStatus.FINISHED}
        UNION
        SELECT DISTINCT away AS team FROM match WHERE status = ${MatchStatus.FINISHED}
        ORDER BY team ASC
      `,
      prisma.match.findMany({
        where: { status: MatchStatus.FINISHED },
        select: { league: true },
        distinct: ['league'],
        orderBy: { league: 'asc' },
      }),
    ])

    return {
      years: years.map(({ year }) => ({ value: year, label: year })),
      months,
      teams: teams.map(({ team }) => ({ value: team, label: team })),
      leagues: leagues.map(({ league }) => ({ value: league, label: league })),
    }
  },
}

function toMatchRead(match: Match): MatchRead {
  return {
    id: match.id,
    home: match.home,
    homeScore: match.homeScore,
    homeEmblem: match.homeEmblem,
    away: match.away,
    awayScore: match.awayScore,
    awayEmblem: match.awayEmblem,
    matchDay: match.date.toISOString().slice(0, 10),
    league: match.league,
    ...(match.time ? { kickoffTime: match.time } : {}),
  }
}

function conditions(status: MatchStatus, year?: string, month?: string, league?: string, team?: string): Prisma.Sql {
  const filters: Prisma.Sql[] = [Prisma.sql`status = ${status}`]

  if (year) filters.push(Prisma.sql`EXTRACT(YEAR FROM date) = ${year}::integer`)
  if (month) filters.push(Prisma.sql`EXTRACT(MONTH FROM date) = ${month}::integer`)
  if (league) filters.push(Prisma.sql`UPPER(UNACCENT(league)) = UPPER(UNACCENT(${league}))`)
  if (team) filters.push(Prisma.sql`(UPPER(UNACCENT(home)) = UPPER(UNACCENT(${team})) OR UPPER(UNACCENT(away)) = UPPER(UNACCENT(${team})))`)

  return Prisma.sql`WHERE ${Prisma.join(filters, ' AND ')}`
}
