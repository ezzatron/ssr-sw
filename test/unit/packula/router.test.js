import {createRouter} from '~/src/packula/router.js'

describe('Packula router', () => {
  const routeA = {name: 'a', path: '/a/:id'}
  const router = createRouter([routeA])

  test('builds URLs', () => {
    expect(router.build('a', {id: '111', w: 'x', y: 'z'})).toBe('/a/111?w=x&y=z')
  })

  test('resolves URLs', () => {
    expect(router.resolve('/a/111?w=x&y=z')).toEqual({route: routeA, params: {id: '111', w: 'x', y: 'z'}})
  })
})
