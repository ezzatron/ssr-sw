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

  describe('getRouteOption()', () => {
    test('throws when an undefined route is passed', () => {
      const {getRouteOption} = createRouter({})

      expect(() => getRouteOption('routeA')).toThrow('Undefined route routeA')
    })

    test('retrieves options defined in the specified route', () => {
      const {getRouteOption} = createRouter({
        routeA: {options: {optionA: 'a'}},
        routeB: {options: {optionA: 'b'}, parent: 'routeA'},
      })

      expect(getRouteOption('routeA', 'optionA')).toBe('a')
      expect(getRouteOption('routeB', 'optionA')).toBe('b')
    })

    test('retrieves options defined in the ancestor routes', () => {
      const {getRouteOption} = createRouter({
        routeA: {options: {optionA: 'a'}},
        routeB: {parent: 'routeA'},
        routeC: {parent: 'routeB'},
      })

      expect(getRouteOption('routeB', 'optionA')).toBe('a')
      expect(getRouteOption('routeC', 'optionA')).toBe('a')
    })

    test('retrieves options defined in the root route', () => {
      const {getRouteOption} = createRouter({
        [ROOT]: {options: {optionA: 'root'}},
        routeA: {},
      })

      expect(getRouteOption(ROOT, 'optionA')).toBe('root')
      expect(getRouteOption('routeA', 'optionA')).toBe('root')
    })

    test('handles undefined options', () => {
      const {getRouteOption} = createRouter({})

      expect(getRouteOption(ROOT, 'optionA')).toBeUndefined()
    })

    test('handles default values options', () => {
      const {getRouteOption} = createRouter({
        routeA: {},
        routeB: {parent: 'routeA'},
      })

      expect(getRouteOption(ROOT, 'nonexistent', false)).toBe(false)
      expect(getRouteOption('routeA', 'nonexistent', false)).toBe(false)
      expect(getRouteOption('routeB', 'nonexistent', false)).toBe(false)
    })
  })
})
