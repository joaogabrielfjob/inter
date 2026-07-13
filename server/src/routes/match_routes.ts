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

export const matchRoutes = new Elysia({ prefix: '/matches' })
  .get(
    '/',
    async ({ query }) => matchHandler.getMatches(query),
    { query: schema }
  )
  .get('/filters', matchHandler.filters)
