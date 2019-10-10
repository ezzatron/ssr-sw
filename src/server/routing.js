import {UNKNOWN} from '~/src/packula/router/symbols'

export function createRouterMiddleware (router, buildUrl, resolveUrl) {
  const {getRoute} = router

  return async function routerMiddleware (request, response, next) {
    const routerState = resolveUrl(request.originalUrl)
    const {name: routeName} = routerState
    const route = routeName === UNKNOWN ? undefined : getRoute(routeName)

    request.route = route
    request.router = router
    request.routerState = routerState

    const {
      options: {
        redirect,
      } = {},
    } = route

    if (!redirect) return next()

    const {name, params} = redirect

    response.writeHead(302, {
      location: buildUrl(name, params),
    })
    response.end()
  }
}
