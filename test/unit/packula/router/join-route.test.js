import {joinRoute} from '~/src/packula/router/config'

describe('Packula router config', () => {
  describe('joinRoute()', () => {
    test('joins relative route paths with parent paths', () => {
      const joined = joinRoute(
        [
          ['grandparent', {path: 'grandparent'}],
          ['parent', {path: 'parent'}],
        ],
        'child',
        {path: 'child'},
      )

      expect(joined[1].path).toBe('parent/child')
    })

    test('joins relative route paths with ancestor paths if intervening ancestors do not define paths', () => {
      const joined = joinRoute(
        [
          ['grandparent', {path: 'grandparent'}],
          ['parent', {}],
        ],
        'child',
        {path: 'child'},
      )

      expect(joined[1].path).toBe('grandparent/child')
    })

    test('retains additional route properties', () => {
      const joined = joinRoute(
        [
          ['grandparent', {path: 'grandparent'}],
          ['parent', {path: 'parent'}],
        ],
        'child',
        {path: '/child', additional: 'additional'},
      )

      expect(joined[1].additional).toBe('additional')
    })

    test('returns the route if it has an absolute path', () => {
      const route = {path: '/child'}
      const joined = joinRoute(
        [
          ['grandparent', {path: 'grandparent'}],
          ['parent', {path: 'parent'}],
        ],
        'child',
        route,
      )

      expect(joined[1]).toBe(route)
      expect(joined[1].path).toBe('/child')
    })

    test('returns the route if it has an undefined path', () => {
      const route = {}
      const joined = joinRoute(
        [
          ['grandparent', {path: 'grandparent'}],
          ['parent', {path: 'parent'}],
        ],
        'child',
        route,
      )

      expect(joined[1]).toBe(route)
      expect(joined[1].path).toBeUndefined()
    })

    test('returns the route if no ancestors with defined paths are supplied', () => {
      const route = {path: 'child'}
      const joined = joinRoute(
        [
          ['grandparent', {}],
          ['parent', {}],
        ],
        'child',
        route,
      )

      expect(joined[1]).toBe(route)
    })
  })
})
