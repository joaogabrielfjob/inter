import { Elysia, t } from 'elysia'
import { matchHandler } from '../handler/match_handler'
import { MatchStatus } from '../enums/match_status'

const schema = t.Object({
  status: t.Enum(MatchStatus),
  order: t.Union([t.Literal('ASC'), t.Literal('DESC')]),

  year: t.Optional(t.String()),
  month: t.Optional(t.String()),
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
