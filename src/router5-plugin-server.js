import {nameToIDs} from 'router5-transition-path'
import {constants as routerConstants} from 'router5'

const {UNKNOWN_ROUTE} = routerConstants

export default function createServerPlugin (routes) {
  const routesByName = routes.reduce((routes, route) => {
    routes[route.name] = route

    return routes
  }, {})

  let {
    handleServerRequest: rootHandler,
    serverHeaders: rootHeaders,
  } = routesByName[''] || {}

  return function serverPlugin (router) {
    router.handleServerRequest = async (request, response) => {
      const {name} = router.getState()

      if (name === UNKNOWN_ROUTE) return

      rootHeaders && setHeaders(response, rootHeaders)
      rootHandler && await Promise.resolve(rootHandler(request, response))

      for (const segment of nameToIDs(name)) {
        const {
          handleServerRequest: segmentHandler,
          serverHeaders: segmentHeaders,
        } = routesByName[segment]

        segmentHeaders && setHeaders(response, segmentHeaders)
        segmentHandler && await Promise.resolve(segmentHandler(request, response))
      }
    }

    router.setRootHandleServerRequest = handleServerRequest => {
      rootHandler = handleServerRequest
    }

    router.setRootServerHeaders = serverHeaders => {
      rootHeaders = serverHeaders
    }

    return {}
  }
}

function setHeaders (response, headers) {
  for (const name in headers) response.setHeader(name, headers[name])
}
