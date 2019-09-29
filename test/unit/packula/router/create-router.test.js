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
})
