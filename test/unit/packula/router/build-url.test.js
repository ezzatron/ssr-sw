import {createRouter} from '~/src/packula/router'
import {createUrlBuilder} from '~/src/packula/router/url-builder'

describe('Packula router', () => {
  describe('buildUrl()', () => {
    test('throws when an undefined route is passed', () => {
      const buildUrl = createUrlBuilder(createRouter({}))

      expect(() => buildUrl('routeA')).toThrow('Undefined route routeA')
    })

    test('throws when a route with no path is passed', () => {
      const buildUrl = createUrlBuilder(createRouter({
        routeA: {},
      }))

      expect(() => buildUrl('routeA')).toThrow('Route routeA does not have a path')
    })

    test('throws when a required path param is not supplied', () => {
      const buildUrl = createUrlBuilder(createRouter({
        routeA: {path: '/route-a/:a'},
        routeB: {path: '/route-b/:b+'},
      }))

      expect(() => buildUrl('routeA')).toThrow('Expected "a" to be a string')
      expect(() => buildUrl('routeB')).toThrow('Expected "b" to be an array')
    })

    test('can build URLs with no params', () => {
      const buildUrl = createUrlBuilder(createRouter({
        routeA: {path: '/route-a'},
        routeB: {path: '/route-b/:b?'},
        routeC: {path: '/route-c/:c*'},
      }))

      expect(buildUrl('routeA')).toBe('/route-a')
      expect(buildUrl('routeB')).toBe('/route-b')
      expect(buildUrl('routeC')).toBe('/route-c')
    })

    test('can build URLs with path params', () => {
      const buildUrl = createUrlBuilder(createRouter({
        routeA: {path: '/route-a/:a'},
      }))

      expect(buildUrl('routeA', {a: 'value-a'})).toBe('/route-a/value-a')
      expect(buildUrl('routeA', [['a', 'value-a'], ['a', 'value-b']])).toBe('/route-a/value-a?a=value-b')
    })

    test('can build URLs with optional path params', () => {
      const buildUrl = createUrlBuilder(createRouter({
        routeA: {path: '/route-a/:a?'},
      }))

      expect(buildUrl('routeA')).toBe('/route-a')
      expect(buildUrl('routeA', {a: 'value-a'})).toBe('/route-a/value-a')
      expect(buildUrl('routeA', [['a', 'value-a'], ['a', 'value-b']])).toBe('/route-a/value-a?a=value-b')
    })

    test('can build URLs with unnamed path params', () => {
      const buildUrl = createUrlBuilder(createRouter({
        routeA: {path: '/route-a/(.*)'},
      }))

      expect(buildUrl('routeA', {0: 'value-a'})).toBe('/route-a/value-a')
      expect(buildUrl('routeA', [['0', 'value-a'], ['0', 'value-b']])).toBe('/route-a/value-a?0=value-b')
    })

    test('can build URLs with custom path params', () => {
      const buildUrl = createUrlBuilder(createRouter({
        routeA: {path: '/route-a-:a(\\d+).x'},
      }))

      expect(buildUrl('routeA', {a: 111})).toBe('/route-a-111.x')
      expect(buildUrl('routeA', [['a', 111], ['a', 'value-a']])).toBe('/route-a-111.x?a=value-a')
    })

    test('can build URLs with repeating path params', () => {
      const buildUrl = createUrlBuilder(createRouter({
        routeA: {path: '/route-a/:a*'},
        routeB: {path: '/route-b/:b+'},
      }))

      expect(buildUrl('routeA', {a: 'value-a'})).toBe('/route-a/value-a')
      expect(buildUrl('routeB', {b: 'value-a'})).toBe('/route-b/value-a')
      expect(buildUrl('routeA', [['a', 'value-a'], ['a', 'value-b']])).toBe('/route-a/value-a/value-b')
      expect(buildUrl('routeB', [['b', 'value-a'], ['b', 'value-b']])).toBe('/route-b/value-a/value-b')
    })

    test('can build URLs with search params', () => {
      const buildUrl = createUrlBuilder(createRouter({
        routeA: {path: '/route-a'},
      }))

      expect(buildUrl('routeA', {a: 'value-a'})).toBe('/route-a?a=value-a')
      expect(buildUrl('routeA', [['a', 'value-a'], ['a', 'value-b']])).toBe('/route-a?a=value-a&a=value-b')
    })

    test('can build URLs with path and search params', () => {
      const buildUrl = createUrlBuilder(createRouter({
        routeA: {path: '/route-a/:a'},
      }))

      expect(buildUrl('routeA', {a: 'value-a', b: 'value-b'})).toBe('/route-a/value-a?b=value-b')
    })

    test('can build URLs from URLSearchParams instances', () => {
      const buildUrl = createUrlBuilder(createRouter({
        routeA: {path: '/route-a/:a'},
      }))

      expect(buildUrl('routeA', new URLSearchParams({a: 'value-a', b: 'value-b'}))).toBe('/route-a/value-a?b=value-b')
    })
  })
})
