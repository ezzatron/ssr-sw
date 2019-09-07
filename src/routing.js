import browserPlugin from 'router5-plugin-browser'
import transitionPath from 'router5-transition-path'
import {createRouter as createRouter5} from 'router5'

export function createRouter (routes) {
  const router = createRouter5(
    routes.filter(({name}) => name !== ''),
    {
      allowNotFound: true,
    },
  )

  router.usePlugin(universalPlugin)
  router.usePlugin(browserPlugin())

  const isBrowser = typeof window === 'object' && window.history
  const routesByName = routes.reduce((routes, route) => {
    routes[route.name] = route

    return routes
  }, {})

  router.useMiddleware(createRedirectMiddleware({routesByName}))
  router.useMiddleware(createUniversalMiddleware({isBrowser, routesByName}))

  return router
}

export function createDataMiddleware (options) {
  const {handler, routes} = options

  const fetchDataByRoute = routes.reduce((byRoute, route) => {
    const {fetchData, name} = route
    if (fetchData) byRoute[name] = fetchData

    return byRoute
  }, {})

  return function dataMiddleware (router, dependencies) {
    return (toState, fromState) => {
      const {toActivate, toDeactivate} = transitionPath(toState, fromState)
      if (!fromState) toActivate.unshift('')

      const toRemove = toDeactivate.filter(segment => fetchDataByRoute[segment])
      const toUpdate = toActivate
        .filter(segment => fetchDataByRoute[segment])
        .map(segment => {
          const fetchData = fetchDataByRoute[segment]

          return [segment, () => fetchData(dependencies, toState.params)]
        })

      const needsHandling = toUpdate.length > 0 || toRemove.length > 0
      if (needsHandling) handler({toRemove, toState, toUpdate})

      return true
    }
  }
}

export function startRouter (router, state) {
  return new Promise((resolve, reject) => {
    function handleStart (error, state) {
      if (!error) return resolve(state)

      const {promiseError} = error

      if (promiseError) return reject(promiseError)
      if (error instanceof Error) return reject(error)

      const realError = new Error('Unable to start router')
      realError.error = error

      reject(realError)
    }

    state ? router.start(state, handleStart) : router.start(handleStart)
  })
}

function createRedirectMiddleware (options) {
  const {routesByName} = options

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

function universalPlugin (router) {
  return {
    onTransitionError (toState, fromState, error) {
      if (error.isServerOnly) window.location = toState.path
    },
  }
}

function createUniversalMiddleware (options) {
  const {isBrowser, routesByName} = options

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
