import { Elysia } from 'elysia'

import { InvariantError } from './exceptions/invariant_error'
import { matchRoutes } from './routes/match_routes'
import cors from '@elysiajs/cors'

const server = new Elysia()

server
  .error('INVARIANT_ERROR', InvariantError)
  .onError(({ code, error, set }) => {
    console.error(error)

    switch (code) {
      case 'VALIDATION':
        set.status = 400
        return {
          status: 'error',
          message: 'Some fields are invalid'
        }
      case 'NOT_FOUND':
        set.status = 404
        return {
          status: 'error',
          message: 'Resource not found'
        }
      case 'INTERNAL_SERVER_ERROR':
        set.status = 500
        return {
          status: 'error',
          message: 'Something went wrong'
        }
    }
  })

server.use(
  cors({
    origin: process.env.ORIGIN,
    allowedHeaders: ['Content-Type'],
    methods: ['GET']
  })
)

server
  .use(matchRoutes)
  .listen(process.env.BUN_PORT ?? 3000)

console.info(
  `🦊 Elysia is running at ${server.server?.hostname}:${server.server?.port}`
)
