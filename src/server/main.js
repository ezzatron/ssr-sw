import cookieParser from 'cookie-parser'

import routes from '~/src/server/routes.js'
import {asyncMiddleware} from './express.js'
import {createApi} from './api.js'
import {createPathResolver} from '~/src/packula/router/path-resolver'
import {createRenderMiddleware} from './rendering.js'
import {createRouterMiddleware} from './routing.js'
import {createMemoryRouter} from '~/src/packula/router/memory'

export default function createApp (options) {
  const {clientStats, createAppRouter, secret} = options

  const router = createMemoryRouter(routes)
  const {routePath, routePathFrom} = createPathResolver(router)

  const app = createAppRouter()

  app.use(cookieParser(secret))

  app.get(routePath('serverOnly'), (request, response) => {
    response.end('This is server-only.')
  })

  app.get(routePath('serverError'), (request, response) => {
    throw new Error('This is a server error.')
  })

  app.use(routePath('api'), createApi(createAppRouter, routePathFrom.bind(null, 'api')))
  app.use(asyncMiddleware(createRouterMiddleware(router)))
  app.use(asyncMiddleware(createRenderMiddleware(clientStats)))

  return app
}
