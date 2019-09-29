import {createTransitionResolver} from '~/src/packula/router/transition-resolver'
import {createRouter} from '~/src/packula/router'
import {ROOT} from '~/src/packula/router/symbols'

describe('Packula router', () => {
  describe('routeTransition()', () => {
    test('throws when an undefined from route is passed', () => {
      const {routeTransition} = createTransitionResolver(createRouter({
        routeB: {path: '/route-b'},
      }))

      expect(() => routeTransition('routeA', 'routeB')).toThrow('Undefined route routeA')
    })

    test('throws when an undefined to route is passed', () => {
      const {routeTransition} = createTransitionResolver(createRouter({
        routeA: {path: '/route-a'},
      }))

      expect(() => routeTransition('routeA', 'routeB')).toThrow('Undefined route routeB')
    })

    test('returns correct route nodes when an empty value is passed as the from parameter', () => {
      const {routeTransition} = createTransitionResolver(createRouter({
        routeA: {},
        routeB: {parent: 'routeA'},
        routeC: {parent: 'routeB'},
      }))

      expect(routeTransition(null, 'routeA')).toStrictEqual({
        intersection: [],
        toActivate: [ROOT, 'routeA'],
        toDeactivate: [],
      })
      expect(routeTransition(null, 'routeB')).toStrictEqual({
        intersection: [],
        toActivate: [ROOT, 'routeA', 'routeB'],
        toDeactivate: [],
      })
      expect(routeTransition(null, 'routeC')).toStrictEqual({
        intersection: [],
        toActivate: [ROOT, 'routeA', 'routeB', 'routeC'],
        toDeactivate: [],
      })
    })

    test('returns correct route nodes for a transition to a child', () => {
      const {routeTransition} = createTransitionResolver(createRouter({
        routeA: {},
        routeB: {parent: 'routeA'},
      }))

      expect(routeTransition('routeA', 'routeB')).toStrictEqual({
        intersection: [ROOT, 'routeA'],
        toActivate: ['routeB'],
        toDeactivate: [],
      })
    })

    test('returns correct route nodes for a transition from a child', () => {
      const {routeTransition} = createTransitionResolver(createRouter({
        routeA: {},
        routeB: {parent: 'routeA'},
      }))

      expect(routeTransition('routeB', 'routeA')).toStrictEqual({
        intersection: [ROOT, 'routeA'],
        toActivate: [],
        toDeactivate: ['routeB'],
      })
    })

    test('returns correct route nodes for a transition to a grandchild', () => {
      const {routeTransition} = createTransitionResolver(createRouter({
        routeA: {},
        routeB: {parent: 'routeA'},
        routeC: {parent: 'routeB'},
      }))

      expect(routeTransition('routeA', 'routeC')).toStrictEqual({
        intersection: [ROOT, 'routeA'],
        toActivate: ['routeB', 'routeC'],
        toDeactivate: [],
      })
    })

    test('returns correct route nodes for a transition from a grandchild', () => {
      const {routeTransition} = createTransitionResolver(createRouter({
        routeA: {},
        routeB: {parent: 'routeA'},
        routeC: {parent: 'routeB'},
      }))

      expect(routeTransition('routeC', 'routeA')).toStrictEqual({
        intersection: [ROOT, 'routeA'],
        toActivate: [],
        toDeactivate: ['routeC', 'routeB'],
      })
    })

    test('returns correct route nodes for a transition between siblings', () => {
      const {routeTransition} = createTransitionResolver(createRouter({
        routeA: {},
        routeB: {parent: 'routeA'},
        routeC: {parent: 'routeA'},
      }))

      expect(routeTransition('routeB', 'routeC')).toStrictEqual({
        intersection: [ROOT, 'routeA'],
        toActivate: ['routeC'],
        toDeactivate: ['routeB'],
      })
    })

    test('returns correct route nodes for a transition between cousins', () => {
      const {routeTransition} = createTransitionResolver(createRouter({
        routeA: {},
        routeB: {parent: 'routeA'},
        routeC: {parent: 'routeB'},
        routeD: {parent: 'routeA'},
        routeE: {parent: 'routeD'},
      }))

      expect(routeTransition('routeC', 'routeE')).toStrictEqual({
        intersection: [ROOT, 'routeA'],
        toActivate: ['routeD', 'routeE'],
        toDeactivate: ['routeC', 'routeB'],
      })
    })
  })
})
