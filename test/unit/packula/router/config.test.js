import {joinRoute} from '~/src/packula/router/config'

describe('Packula router config', () => {
  describe('joinRoute()', () => {
    test('joins relative route paths with the parent path', () => {
      const joined = joinRoute(
        {name: 'parent', path: '/parent'},
        {name: 'child', path: 'child'},
      )

      expect(joined.path).toBe('/parent/child')
    })

    test('does not join absolute paths with the parent path', () => {
      const joined = joinRoute(
        {name: 'parent', path: '/parent'},
        {name: 'child', path: '/child'},
      )

      expect(joined.path).toBe('/child')
    })

    test('does not join route names', () => {
      const joined = joinRoute(
        {name: 'parent', path: '/parent'},
        {name: 'child', path: '/child'},
      )

      expect(joined.name).toBe('child')
    })

    test('retains additional route properties', () => {
      const joined = joinRoute(
        {name: 'parent', path: '/parent'},
        {name: 'child', path: '/child', additional: 'additional'},
      )

      expect(joined.additional).toBe('additional')
    })
  })
})
