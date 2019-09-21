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

      expect(routes[ROOT]).toStrictEqual({})
    })

    test('preserves any supplied root route config', () => {
      const root = {a: 'b'}
      const {routes} = createRouter({[ROOT]: root})

      expect(routes[ROOT]).toStrictEqual(root)
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

  describe('getRoute()', () => {
    test('returns any defined route', () => {
      const {getRoute} = createRouter({
        routeA: {a: 'b'},
        routeB: {c: 'd'},
      })

      expect(getRoute('routeA')).toStrictEqual({parent: ROOT, a: 'b'})
      expect(getRoute('routeB')).toStrictEqual({parent: ROOT, c: 'd'})
    })
  })
})
