import bodyParser from 'body-parser'
import express from 'express'

import {asyncMiddleware} from './express.js'
import {createApiV1} from './api.js'
import {createRenderMiddleware, createRouterMiddleware} from './middleware.js'
import {createRouter} from '../routing.js'

export default function createApp (options) {
  const {clientStats} = options

  const baseRouter = createRouter()
  const app = express()

  app.set('env', process.env.NODE_ENV)
  app.set('trust proxy', true)
  app.set('x-powered-by', false)

  app.use(bodyParser.urlencoded({extended: false}))

  app.get('/server-only', (request, response) => {
    response.end('This is server-only.')
  })

  app.use('/api/v1', createApiV1(baseRouter))
  app.use(asyncMiddleware(createRouterMiddleware(baseRouter)))
  app.use(asyncMiddleware(createRenderMiddleware(clientStats)))

  return app
}
