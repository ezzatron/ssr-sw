import cookieParser from 'cookie-parser'

import routes from '~/src/routes.js'
import serverPlugin from '~/src/router5-plugin-server.js'
import {asyncMiddleware} from './express.js'
import {createApiV1} from './api.js'
import {createRenderMiddleware} from './rendering.js'
import {createRouterMiddleware} from './routing.js'
import {createRouter} from '~/src/routing.js'

export default function createApp (options) {
  const {clientStats, createAppRouter, secret} = options

  const baseRouter = createRouter(routes)
  baseRouter.usePlugin(serverPlugin(routes))

  const app = createAppRouter()

  app.use(cookieParser(secret))

  app.get('/server-only', (request, response) => {
    response.end('This is server-only.')
  })

  app.get('/server-error', (request, response) => {
    throw new Error('This is a server error.')
  })

  app.use('/api/v1', createApiV1(createAppRouter))
  app.use(asyncMiddleware(createRouterMiddleware(baseRouter)))
  app.use(asyncMiddleware(createRenderMiddleware(clientStats)))

  return app
}
