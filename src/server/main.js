import express from 'express'

import {asyncMiddleware} from './express.js'
import {createRouter} from '../routing.js'
import {createRenderMiddleware, createRouterMiddleware} from './middleware.js'

export default function createApp (options) {
  const {clientStats} = options

  const baseRouter = createRouter()
  const app = express()

  app.use(asyncMiddleware(createRouterMiddleware(baseRouter)))
  app.use(asyncMiddleware(createRenderMiddleware(clientStats)))

  return app
}
