import cookieParser from 'cookie-parser'

import routes from '~/src/server/routes.js'
import {asyncMiddleware} from './express.js'
import {createApi} from './api.js'
import {createPathResolver} from '~/src/packula/router/path-resolver'
import {createRenderMiddleware} from './rendering.js'
import {createRouterMiddleware} from './routing.js'
import {createRouter} from '~/src/packula/router'
import {createUrlBuilder} from '~/src/packula/router/url-builder'
import {createUrlResolver} from '~/src/packula/router/url-resolver'

export default function createApp (options) {
  const {clientStats, createAppRouter, secret} = options

  const router = createRouter(routes)
  const buildUrl = createUrlBuilder(router)
  const resolveUrl = createUrlResolver(router)
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
  app.use(asyncMiddleware(createRouterMiddleware(router, buildUrl, resolveUrl)))
  app.use(asyncMiddleware(createRenderMiddleware(clientStats)))

  return app
}
