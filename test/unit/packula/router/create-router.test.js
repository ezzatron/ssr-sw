import {createRouter} from '~/src/packula/router'
import {ROOT} from '~/src/packula/router/symbols'

describe('Packula router', () => {
  describe('createRouter()', () => {
    test('throws if invalid routes are supplied', () => {
      expect(() => createRouter()).toThrow('Invalid routes')
      expect(() => createRouter(null)).toThrow('Invalid routes')
      expect(() => createRouter('')).toThrow('Invalid routes')
      expect(() => createRouter(true)).toThrow('Invalid routes')
      expect(() => createRouter(1)).toThrow('Invalid routes')
    })

    test('adds a root route if necessary', () => {
      const {routes} = createRouter({})

      expect(routes[ROOT]).toStrictEqual({options: {}})
    })

    test('preserves any supplied root route options', () => {
      const root = {options: {a: 'b'}}
      const {routes} = createRouter({[ROOT]: root})

      expect(routes[ROOT].options).toBe(root.options)
    })

    test('sets the parents of any top-level routes to ROOT', () => {
      const {routes} = createRouter({
        routeA: {},
        routeB: {},
      })

      expect(routes.routeA.parent).toBe(ROOT)
      expect(routes.routeB.parent).toBe(ROOT)
    })
  })

  describe('getParsedRoute()', () => {
    test('returns token data for any defined route with a path', () => {
      const {getParsedRoute} = createRouter({
        routeA: {path: '/route-a/:a/:b'},
        routeB: {path: '/route-b/:a/:b'},
      })
      const parsedRouteA = getParsedRoute('routeA')

      expect(parsedRouteA).toBeDefined()
      expect(parsedRouteA).toHaveProperty('tokens')
      expect(parsedRouteA.tokens).toHaveLength(3)
      expect(parsedRouteA).toHaveProperty('tokensByKey')
      expect(Object.keys(parsedRouteA.tokensByKey)).toStrictEqual(['a', 'b'])
    })

    test('throws for undefined routes', () => {
      const {getRoute} = createRouter({})

      expect(() => getRoute('routeA')).toThrow('Undefined route routeA')
    })
  })

  describe('getRoute()', () => {
    test('returns any defined route', () => {
      const {getRoute} = createRouter({
        routeA: {options: {a: 'b'}},
        routeB: {options: {c: 'd'}},
      })

      expect(getRoute('routeA')).toStrictEqual({parent: ROOT, options: {a: 'b'}})
      expect(getRoute('routeB')).toStrictEqual({parent: ROOT, options: {c: 'd'}})
    })

    test('throws for undefined routes', () => {
      const {getRoute} = createRouter({})

      expect(() => getRoute('routeA')).toThrow('Undefined route routeA')
    })
  })
})
