import {createState} from '~/src/packula/router/state'

describe('Packula router', () => {
  describe('createState()', () => {
    test('handles initial state', () => {
      const state = createState('a')

      expect(state.current).toBe('a')
    })

    test('handles undefined initial state', () => {
      const state = createState()

      expect(state.current).toBeUndefined()
    })

    test('handles setting state', () => {
      const state = createState('a')
      state.current = 'b'

      expect(state.current).toBe('b')
    })

    test('publishes updates to subscribers when the value changes', () => {
      const state = createState('a')
      const updates = []
      state.subscribe(current => { updates.push(current + '1') }, 'a')
      state.subscribe(current => { updates.push(current + '2') }, 'x')
      state.current = 'b'
      state.current = 'c'

      expect(updates).toStrictEqual(['a2', 'b1', 'b2', 'c1', 'c2'])
    })

    test('allows unsubscription from updates', () => {
      const state = createState('a')
      const updates = []
      const unsubscribe = state.subscribe(current => { updates.push(current) })
      state.current = 'b'
      unsubscribe()
      state.current = 'c'

      expect(updates).toStrictEqual(['a', 'b'])
    })
  })
})
