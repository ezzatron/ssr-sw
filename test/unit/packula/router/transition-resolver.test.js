import {createTransitionResolver} from '~/src/packula/router/transition-resolver'
import {createRouter} from '~/src/packula/router'
import {ROOT} from '~/src/packula/router/symbols'

describe('Packula router transition resolver', () => {
  describe('routeNodes()', () => {
    test('throws when an undefined to route is passed', () => {
      const {routeNodes} = createTransitionResolver(createRouter({}))

      expect(() => routeNodes('routeA')).toThrow('Undefined route "routeA"')
    })

    test('returns route nodes', () => {
      const {routeNodes} = createTransitionResolver(createRouter({
        routeA: {},
        routeB: {parent: 'routeA'},
        routeC: {parent: 'routeB'},
      }))

      expect(routeNodes(ROOT)).toStrictEqual([ROOT])
      expect(routeNodes('routeA')).toStrictEqual([ROOT, 'routeA'])
      expect(routeNodes('routeB')).toStrictEqual([ROOT, 'routeA', 'routeB'])
      expect(routeNodes('routeC')).toStrictEqual([ROOT, 'routeA', 'routeB', 'routeC'])
    })
  })
})
