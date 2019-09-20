import {joinRoute} from '~/src/packula/router/config'

describe('Packula router config', () => {
  describe('joinRoute()', () => {
    test('joins relative route paths with parent paths', () => {
      const [, route] = joinRoute(
        [
          ['grandparent', {path: 'grandparent'}],
          ['parent', {path: 'parent'}],
        ],
        'child',
        {path: 'child'},
      )

      expect(route.path).toBe('parent/child')
    })

    test('joins relative route paths with ancestor paths if intervening ancestors do not define paths', () => {
      const [, route] = joinRoute(
        [
          ['grandparent', {path: 'grandparent'}],
          ['parent', {}],
        ],
        'child',
        {path: 'child'},
      )

      expect(route.path).toBe('grandparent/child')
    })

    test('retains additional route properties', () => {
      const [, route] = joinRoute(
        [
          ['grandparent', {path: 'grandparent'}],
          ['parent', {path: 'parent'}],
        ],
        'child',
        {path: '/child', additional: 'additional'},
      )

      expect(route.additional).toBe('additional')
    })

    test('returns the route if it has an absolute path', () => {
      const child = {path: '/child'}
      const [, route] = joinRoute(
        [
          ['grandparent', {path: 'grandparent'}],
          ['parent', {path: 'parent'}],
        ],
        'child',
        child,
      )

      expect(route).toBe(child)
      expect(route.path).toBe('/child')
    })

    test('returns the route if it has an undefined path', () => {
      const child = {}
      const [, route] = joinRoute(
        [
          ['grandparent', {path: 'grandparent'}],
          ['parent', {path: 'parent'}],
        ],
        'child',
        child,
      )

      expect(route).toBe(child)
      expect(route.path).toBeUndefined()
    })

    test('returns the route if no ancestors with defined paths are supplied', () => {
      const child = {path: 'child'}
      const [, route] = joinRoute(
        [
          ['grandparent', {}],
          ['parent', {}],
        ],
        'child',
        child,
      )

      expect(route).toBe(child)
    })

    test('returns the route name unchanged', () => {
      const [name] = joinRoute(
        [
          ['grandparent', {path: 'grandparent'}],
          ['parent', {path: 'parent'}],
        ],
        'child',
        {path: 'child'},
      )

      expect(name).toBe('child')
    })
  })
})
