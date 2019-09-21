import {createRouter, ROOT} from '~/src/packula/router'

describe('Packula router', () => {
  describe('routePathFrom()', () => {
    test('throws when an undefined from route is passed', () => {
      const {routePathFrom} = createRouter({
        routeB: {path: '/route-b'},
      })

      expect(() => routePathFrom('routeA', 'routeB')).toThrow('Undefined route "routeA"')
    })

    test('throws when an undefined to route is passed', () => {
      const {routePathFrom} = createRouter({
        routeA: {path: '/route-a'},
      })

      expect(() => routePathFrom('routeA', 'routeB')).toThrow('Undefined route "routeB"')
    })

    test('throws when the from route has no path', () => {
      const {routePathFrom} = createRouter({
        routeA: {},
        routeB: {path: '/route-b'},
      })

      expect(() => routePathFrom('routeA', 'routeB')).toThrow('Route "routeA" has no path')
    })

    test('throws when the to route has no path', () => {
      const {routePathFrom} = createRouter({
        routeA: {path: '/route-a'},
        routeB: {},
      })

      expect(() => routePathFrom('routeA', 'routeB')).toThrow('Route "routeB" has no path')
    })

    test('returns full route paths when ROOT is passed as the from parameter', () => {
      const {routePathFrom} = createRouter({
        routeA: {path: '/route-a'},
        routeAA: {path: '/route-a/route-a-a'},
        routeB: {path: '/route-b'},
      })

      expect(routePathFrom(ROOT, 'routeA')).toEqual('/route-a')
      expect(routePathFrom(ROOT, 'routeAA')).toEqual('/route-a/route-a-a')
      expect(routePathFrom(ROOT, 'routeB')).toEqual('/route-b')
    })

    test('returns relative route paths when an ancestor is passed as the from parameter', () => {
      const {routePathFrom} = createRouter({
        routeA: {path: '/route-a'},
        routeAA: {path: '/route-a/route-a-a'},
        routeAAA: {path: '/route-a/route-a-a/route-a-a-a'},
      })

      expect(routePathFrom('routeA', 'routeAA')).toEqual('/route-a-a')
      expect(routePathFrom('routeA', 'routeAAA')).toEqual('/route-a-a/route-a-a-a')
      expect(routePathFrom('routeAA', 'routeAAA')).toEqual('/route-a-a-a')
    })

    test('throws when a non-ancestor is passed as the from parameter', () => {
      const {routePathFrom} = createRouter({
        routeA: {path: '/route-a'},
        routeAA: {path: '/route-a-a'},
        routeACopy: {path: '/route-a'},
      })

      expect(() => routePathFrom('routeA', 'routeAA')).toThrow('Route path for "routeAA" ("/route-a-a") is not a descendent of "routeA" ("/route-a")')
      expect(() => routePathFrom('routeA', 'routeACopy')).toThrow('Route path for "routeACopy" ("/route-a") is not a descendent of "routeA" ("/route-a")')
    })
  })
})
