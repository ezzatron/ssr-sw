import {createRouter} from '~/src/packula/router'

describe('Packula router', () => {
  describe('routePath()', () => {
    test('throws when an undefined to route is passed', () => {
      const {routePath} = createRouter({})

      expect(() => routePath('routeA')).toThrow('Undefined route "routeA"')
    })

    test('throws when the route has no path', () => {
      const {routePath} = createRouter({
        routeA: {},
      })

      expect(() => routePath('routeA')).toThrow('Route "routeA" has no path')
    })

    test('returns full route paths', () => {
      const {routePath} = createRouter({
        routeA: {path: '/route-a'},
        routeAA: {path: '/route-a/route-a-a'},
        routeB: {path: '/route-b'},
      })

      expect(routePath('routeA')).toEqual('/route-a')
      expect(routePath('routeAA')).toEqual('/route-a/route-a-a')
      expect(routePath('routeB')).toEqual('/route-b')
    })
  })
})
