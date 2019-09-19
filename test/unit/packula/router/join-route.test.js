import {joinRoute} from '~/src/packula/router/config'

describe('Packula router config', () => {
  describe('joinRoute()', () => {
    test('joins relative route paths with parent paths', () => {
      const joined = joinRoute(
        [
          {path: 'grandparent'},
          {path: 'parent'},
        ],
        {path: 'child'},
      )

      expect(joined.path).toBe('parent/child')
    })

    test('joins relative route paths with ancestor paths if intervening ancestors do not define paths', () => {
      const joined = joinRoute(
        [
          {path: 'grandparent'},
          {},
        ],
        {path: 'child'},
      )

      expect(joined.path).toBe('grandparent/child')
    })

    test('retains additional route properties', () => {
      const joined = joinRoute(
        [
          {path: 'grandparent'},
          {path: 'parent'},
        ],
        {path: '/child', additional: 'additional'},
      )

      expect(joined.additional).toBe('additional')
    })

    test('returns the route if it has an absolute path', () => {
      const route = {path: '/child'}
      const joined = joinRoute(
        [
          {path: 'grandparent'},
          {path: 'parent'},
        ],
        route,
      )

      expect(joined).toBe(route)
      expect(joined.path).toBe('/child')
    })

    test('returns the route if it has an undefined path', () => {
      const route = {}
      const joined = joinRoute(
        [
          {path: 'grandparent'},
          {path: 'parent'},
        ],
        route,
      )

      expect(joined).toBe(route)
      expect(joined.path).toBeUndefined()
    })

    test('returns the route if no ancestors with defined paths are supplied', () => {
      const route = {path: 'child'}
      const joined = joinRoute(
        [
          {},
          {},
        ],
        route,
      )

      expect(joined).toBe(route)
    })
  })
})
