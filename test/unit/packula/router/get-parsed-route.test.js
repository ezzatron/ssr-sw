import {createRouter} from '~/src/packula/router'

describe('Packula router', () => {
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
})
