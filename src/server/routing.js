import fetch from 'node-fetch'
import {cloneRouter} from 'router5'

import dataPlugin from '~/src/router5-plugin-data/server.js'
import routes from '~/src/routes.js'
import {startRouter} from '~/src/routing.js'

export function createRouterMiddleware (baseRouter) {
  return async function routerMiddleware (request, response, next) {
    const router = cloneRouter(baseRouter)
    router.usePlugin(dataPlugin(routes))
    router.setDependency('fetch', fetch)
    const routerState = await startRouter(router, request.originalUrl)

    request.router = router
    request.routerState = routerState

    const {
      meta: {
        options: {
          redirected: isRedirect,
        } = {},
      } = {},
    } = routerState

    if (!isRedirect) return next()

    const {name, params} = routerState

    response.writeHead(302, {
      location: router.buildPath(name, params),
    })
    response.end()
  }
}
