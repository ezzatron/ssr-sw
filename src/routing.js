import browserPlugin from 'router5-plugin-browser'
import {createRouter as createRouter5} from 'router5'

const routes = [
  {name: 'home', path: '/', canActivate: redirect('foo')},

  {name: 'bar', path: '/bar'},
  {name: 'foo', path: '/foo'},
]

export function createRouter () {
  const router = createRouter5(routes, {
    allowNotFound: true,
  })
  router.usePlugin(browserPlugin())

  return router
}

export function startRouter (router, url) {
  return new Promise((resolve, reject) => {
    router.start(url, (error, state) => {
      error ? reject(error) : resolve(state)
    })
  })
}

function redirect (name, params) {
  return router => (toState, fromState, done) => {
    done({redirect: {name, params}})
  }
}
