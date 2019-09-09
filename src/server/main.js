import cookieParser from 'cookie-parser'
import express from 'express'

import routes from '~/src/routes.js'
import {asyncMiddleware} from './express.js'
import {createApiV1} from './api.js'
import {createRenderMiddleware, createRouterMiddleware} from './middleware.js'
import {createRouter} from '~/src/routing.js'

export default function createApp (options) {
  const {clientStats, secret} = options

  const baseRouter = createRouter(routes)
  const app = express()

  app.set('env', process.env.NODE_ENV)
  app.set('trust proxy', true)
  app.set('x-powered-by', false)

  app.use(cookieParser(secret))

  app.get('/server-only', (request, response) => {
    response.end('This is server-only.')
  })

  app.get('/server-error', (request, response) => {
    throw new Error('This is a server error.')
  })

  app.use('/api/v1', createApiV1())
  app.use(asyncMiddleware(createRouterMiddleware(baseRouter)))
  app.use(asyncMiddleware(createRenderMiddleware(clientStats)))

  return app
}
