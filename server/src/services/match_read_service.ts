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
  goalSummary: GoalSummaryRead
}

export type GoalSummaryRead = {
  status: 'VERIFIED' | 'UNAVAILABLE'
  goals: GoalRead[]
}

export type GoalRead = {
  scorer: string
  minute: string
  team: 'HOME' | 'AWAY'
  marker?: 'P' | 'C'
}

export type MatchReadQuery = {
  status: MatchStatus
  order: 'ASC' | 'DESC'
  cursor?: string
  year?: string
  month?: string
  league?: string
  team?: string
}

export type MatchReadPage = {
  matches: MatchRead[]
  nextCursor?: string
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
  list: async ({ status, order, cursor: encodedCursor, year, month, league, team }: MatchReadQuery): Promise<MatchReadPage> => {
    const isMatchResults = status === MatchStatus.FINISHED
    const resultOrder = isMatchResults ? 'DESC' : order
    const cursor = encodedCursor ? decodeCursor(encodedCursor) : undefined
    const where = conditions(status, resultOrder, cursor, year, month, league, team)
    const query = Prisma.sql`
      SELECT match.id, match.home_score AS "homeScore", match.away_score AS "awayScore", match.date, match.league, match.time,
        match.goal_summary_status,
        home_team.name AS home_team_name, away_team.name AS away_team_name,
        home_emblem.path AS home_emblem_path, away_emblem.path AS away_emblem_path,
        COALESCE(json_agg(json_build_object(
          'scorer', goal.scorer, 'minute', goal.minute, 'team', goal.team_side, 'marker', goal.marker
        ) ORDER BY goal.id) FILTER (WHERE goal.id IS NOT NULL), '[]') AS goals
      FROM match
      LEFT JOIN team AS home_team ON home_team.id = match.home_team_id
      LEFT JOIN team AS away_team ON away_team.id = match.away_team_id
      LEFT JOIN team_emblem AS home_emblem ON home_emblem.team_id = home_team.id AND home_emblem.is_current = true
      LEFT JOIN team_emblem AS away_emblem ON away_emblem.team_id = away_team.id AND away_emblem.is_current = true
      LEFT JOIN goal ON goal.match_id = match.id
      ${where}
      GROUP BY match.id, home_team.name, away_team.name, home_emblem.path, away_emblem.path
      ORDER BY match.date ${Prisma.raw(resultOrder)}${isMatchResults ? Prisma.sql`, match.id ${Prisma.raw(resultOrder)}` : Prisma.empty}
      ${isMatchResults ? Prisma.sql`LIMIT 21` : Prisma.empty}`
    const matches = await prisma.$queryRaw<MatchRow[]>(query)
    const page = (isMatchResults ? matches.slice(0, 20) : matches).map(toMatchRead)

    return {
      matches: page,
      ...(isMatchResults && matches.length > 20 ? { nextCursor: encodeCursor(page.at(-1)!) } : {}),
    }
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
  goal_summary_status: string; goals: GoalRow[]
}

type GoalRow = {
  scorer: string; minute: string; team: string; marker: string | null
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
    goalSummary: {
      status: match.goal_summary_status === 'VERIFIED' ? 'VERIFIED' : 'UNAVAILABLE',
      goals: match.goals.map(toGoalRead),
    },
    ...(match.time ? { kickoffTime: match.time } : {}),
  }
}

function toGoalRead(goal: GoalRow): GoalRead {
  return {
    scorer: goal.scorer,
    minute: goal.minute,
    team: goal.team === 'AWAY' ? 'AWAY' : 'HOME',
    ...(goal.marker === 'P' || goal.marker === 'C' ? { marker: goal.marker } : {}),
  }
}

type MatchResultsCursor = {
  matchDay: string
  id: number
}

function conditions(status: MatchStatus, order: 'ASC' | 'DESC', cursor?: MatchResultsCursor, year?: string, month?: string, league?: string, team?: string): Prisma.Sql {
  const filters: Prisma.Sql[] = [Prisma.sql`status = ${status}`]

  if (year) filters.push(Prisma.sql`EXTRACT(YEAR FROM date) = ${year}::integer`)
  if (month) filters.push(Prisma.sql`EXTRACT(MONTH FROM date) = ${month}::integer`)
  if (league) filters.push(Prisma.sql`UPPER(UNACCENT(league)) = UPPER(UNACCENT(${league}))`)
  if (team) filters.push(Prisma.sql`(
    UPPER(UNACCENT(home_team.name)) = UPPER(UNACCENT(${team}))
    OR UPPER(UNACCENT(away_team.name)) = UPPER(UNACCENT(${team}))
  )`)
  if (cursor) filters.push(cursorCondition(cursor, order))

  return Prisma.sql`WHERE ${Prisma.join(filters, ' AND ')}`
}

function cursorCondition(cursor: MatchResultsCursor, order: 'ASC' | 'DESC'): Prisma.Sql {
  const operator = order === 'DESC' ? '<' : '>'

  return Prisma.sql`(
    match.date ${Prisma.raw(operator)} ${new Date(cursor.matchDay)}
    OR (match.date = ${new Date(cursor.matchDay)} AND match.id ${Prisma.raw(operator)} ${cursor.id})
  )`
}

function encodeCursor({ matchDay, id }: MatchRead): string {
  return Buffer.from(JSON.stringify({ matchDay, id })).toString('base64url')
}

function decodeCursor(cursor: string): MatchResultsCursor {
  const parsed: unknown = JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8'))

  if (!isMatchResultsCursor(parsed)) throw new Error('Invalid Match Results cursor')

  return parsed
}

function isMatchResultsCursor(value: unknown): value is MatchResultsCursor {
  return typeof value === 'object'
    && value !== null
    && 'matchDay' in value
    && typeof value.matchDay === 'string'
    && /^\d{4}-\d{2}-\d{2}$/.test(value.matchDay)
    && 'id' in value
    && typeof value.id === 'number'
    && Number.isInteger(value.id)
}
