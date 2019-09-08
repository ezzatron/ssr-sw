export default function createUniversalPlugin (routes) {
  const isBrowser = typeof window === 'object' && window.history
  const routesByName = routes.reduce((routes, route) => {
    routes[route.name] = route

    return routes
  }, {})

  return function universalPlugin (router) {
    router.useMiddleware(createUniversalMiddleware(isBrowser, routesByName))

    return {
      onTransitionError (toState, fromState, error) {
        if (error.isServerOnly) window.location = toState.path
      },
    }
  }
}

function createUniversalMiddleware (isBrowser, routesByName) {
  return function universalMiddleware (router) {
    return (toState, fromState, done) => {
      const {name} = toState
      const route = routesByName[name]

      if (route) {
        const {isClient = true, isServer = true} = route

        toState.meta.isClient = isClient
        toState.meta.isServer = isServer

        if (isBrowser && !isClient && fromState) return done({isServerOnly: true})
      }

      done()
    }
  }
}
