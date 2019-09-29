import {createRouter} from '~/src/packula/router'
import {ROOT} from '~/src/packula/router/symbols'

describe('Packula router', () => {
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
})
