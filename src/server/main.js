import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import express from 'express'

import {asyncMiddleware} from './express.js'
import {createApiV1} from './api.js'
import {createAuthMiddleware, createRenderMiddleware, createRouterMiddleware} from './middleware.js'
import {createRouter} from '../routing.js'

export default function createApp (options) {
  const {clientStats, secret} = options

  const baseRouter = createRouter()
  const app = express()

  app.set('env', process.env.NODE_ENV)
  app.set('trust proxy', true)
  app.set('x-powered-by', false)

  app.use(bodyParser.urlencoded({extended: false}))
  app.use(cookieParser(secret))

  app.use(asyncMiddleware(createAuthMiddleware()))

  app.post('/sign-in', (request, response) => {
    const {userId} = request.body
    const isValid = /^[1-9]\d*$/.test(userId)

    if (!isValid) return response.sendStatus(400)

    response.cookie('userId', userId, {httpOnly: true, signed: true})
    response.redirect(baseRouter.buildPath('dashboard'))
  })

  app.post('/sign-out', (request, response) => {
    response.clearCookie('userId', {httpOnly: true, signed: true})
    response.redirect(baseRouter.buildPath('sign-in'))
  })

  app.get('/server-only', (request, response) => {
    response.end('This is server-only.')
  })

  app.use('/api/v1', createApiV1())
  app.use(asyncMiddleware(createRouterMiddleware(baseRouter)))
  app.use(asyncMiddleware(createRenderMiddleware(clientStats)))

  return app
}
