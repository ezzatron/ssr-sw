import express from 'express'

import {asyncMiddleware} from './express.js'
import {createAuthClient} from './auth-client.js'

export function createApiV1 () {
  const app = express()

  app.set('env', process.env.NODE_ENV)
  app.set('trust proxy', true)
  app.set('x-powered-by', false)

  app.get('/user', asyncMiddleware(async (request, response) => {
    const authClient = createAuthClient({request})
    const user = await authClient.fetchUser()

    response.setHeader('Cache-Control', 'no-cache')
    response.json(user)
  }))

  return app
}
