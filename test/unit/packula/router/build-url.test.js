import {createRouter} from '~/src/packula/router'

describe('Packula router', () => {
  describe('buildUrl()', () => {
    test('throws when an undefined route is passed', () => {
      const {buildUrl} = createRouter({})

      expect(() => buildUrl('routeA')).toThrow('Undefined route "routeA"')
    })

    test('throws when a required path param is not supplied', () => {
      const {buildUrl} = createRouter({
        routeA: {path: '/route-a/:a'},
        routeB: {path: '/route-b/:b+'},
      })

      expect(() => buildUrl('routeA')).toThrow('Expected "a" to be a string')
      expect(() => buildUrl('routeB')).toThrow('Expected "b" to be an array')
    })

    test('can build URLs with no params', () => {
      const {buildUrl} = createRouter({
        routeA: {path: '/route-a'},
        routeB: {path: '/route-b/:b*'},
      })

      expect(buildUrl('routeA')).toBe('/route-a')
      expect(buildUrl('routeB')).toBe('/route-b')
    })

    test('can build URLs with path params', () => {
      const {buildUrl} = createRouter({
        routeA: {path: '/route-a/:a'},
      })

      expect(buildUrl('routeA', {a: 'value-a'})).toBe('/route-a/value-a')
      expect(buildUrl('routeA', [['a', 'value-a'], ['a', 'value-b']])).toBe('/route-a/value-a?a=value-b')
    })

    test('can build URLs with repeating path params', () => {
      const {buildUrl} = createRouter({
        routeA: {path: '/route-a/:a+'},
      })

      expect(buildUrl('routeA', {a: 'value-a'})).toBe('/route-a/value-a')
      expect(buildUrl('routeA', [['a', 'value-a'], ['a', 'value-b']])).toBe('/route-a/value-a/value-b')
    })

    test('can build URLs with search params', () => {
      const {buildUrl} = createRouter({
        routeA: {path: '/route-a'},
      })

      expect(buildUrl('routeA', {a: 'value-a'})).toBe('/route-a?a=value-a')
      expect(buildUrl('routeA', [['a', 'value-a'], ['a', 'value-b']])).toBe('/route-a?a=value-a&a=value-b')
    })

    test('can build URLs with path and search params', () => {
      const {buildUrl} = createRouter({
        routeA: {path: '/route-a/:a'},
      })

      expect(buildUrl('routeA', {a: 'value-a', b: 'value-b'})).toBe('/route-a/value-a?b=value-b')
    })

    test('can build URLs from URLSearchParams instances', () => {
      const {buildUrl} = createRouter({
        routeA: {path: '/route-a/:a'},
      })

      expect(buildUrl('routeA', new URLSearchParams({a: 'value-a', b: 'value-b'}))).toBe('/route-a/value-a?b=value-b')
    })
  })
})
