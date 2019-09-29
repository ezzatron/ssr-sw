import {createPathResolver} from '~/src/packula/router/path-resolver'
import {createRouter} from '~/src/packula/router'

describe('Packula router', () => {
  describe('routePath()', () => {
    test('throws when an undefined route is passed', () => {
      const {routePath} = createPathResolver(createRouter({}))

      expect(() => routePath('routeA')).toThrow('Undefined route routeA')
    })

    test('throws when the route has no path', () => {
      const {routePath} = createPathResolver(createRouter({
        routeA: {},
      }))

      expect(() => routePath('routeA')).toThrow('Route routeA has no path')
    })

    test('returns full route paths', () => {
      const {routePath} = createPathResolver(createRouter({
        routeA: {path: '/route-a'},
        routeAA: {path: '/route-a/route-a-a'},
        routeB: {path: '/route-b'},
      }))

      expect(routePath('routeA')).toBe('/route-a')
      expect(routePath('routeAA')).toBe('/route-a/route-a-a')
      expect(routePath('routeB')).toBe('/route-b')
    })
  })
})
