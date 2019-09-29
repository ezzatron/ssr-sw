import {joinRoute} from '~/src/packula/router/config'

describe('Packula router', () => {
  describe('joinRoute()', () => {
    test('sets the parent property to the parent route name', () => {
      const [, route] = joinRoute(
        [
          ['grandparent', {path: 'grandparent'}],
          ['parent', {path: 'parent'}],
        ],
        'child',
        {path: 'child'},
      )

      expect(route.parent).toBe('parent')
    })

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
    test('sets the parent property to the parent route name even the parent has an undefined path', () => {
      const [, route] = joinRoute(
        [
          ['grandparent', {path: 'grandparent'}],
          ['parent', {}],
        ],
        'child',
        {path: 'child'},
      )

      expect(route.parent).toBe('parent')
    })

    test('retains route options', () => {
      const options = {a: 'b'}
      const [, route] = joinRoute(
        [
          ['grandparent', {path: 'grandparent'}],
          ['parent', {path: 'parent'}],
        ],
        'child',
        {path: '/child', options},
      )

      expect(route.options).toBe(options)
    })

    test('does not modify the route path if it is absolute', () => {
      const [, route] = joinRoute(
        [
          ['grandparent', {path: 'grandparent'}],
          ['parent', {path: 'parent'}],
        ],
        'child',
        {path: '/child'},
      )

      expect(route.path).toBe('/child')
    })

    test('does not modify the route path if it is undefined', () => {
      const [, route] = joinRoute(
        [
          ['grandparent', {path: 'grandparent'}],
          ['parent', {path: 'parent'}],
        ],
        'child',
        {},
      )

      expect(route.path).toBeUndefined()
    })

    test('does not modify the route path if no ancestors with defined paths are supplied', () => {
      const [, route] = joinRoute(
        [
          ['grandparent', {}],
          ['parent', {}],
        ],
        'child',
        {path: 'child'},
      )

      expect(route.path).toBe('child')
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

    test('throws if no ancestors are supplied', () => {
      expect(() => joinRoute([], {})).toThrow('No ancestors supplied')
    })
  })
})
