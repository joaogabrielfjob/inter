import { Prisma } from '@prisma/client'
import type { Combo } from '../common/combo'
import { MatchStatus } from '../enums/match_status'
import { prisma } from '../lib/prisma'

export type MatchRead = {
  id: number
  home: string
  homeScore: number
  homeEmblem?: string
  away: string
  awayScore: number
  awayEmblem?: string
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
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
].map((label, index) => ({ value: String(index + 1), label }))

export const matchReadService = {
  list: async ({ status, order, year, month, league, team }: MatchReadQuery): Promise<MatchRead[]> => {
    const where = conditions(status, year, month, league, team)
    const query = Prisma.sql`
      SELECT match.id, match.home_score AS "homeScore", match.away_score AS "awayScore", match.date, match.league, match.time,
        home_team.name AS home_team_name, away_team.name AS away_team_name,
        home_emblem.path AS home_emblem_path, away_emblem.path AS away_emblem_path
      FROM match
      LEFT JOIN team AS home_team ON home_team.id = match.home_team_id
      LEFT JOIN team AS away_team ON away_team.id = match.away_team_id
      LEFT JOIN team_emblem AS home_emblem ON home_emblem.team_id = home_team.id AND home_emblem.is_current = true
      LEFT JOIN team_emblem AS away_emblem ON away_emblem.team_id = away_team.id AND away_emblem.is_current = true
      ${where} ORDER BY match.date ${Prisma.raw(order)}`
    const matches = await prisma.$queryRaw<MatchRow[]>(query)

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
        SELECT DISTINCT home_team.name AS team
        FROM match LEFT JOIN team AS home_team ON home_team.id = match.home_team_id
        WHERE status = ${MatchStatus.FINISHED}
        UNION
        SELECT DISTINCT away_team.name AS team
        FROM match LEFT JOIN team AS away_team ON away_team.id = match.away_team_id
        WHERE status = ${MatchStatus.FINISHED}
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

type MatchRow = {
  id: number; homeScore: number; awayScore: number
  date: Date; league: string; time: string | null
  home_team_name: string | null; away_team_name: string | null
  home_emblem_path: string | null; away_emblem_path: string | null
}

function toMatchRead(match: MatchRow): MatchRead {
  return {
    id: match.id,
    home: match.home_team_name!,
    homeScore: match.homeScore,
    homeEmblem: match.home_emblem_path ?? undefined,
    away: match.away_team_name!,
    awayScore: match.awayScore,
    awayEmblem: match.away_emblem_path ?? undefined,
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
  if (team) filters.push(Prisma.sql`(
    UPPER(UNACCENT(home_team.name)) = UPPER(UNACCENT(${team}))
    OR UPPER(UNACCENT(away_team.name)) = UPPER(UNACCENT(${team}))
  )`)

  return Prisma.sql`WHERE ${Prisma.join(filters, ' AND ')}`
}
