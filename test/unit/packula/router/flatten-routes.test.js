import {flattenRoutes, ROOT} from '~/src/packula/router/config'

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
      const flat = flattenRoutes(nested)

      expect(flat.nodeA).toEqual({path: '/node-a'})
      expect(flat.nodeAA).toEqual({path: '/node-a/node-a-a'})
      expect(flat.nodeAAA).toEqual({path: '/node-a/node-a-a/node-a-a-a'})
      expect(flat.nodeAAB).toEqual({path: '/node-a-a-b'})
      expect(flat.nodeAB).toEqual({path: '/node-a/node-a-b'})
      expect(flat.nodeB).toEqual({path: '/node-b'})
      expect(flat.nodeBA).toEqual({path: '/node-b/node-b-a'})
      expect(flat.nodeBB).toEqual({path: '/node-b-b'})
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
      const flat = flattenRoutes(nested)

      expect(flat.nodeAAA).toEqual({path: '/node-a/node-a-a-a'})
      expect(flat.nodeBAA).toEqual({path: '/node-b-a-a'})
    })

    test('supports configuring the root route', () => {
      const root = {path: 'ignored', a: 'b'}
      const nested = {
        [ROOT]: root,
        nodeA: {path: 'node-a'},
      }
      const flat = flattenRoutes(nested)

      expect(flat[ROOT]).toBe(root)
      expect(flat.nodeA).toEqual({path: '/node-a'})
    })
  })
})
