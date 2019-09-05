import express from 'express'

import {asyncMiddleware} from './express.js'

export function createApiV1 () {
  const app = express()

  app.set('env', process.env.NODE_ENV)
  app.set('trust proxy', true)
  app.set('x-powered-by', false)

  app.get('/user', asyncMiddleware(async (request, response) => {
    response.setHeader('Cache-Control', 'no-cache')
    response.json(request.user)
  }))

  return app
}
