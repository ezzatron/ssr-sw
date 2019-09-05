import browserPlugin from 'router5-plugin-browser'
import transitionPath from 'router5-transition-path'
import {createRouter as createRouter5} from 'router5'

const routes = [
  {name: 'home', path: '/', canActivate: redirect('dashboard')},

  {
    name: 'dashboard',
    path: '/dashboard',
    onActivate (context) {
      return {
        test: Promise.resolve('this worked'),
      }
    },
  },

  {name: 'sign-in', path: '/sign-in'},
  {name: 'sign-out', path: '/sign-out'},

  {name: 'universal', path: '/universal'},
  {name: 'client-only', path: '/client-only', isServer: false},
  {name: 'server-only', path: '/server-only', isClient: false},
  {name: 'no-component', path: '/no-component'},

  {name: 'api-user', path: '/api/v1/user', isClient: false},
]

export function createRouter () {
  const router = createRouter5(routes, {
    allowNotFound: true,
  })

  router.usePlugin(universalPlugin)
  router.usePlugin(browserPlugin())

  const options = {
    isBrowser: typeof window === 'object' && window.history,
    routesByName: buildRouteMap(routes),
  }

  router.useMiddleware(createUniversalMiddleware(options))
  router.useMiddleware(createDataMiddleware(options))

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

      return reject(realError)
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

      return done()
    }
  }
}

function createDataMiddleware (options) {
  const {isBrowser, routesByName} = options

  return function dataMiddleware (router) {
    return (toState, fromState) => {
      const {toActivate} = transitionPath(toState, fromState)
      const onActivateHandlers = toActivate
        .map(segment => {
          const route = routesByName[segment]

          return route && route.onActivate
        })
        .filter(Boolean)

      const data = {}

      for (const onActivateHandler of onActivateHandlers) {
        const segmentData = onActivateHandler({
          data,
          params: toState.params,
        })

        Object.assign(data, segmentData)
      }

      if (isBrowser) {
        toState.data = data
      } else {
        const errors = {}

        return Promise.all(
          Object.entries(data).map(([key, promise]) => {
            return promise.then(
              result => [key, result],
              error => { errors[key] = error },
            )
          }),
        )
          .then(entries => {
            if (Object.keys(errors).length < 1) return {...toState, data: Object.fromEntries(entries)}

            const errorList = Object.entries(errors).map(([key, error]) => {
              const message = error instanceof Error ? error.stack : '' + error

              return `- Fetching "${key}" failed:\n\n${message.split('\n').map(line => `  ${line}`).join('\n')}`
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
