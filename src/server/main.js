import express from 'express'

import {asyncMiddleware} from './express.js'
import {createServerMiddleware} from './middleware.js'

export default function createApp (options) {
  const app = express()

  app.use(asyncMiddleware(createServerMiddleware(options)))

  return app
}
