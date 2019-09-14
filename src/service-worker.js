/* eslint-env worker */

import {cloneRouter} from 'router5'
import {createHandlerForURL, precacheAndRoute} from 'workbox-precaching'
import {registerRoute} from 'workbox-routing'

import {createRouter, startRouter} from '~/src/routing.js'
import routes from '~/src/routes.js'

const routesByName = routes.reduce((routes, route) => {
  routes[route.name] = route

  return routes
}, {})

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting()
})

precacheAndRoute(self.__WB_MANIFEST)

const baseRouter = createRouter(routes)
const appShellHandler = createHandlerForURL(findAppShellUrl(self.__WB_MANIFEST))

registerRoute(
  function match (options) {
    const {request, url: {pathname}} = options

    if (request && request.mode !== 'navigate') return false
    const match = baseRouter.matchPath(pathname)
    if (!match) return false

    const {isClient = true} = routesByName[match.name]

    return isClient
  },

  async function handle (options) {
    const {url: {pathname}} = options

    const router = cloneRouter(baseRouter)
    const routerState = await startRouter(router, pathname)

    const {
      name,
      params,
      meta: {
        options: {
          redirected: isRedirect,
        } = {},
      } = {},
    } = routerState

    if (isRedirect) return Response.redirect(router.buildPath(name, params), 302)

    return appShellHandler(options)
  },
)

function findAppShellUrl (manifest) {
  for (const {url} of manifest) {
    if (url.match(/^\/app-shell(\.hash~[^.]+)?\.html/)) return url
  }

  throw new Error('Unable to determine app shell URL')
}
