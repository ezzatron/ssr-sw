export default function createRedirectPlugin (routes) {
  const routesByName = routes.reduce((routes, route) => {
    routes[route.name] = route

    return routes
  }, {})

  return function redirectPlugin (router) {
    router.useMiddleware(createRedirectMiddleware(routesByName))

    return {}
  }
}

function createRedirectMiddleware (routesByName) {
  return function redirectMiddleware (router) {
    return (toState, fromState, done) => {
      const {name} = toState
      const route = routesByName[name]

      if (!route) return done()

      const {redirectTo} = route
      const redirectType = typeof redirectTo

      if (redirectType === 'string') return done({redirect: {name: redirectTo}})
      if (redirectType === 'object') return done({redirect: redirectTo})

      done()
    }
  }
}
