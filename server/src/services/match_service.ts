import { Prisma, type Match } from '@prisma/client'
import type { MatchStatus } from '../enums/match_status'
import { prisma } from '../lib/prisma'

interface schema {
  status: MatchStatus
  order: 'ASC' | 'DESC'
  
  year?: string
  month?: string
  league?: string
  team?: string
}

export const matchService = {
  getMatches: async ({ status, order, year, month, league, team }: schema) => {
    const where = conditions(status, year, month, league, team)
    
    const query = Prisma.sql`SELECT * FROM match ${where} ORDER BY date ${Prisma.raw(order)}`

    return await prisma.$queryRaw<Match[]>(query)
  },
  filters: async () => {
    const [teams, leagues] = await Promise.all([
      prisma.$queryRaw<{ team: string }[]>`
        SELECT DISTINCT home AS team FROM Match
        UNION
        SELECT DISTINCT away AS team FROM Match
        ORDER BY team ASC
      `,
      prisma.match.findMany({
        select: { league: true },
        distinct: ['league'],
        orderBy: { league: 'asc' }
      })
    ])
    return { teams, leagues }
  }
}

const conditions = (status: string, year?: string, month?: string, league?: string, team?: string) => {
  const conditions: Prisma.Sql[] = []

  const byStatus = Prisma.sql`status = ${status}`
  const byYear = Prisma.sql`EXTRACT(YEAR FROM date) = ${year}::integer`
  const byMonth = Prisma.sql`EXTRACT(MONTH FROM date) = ${month}::integer`
  const byLeague = Prisma.sql`UPPER(UNACCENT(league)) = UPPER(UNACCENT(${league}))`
  const byTeam = Prisma.sql`(UPPER(UNACCENT(home)) = UPPER(UNACCENT(${team})) OR UPPER(UNACCENT(away)) = UPPER(UNACCENT(${team})))`
  
  conditions.push(byStatus)

  if (year) conditions.push(byYear)

  if (month) conditions.push(byMonth)

  if (league) conditions.push(byLeague)

  if (team) conditions.push(byTeam)

  return conditions.length ? Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}` : Prisma.empty
}