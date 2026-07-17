import { Elysia, t } from 'elysia'
import { matchHandler } from '../handler/match_handler'
import { MatchStatus } from '../enums/match_status'

const schema = t.Object({
  status: t.Enum(MatchStatus),
  order: t.Union([t.Literal('ASC'), t.Literal('DESC')]),
  cursor: t.Optional(t.String()),

  year: t.Optional(t.String({ pattern: '^\\d{4}$' })),
  month: t.Optional(t.String({ pattern: '^(?:[1-9]|1[0-2])$' })),
  league: t.Optional(t.String()),
  team: t.Optional(t.String())
})

const statisticsSchema = t.Object({
  year: t.Optional(t.String({ pattern: '^\\d{4}$' })),
  month: t.Optional(t.String({ pattern: '^(?:[1-9]|1[0-2])$' })),
  league: t.Optional(t.String()),
  team: t.Optional(t.String())
}, { additionalProperties: false })

export const matchRoutes = new Elysia({ prefix: '/matches' })
  .get(
    '/',
    async ({ query }) => matchHandler.getMatches(query),
    { query: schema }
  )
  .get('/statistics', async ({ query, request, set }) => {
    if (!hasOnlyMatchStatisticsFilters(request.url)) {
      set.status = 400
      return { status: 'error', message: 'Some fields are invalid' }
    }
    return matchHandler.statistics(query)
  }, { query: statisticsSchema })
  .get('/filters', matchHandler.filters)

function hasOnlyMatchStatisticsFilters(url: string): boolean {
  const searchParams = new URL(url).searchParams
  const filters = new Set(['year', 'month', 'league', 'team'])

  return [...searchParams.keys()].every((key) => filters.has(key) && searchParams.getAll(key).length === 1)
}
