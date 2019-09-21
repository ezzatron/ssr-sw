import {createRouter, ROOT} from '~/src/packula/router'

describe('Packula router', () => {
  describe('createRouter()', () => {
    test('throws if invalid routes are supplied', () => {
      expect(() => createRouter()).toThrow('Invalid routes')
      expect(() => createRouter(null)).toThrow('Invalid routes')
      expect(() => createRouter('')).toThrow('Invalid routes')
      expect(() => createRouter(true)).toThrow('Invalid routes')
      expect(() => createRouter(1)).toThrow('Invalid routes')
    })

    test('adds a root route if necessary', () => {
      const {routes} = createRouter({})

      expect(routes[ROOT]).toStrictEqual({})
    })

    test('preserves any supplied root route', () => {
      const root = {}
      const {routes} = createRouter({[ROOT]: root})

      expect(routes[ROOT]).toBe(root)
    })
  })
})
