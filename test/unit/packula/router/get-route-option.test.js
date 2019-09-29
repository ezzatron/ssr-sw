import {createRouter} from '~/src/packula/router'
import {ROOT} from '~/src/packula/router/symbols'

describe('Packula router', () => {
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
