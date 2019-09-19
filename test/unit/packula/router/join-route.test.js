import {joinRoute} from '~/src/packula/router/config'

describe('Packula router config', () => {
  describe('joinRoute()', () => {
    test('joins relative route paths with parent paths', () => {
      const joined = joinRoute(
        [
          {name: 'grandparent', path: '/grandparent'},
          {name: 'parent', path: '/parent'},
        ],
        {name: 'child', path: 'child'},
      )

      expect(joined.path).toBe('/parent/child')
    })

    test('joins relative route paths with ancestor paths if intervening ancestors do not define paths', () => {
      const joined = joinRoute(
        [
          {name: 'grandparent', path: '/grandparent'},
          {name: 'parent'},
        ],
        {name: 'child', path: 'child'},
      )

      expect(joined.path).toBe('/grandparent/child')
    })

    test('does not join route names', () => {
      const joined = joinRoute(
        [
          {name: 'grandparent', path: '/grandparent'},
          {name: 'parent', path: '/parent'},
        ],
        {name: 'child', path: '/child'},
      )

      expect(joined.name).toBe('child')
    })

    test('retains additional route properties', () => {
      const joined = joinRoute(
        [
          {name: 'grandparent', path: '/grandparent'},
          {name: 'parent', path: '/parent'},
        ],
        {name: 'child', path: '/child', additional: 'additional'},
      )

      expect(joined.additional).toBe('additional')
    })

    test('returns the route if it has an absolute path', () => {
      const route = {name: 'child', path: '/child'}
      const joined = joinRoute(
        [
          {name: 'grandparent', path: '/grandparent'},
          {name: 'parent', path: '/parent'},
        ],
        route,
      )

      expect(joined).toBe(route)
      expect(joined.path).toBe('/child')
    })

    test('returns the route if it has an undefined path', () => {
      const route = {name: 'child'}
      const joined = joinRoute(
        [
          {name: 'grandparent', path: '/grandparent'},
          {name: 'parent', path: '/parent'},
        ],
        route,
      )

      expect(joined).toBe(route)
      expect(joined.path).toBeUndefined()
    })

    test('returns the route if no ancestors with defined paths are supplied', () => {
      const route = {name: 'child', path: 'child'}
      const joined = joinRoute(
        [
          {name: 'grandparent'},
          {name: 'parent'},
        ],
        route,
      )

      expect(joined).toBe(route)
    })
  })
})
