import browserPlugin from 'router5-plugin-browser'
import {createRouter as createRouter5} from 'router5'

const routes = [
  {name: 'home', path: '/', canActivate: redirect('foo')},

  {name: 'sign-in', path: '/sign-in'},
  {name: 'bar', path: '/bar'},
  {name: 'foo', path: '/foo'},
  {name: 'client-only', path: '/client-only', isServer: false},
  {name: 'server-only', path: '/server-only', isClient: false},
  {name: 'no-component', path: '/no-component'},

  {name: 'api-sign-in', path: '/api/v1/sign-in', isClient: false},
  {name: 'api-sign-out', path: '/api/v1/sign-out', isClient: false},
]

const routesByName = routes.reduce((routes, route) => {
  routes[route.name] = route

  return routes
}, {})

export function createRouter () {
  const router = createRouter5(routes, {
    allowNotFound: true,
  })
  router.usePlugin(serverOnlyPlugin)
  router.usePlugin(browserPlugin())

  const isBrowser = typeof window === 'object' && window.history

  router.useMiddleware(router => (toState, fromState, done) => {
    const {name} = toState
    const route = routesByName[name]

    if (route) {
      const {isClient = true, isServer = true} = route

      toState.meta.isClient = isClient
      toState.meta.isServer = isServer

      if (isBrowser && !isClient && fromState) return done({isServerOnly: true})
    }

    return true
  })

  return router
}

export function startRouter (router, state) {
  return new Promise((resolve, reject) => {
    function handleStart (error, state) {
      error ? reject(error) : resolve(state)
    }

    state ? router.start(state, handleStart) : router.start(handleStart)
  })
}

function serverOnlyPlugin (router) {
  return {
    onTransitionError (toState, fromState, error) {
      if (error.isServerOnly) window.location = toState.path
    },
  }
}

function redirect (name, params) {
  return router => (toState, fromState, done) => {
    done({redirect: {name, params}})
  }
}
