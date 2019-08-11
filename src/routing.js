import browserPlugin from 'router5-plugin-browser'
import {createRouter as createRouter5} from 'router5'

const routes = [
  {name: 'bar', path: '/bar'},
  {name: 'foo', path: '/foo'},
]

export function createRouter () {
  const router = createRouter5(routes, {
    defaultRoute: 'foo',
  })
  router.usePlugin(browserPlugin())

  return router
}
