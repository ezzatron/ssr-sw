import {flattenRoutes} from '~/src/packula/router/config'

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
                nodeAAB: {path: 'node-a-a-b'},
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
            nodeBB: {path: 'node-b-b'},
          },
        },
      }
      const flat = flattenRoutes(nested)

      expect(flat.nodeA).toEqual({path: 'node-a'})
      expect(flat.nodeAA).toEqual({path: 'node-a/node-a-a'})
      expect(flat.nodeAAA).toEqual({path: 'node-a/node-a-a/node-a-a-a'})
      expect(flat.nodeAAB).toEqual({path: 'node-a/node-a-a/node-a-a-b'})
      expect(flat.nodeAB).toEqual({path: 'node-a/node-a-b'})
      expect(flat.nodeB).toEqual({path: 'node-b'})
      expect(flat.nodeBA).toEqual({path: 'node-b/node-b-a'})
      expect(flat.nodeBB).toEqual({path: 'node-b/node-b-b'})
    })
  })
})
