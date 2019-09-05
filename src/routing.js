import browserPlugin from 'router5-plugin-browser'
import transitionPath from 'router5-transition-path'
import {createRouter as createRouter5} from 'router5'

const routes = [
  {name: 'home', path: '/', canActivate: redirect('dashboard')},

  {name: 'dashboard', path: '/dashboard'},
  {name: 'sign-in', path: '/sign-in'},
  {name: 'sign-out', path: '/sign-out'},

  {name: 'universal', path: '/universal'},
  {name: 'client-only', path: '/client-only', isServer: false},
  {name: 'server-only', path: '/server-only', isClient: false},
  {name: 'no-component', path: '/no-component'},

  {name: 'api-user', path: '/api/v1/user', isClient: false},
]

function fetchRootData (context, dependencies) {
  const {authClient: {fetchUser}} = dependencies

  return {
    user: fetchUser(),
  }
}

export function createRouter (dependencies) {
  const router = createRouter5(
    routes,
    {
      allowNotFound: true,
    },
    dependencies,
  )

  router.usePlugin(universalPlugin)
  router.usePlugin(browserPlugin())

  const isBrowser = typeof window === 'object' && window.history
  const routesByName = buildRouteMap(routes)

  router.useMiddleware(createUniversalMiddleware({isBrowser, routesByName}))
  router.useMiddleware(createDataMiddleware({fetchRootData, isBrowser, routesByName}))

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
  const {fetchRootData, isBrowser, routesByName} = options

  return function dataMiddleware (router, dependencies) {
    return (toState, fromState) => {
      const {toActivate, toDeactivate} = transitionPath(toState, fromState)

      const fetchers = toActivate
        .map(segment => {
          const route = routesByName[segment]
          const fetchData = route && route.fetchData

          return fetchData ? [segment, fetchData] : null
        })
        .filter(Boolean)
      if (!fromState && fetchRootData) fetchers.unshift(['', fetchRootData])

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

function redirect (name, params) {
  return router => (toState, fromState, done) => {
    done({redirect: {name, params}})
  }
}
