import {createPathResolver} from '~/src/packula/router/path-resolver'
import {createRouter} from '~/src/packula/router'
import {ROOT} from '~/src/packula/router/symbols'

describe('Packula router path resolver', () => {
  describe('routePath()', () => {
    test('throws when an undefined to route is passed', () => {
      const {routePath} = createPathResolver(createRouter({}))

      expect(() => routePath('routeA')).toThrow('Undefined route "routeA"')
    })

    test('throws when the route has no path', () => {
      const {routePath} = createPathResolver(createRouter({
        routeA: {},
      }))

      expect(() => routePath('routeA')).toThrow('Route "routeA" has no path')
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

  describe('routePathFrom()', () => {
    test('throws when an undefined from route is passed', () => {
      const {routePathFrom} = createPathResolver(createRouter({
        routeB: {path: '/route-b'},
      }))

      expect(() => routePathFrom('routeA', 'routeB')).toThrow('Undefined route "routeA"')
    })

    test('throws when an undefined to route is passed', () => {
      const {routePathFrom} = createPathResolver(createRouter({
        routeA: {path: '/route-a'},
      }))

      expect(() => routePathFrom('routeA', 'routeB')).toThrow('Undefined route "routeB"')
    })

    test('throws when the from route has no path', () => {
      const {routePathFrom} = createPathResolver(createRouter({
        routeA: {},
        routeB: {path: '/route-b'},
      }))

      expect(() => routePathFrom('routeA', 'routeB')).toThrow('Route "routeA" has no path')
    })

    test('throws when the to route has no path', () => {
      const {routePathFrom} = createPathResolver(createRouter({
        routeA: {path: '/route-a'},
        routeB: {},
      }))

      expect(() => routePathFrom('routeA', 'routeB')).toThrow('Route "routeB" has no path')
    })

    test('returns full route paths when ROOT is passed as the from parameter', () => {
      const {routePathFrom} = createPathResolver(createRouter({
        routeA: {path: '/route-a'},
        routeAA: {path: '/route-a/route-a-a'},
        routeB: {path: '/route-b'},
      }))

      expect(routePathFrom(ROOT, 'routeA')).toBe('/route-a')
      expect(routePathFrom(ROOT, 'routeAA')).toBe('/route-a/route-a-a')
      expect(routePathFrom(ROOT, 'routeB')).toBe('/route-b')
    })

    test('returns relative route paths when an ancestor is passed as the from parameter', () => {
      const {routePathFrom} = createPathResolver(createRouter({
        routeA: {path: '/route-a'},
        routeAA: {path: '/route-a/route-a-a'},
        routeAAA: {path: '/route-a/route-a-a/route-a-a-a'},
      }))

      expect(routePathFrom('routeA', 'routeAA')).toBe('/route-a-a')
      expect(routePathFrom('routeA', 'routeAAA')).toBe('/route-a-a/route-a-a-a')
      expect(routePathFrom('routeAA', 'routeAAA')).toBe('/route-a-a-a')
    })

    test('throws when a non-ancestor is passed as the from parameter', () => {
      const {routePathFrom} = createPathResolver(createRouter({
        routeA: {path: '/route-a'},
        routeAA: {path: '/route-a-a'},
        routeACopy: {path: '/route-a'},
      }))

      expect(() => routePathFrom('routeA', 'routeAA')).toThrow('Route path for "routeAA" ("/route-a-a") is not a descendent of "routeA" ("/route-a")')
      expect(() => routePathFrom('routeA', 'routeACopy')).toThrow('Route path for "routeACopy" ("/route-a") is not a descendent of "routeA" ("/route-a")')
    })
  })
})
