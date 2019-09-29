import {flattenRoutes} from '~/src/packula/router/config'
import {normalizeRoutes} from '~/src/packula/router/normalization'
import {ROOT} from '~/src/packula/router/symbols'

describe('Packula router config', () => {
  describe('flattenRoutes()', () => {
    test('flattens nested routes', () => {
      const nested = {
        nodeA: {
          path: 'node-a',
          children: {
            nodeAA: {
              path: 'node-a-a',
              children: {
                nodeAAA: {path: 'node-a-a-a'},
                nodeAAB: {path: '/node-a-a-b'},
              },
            },
            nodeAB: {
              path: 'node-a-b',
            },
          },
        },
        nodeB: {
          path: 'node-b',
          children: {
            nodeBA: {path: 'node-b-a'},
            nodeBB: {path: '/node-b-b'},
          },
        },
      }
      const flat = normalizeRoutes(flattenRoutes(nested))

      expect(flat.nodeA).toStrictEqual({parent: ROOT, path: '/node-a', options: {}})
      expect(flat.nodeAA).toStrictEqual({parent: 'nodeA', path: '/node-a/node-a-a', options: {}})
      expect(flat.nodeAAA).toStrictEqual({parent: 'nodeAA', path: '/node-a/node-a-a/node-a-a-a', options: {}})
      expect(flat.nodeAAB).toStrictEqual({parent: 'nodeAA', path: '/node-a-a-b', options: {}})
      expect(flat.nodeAB).toStrictEqual({parent: 'nodeA', path: '/node-a/node-a-b', options: {}})
      expect(flat.nodeB).toStrictEqual({parent: ROOT, path: '/node-b', options: {}})
      expect(flat.nodeBA).toStrictEqual({parent: 'nodeB', path: '/node-b/node-b-a', options: {}})
      expect(flat.nodeBB).toStrictEqual({parent: 'nodeB', path: '/node-b-b', options: {}})
    })

    test('supports routes with no defined path', () => {
      const nested = {
        nodeA: {
          path: 'node-a',
          children: {
            nodeAA: {
              children: {
                nodeAAA: {path: 'node-a-a-a'},
              },
            },
          },
        },
        nodeB: {
          children: {
            nodeBA: {
              children: {
                nodeBAA: {path: 'node-b-a-a'},
              },
            },
          },
        },
      }
      const flat = normalizeRoutes(flattenRoutes(nested))

      expect(flat.nodeAAA).toStrictEqual({parent: 'nodeAA', path: '/node-a/node-a-a-a', options: {}})
      expect(flat.nodeBAA).toStrictEqual({parent: 'nodeBA', path: '/node-b-a-a', options: {}})
    })

    test('creates a default root route', () => {
      const flat = normalizeRoutes(flattenRoutes({}))

      expect(flat[ROOT]).toStrictEqual({options: {}})
    })

    test('supports configuring the root route', () => {
      const root = {path: 'ignored', options: {a: 'b'}}
      const nested = {
        [ROOT]: root,
        nodeA: {path: 'node-a'},
      }
      const flat = normalizeRoutes(flattenRoutes(nested))

      expect(flat[ROOT]).toStrictEqual({options: root.options})
      expect(flat.nodeA).toStrictEqual({parent: ROOT, path: '/node-a', options: {}})
    })

    test('supports custom joinRoute functions', () => {
      const nested = {
        nodeA: {
          path: 'node-a',
          children: {
            nodeAA: {
              path: 'node-a-a',
            },
          },
        },
      }
      const flat = normalizeRoutes(flattenRoutes(nested, {
        joinRoute (ancestors, name, route) {
          const [parentName] = ancestors[ancestors.length - 1]
          const joinedName = parentName === ROOT ? name : `${parentName}_${name}`

          return [joinedName, route]
        },
      }))

      expect(flat.nodeA).toStrictEqual({parent: ROOT, path: 'node-a', options: {}})
      expect(flat.nodeA_nodeAA).toStrictEqual({parent: ROOT, path: 'node-a-a', options: {}})
    })
  })
})
