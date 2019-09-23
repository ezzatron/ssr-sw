import {createRouter} from '~/src/packula/router'
import {createUrlResolver} from '~/src/packula/router/url-resolver'
import {UNKNOWN} from '~/src/packula/router/symbols'

describe('Packula router', () => {
  describe('resolveUrl()', () => {
    test('throws when an invalid URL is passed', () => {
      const resolveUrl = createUrlResolver(createRouter({}))

      expect(() => resolveUrl('http://')).toThrow('Invalid URL')
    })

    test('can handle URLs that do not resolve to a known route', () => {
      const resolveUrl = createUrlResolver(createRouter({
        routeA: {path: '/route-a'},
      }))
      const resolutionA = resolveUrl('/nonexistent')
      const resolutionB = resolveUrl('/nonexistent?a=value-a')

      expect(resolutionA.name).toBe(UNKNOWN)
      expect(Array.from(resolutionA.params.entries())).toHaveLength(0)
      expect(resolutionB.name).toBe(UNKNOWN)
      expect(resolutionB.params.get('a')).toBe('value-a')
    })

    test('can resolve URLs with no params', () => {
      const resolveUrl = createUrlResolver(createRouter({
        routeA: {path: '/route-a'},
        routeB: {path: '/route-b/:b?'},
        routeC: {path: '/route-c/:c*'},
      }))
      const resolutionA = resolveUrl('/route-a')
      const resolutionB = resolveUrl('/route-b')
      const resolutionC = resolveUrl('/route-c')

      expect(resolutionA.name).toBe('routeA')
      expect(Array.from(resolutionA.params.entries())).toHaveLength(0)
      expect(resolutionB.name).toBe('routeB')
      expect(Array.from(resolutionB.params.entries())).toHaveLength(0)
      expect(resolutionC.name).toBe('routeC')
      expect(Array.from(resolutionC.params.entries())).toHaveLength(0)
    })

    test('can resolve URLs with path params', () => {
      const resolveUrl = createUrlResolver(createRouter({
        routeA: {path: '/route-a/:a'},
      }))
      const resolutionA = resolveUrl('/route-a/value-a')
      const resolutionB = resolveUrl('/route-a/value-a?a=value-b')

      expect(resolutionA.name).toBe('routeA')
      expect(resolutionA.params.get('a')).toBe('value-a')
      expect(resolutionB.name).toBe('routeA')
      expect(resolutionB.params.get('a')).toBe('value-a')
      expect(Array.from(resolutionB.params.getAll('a'))).toStrictEqual(['value-a', 'value-b'])
    })

    test('can resolve URLs with optional path params', () => {
      const resolveUrl = createUrlResolver(createRouter({
        routeA: {path: '/route-a/:a?'},
      }))
      const resolutionA = resolveUrl('/route-a')
      const resolutionB = resolveUrl('/route-a/value-a')
      const resolutionC = resolveUrl('/route-a/value-a?a=value-b')

      expect(resolutionA.name).toBe('routeA')
      expect(resolutionA.params.has('a')).toBe(false)
      expect(resolutionB.name).toBe('routeA')
      expect(resolutionB.params.get('a')).toBe('value-a')
      expect(resolutionC.name).toBe('routeA')
      expect(resolutionC.params.get('a')).toBe('value-a')
      expect(Array.from(resolutionC.params.getAll('a'))).toStrictEqual(['value-a', 'value-b'])
    })

    test('can resolve URLs with unnamed path params', () => {
      const resolveUrl = createUrlResolver(createRouter({
        routeA: {path: '/route-a/(.*)'},
      }))
      const resolutionA = resolveUrl('/route-a/value-a')
      const resolutionB = resolveUrl('/route-a/value-a?0=value-b')

      expect(resolutionA.name).toBe('routeA')
      expect(resolutionA.params.get('0')).toBe('value-a')
      expect(resolutionB.name).toBe('routeA')
      expect(resolutionB.params.get('0')).toBe('value-a')
      expect(Array.from(resolutionB.params.getAll('0'))).toStrictEqual(['value-a', 'value-b'])
    })

    test('can resolve URLs with custom path params', () => {
      const resolveUrl = createUrlResolver(createRouter({
        routeA: {path: '/route-a-:a(\\d+).x'},
      }))
      const resolutionA = resolveUrl('/route-a-111.x')
      const resolutionB = resolveUrl('/route-a-111.x?a=value-a')

      expect(resolutionA.name).toBe('routeA')
      expect(resolutionA.params.get('a')).toBe('111')
      expect(resolutionB.name).toBe('routeA')
      expect(resolutionB.params.get('a')).toBe('111')
      expect(Array.from(resolutionB.params.getAll('a'))).toStrictEqual(['111', 'value-a'])
    })

    test('can resolve URLs with repeating path params', () => {
      const resolveUrl = createUrlResolver(createRouter({
        routeA: {path: '/route-a/:a*'},
        routeB: {path: '/route-b/:a+'},
      }))
      const resolutionA = resolveUrl('/route-a/value-a')
      const resolutionB = resolveUrl('/route-b/value-a')
      const resolutionC = resolveUrl('/route-a/value-a/value-b')
      const resolutionD = resolveUrl('/route-b/value-a/value-b')

      expect(resolutionA.name).toBe('routeA')
      expect(Array.from(resolutionA.params.getAll('a'))).toStrictEqual(['value-a'])
      expect(resolutionB.name).toBe('routeB')
      expect(Array.from(resolutionB.params.getAll('a'))).toStrictEqual(['value-a'])
      expect(resolutionC.name).toBe('routeA')
      expect(Array.from(resolutionC.params.getAll('a'))).toStrictEqual(['value-a', 'value-b'])
      expect(resolutionD.name).toBe('routeB')
      expect(Array.from(resolutionD.params.getAll('a'))).toStrictEqual(['value-a', 'value-b'])
    })

    test('can resolve URLs with search params', () => {
      const resolveUrl = createUrlResolver(createRouter({
        routeA: {path: '/route-a'},
      }))
      const resolutionA = resolveUrl('/route-a?a=value-a')
      const resolutionB = resolveUrl('/route-a?a=value-a&a=value-b')

      expect(resolutionA.name).toBe('routeA')
      expect(resolutionA.params.get('a')).toBe('value-a')
      expect(resolutionB.name).toBe('routeA')
      expect(Array.from(resolutionB.params.getAll('a'))).toStrictEqual(['value-a', 'value-b'])
    })

    test('can resolve URLs with path and search params', () => {
      const resolveUrl = createUrlResolver(createRouter({
        routeA: {path: '/route-a/:a'},
      }))
      const resolutionA = resolveUrl('/route-a/value-a?b=value-b')

      expect(resolutionA.name).toBe('routeA')
      expect(resolutionA.params.get('a')).toBe('value-a')
      expect(resolutionA.params.get('b')).toBe('value-b')
    })

    test('can resolve URLs from URL instances', () => {
      const resolveUrl = createUrlResolver(createRouter({
        routeA: {path: '/route-a/:a'},
      }))
      const resolutionA = resolveUrl(new URL('https://example.org/route-a/value-a?b=value-b'))

      expect(resolutionA.name).toBe('routeA')
      expect(resolutionA.params.get('a')).toBe('value-a')
      expect(resolutionA.params.get('b')).toBe('value-b')
    })
  })
})
