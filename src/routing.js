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
  const routesByName = buildRouteMap(routes)

  router.useMiddleware(createRedirectMiddleware({routesByName}))
  router.useMiddleware(createUniversalMiddleware({isBrowser, routesByName}))
  router.useMiddleware(createDataMiddleware({isBrowser, routesByName}))

  return router
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

function createDataMiddleware (options) {
  const {isBrowser, routesByName} = options

  return function dataMiddleware (router, dependencies) {
    return (toState, fromState) => {
      const {toActivate, toDeactivate} = transitionPath(toState, fromState)
      if (!fromState) toActivate.unshift('')

      const fetchers = toActivate
        .map(segment => {
          const route = routesByName[segment]
          const fetchData = route && route.fetchData

          return fetchData ? [segment, fetchData] : null
        })
        .filter(Boolean)

      const data = fromState ? {...fromState.data} : {}
      for (const segment of toDeactivate) delete data[segment]

      for (const [segment, fetchData] of fetchers) {
        data[segment] = fetchData(
          {
            data,
            params: toState.params,
          },
          dependencies,
        )
      }

      if (isBrowser) {
        toState.data = data

        return true
      }

      return Promise.all(
        Object.entries(data).flatMap(([segment, values]) => {
          return Object.entries(values).map(([key, promise]) => {
            return promise.then(
              result => [segment, key, null, result],
              error => [segment, key, error],
            )
          })
        }),
      )
        .then(resolutions => {
          const errors = resolutions.filter(([,, error]) => error)

          if (errors.length < 1) {
            const nextData = resolutions.reduce((data, [segment, key, , value]) => {
              data[segment][key] = value

              return data
            }, data)

            return {...toState, data: nextData}
          }

          const errorList = Object.entries(errors).map(([segment, key, error]) => {
            const message = error.stack || '' + error
            const lines = message.split('\n').map(line => `  ${line}`).join('\n')

            return `- Fetching "${segment}.${key}" failed:\n\n${lines}`
          })

          const error = new Error(`Unable to fetch data for ${toState.name}:\n\n${errorList.join('\n\n')}`)
          error.isDataError = true
          error.errors = errors
          error.stack = ''

          throw error
        })
    }
  }
}

function buildRouteMap (routes) {
  return routes.reduce((routes, route) => {
    routes[route.name] = route

    return routes
  }, {})
}
