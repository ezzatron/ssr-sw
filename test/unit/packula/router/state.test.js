import {createState} from '~/src/packula/router/state'

describe('Packula router', () => {
  describe('createState()', () => {
    test('handles initial state', () => {
      const state = createState('a')

      expect(state.get()).toBe('a')
    })

    test('handles undefined initial state', () => {
      const state = createState()

      expect(state.get()).toBeUndefined()
    })

    test('handles pushing state', () => {
      const state = createState('a')
      state.push('b')

      expect(state.get()).toBe('b')
    })

    test('handles replacing state', () => {
      const state = createState('a')
      state.replace('b')

      expect(state.get()).toBe('b')
    })

    test('overwrites history when replacing', () => {
      const state = createState('a')
      state.push('b')
      state.replace('c')
      state.go(-1)

      expect(state.get()).toBe('a')
    })

    test('ignores attempts to traverse backwards to undefined states', () => {
      const state = createState('a')
      state.push('b')
      state.push('c')
      state.go(-111)

      expect(state.get()).toBe('c')
    })

    test('ignores attempts to traverse forwards to undefined states', () => {
      const state = createState('a')
      state.push('b')
      state.push('c')
      state.go(-2)
      state.go(111)

      expect(state.get()).toBe('a')
    })

    test('can go back to earlier states', () => {
      const state = createState('a')
      state.push('b')
      state.push('c')
      state.go(-2)

      expect(state.get()).toBe('a')
    })

    test('can go forward to later states', () => {
      const state = createState('a')
      state.push('b')
      state.push('c')
      state.go(-2)
      state.go(1)

      expect(state.get()).toBe('b')
    })

    test('overwrites history when pushing after going back to earlier states', () => {
      const state = createState('a')
      state.push('b')
      state.push('c')
      state.go(-2)
      state.push('d')
      state.push('e')
      state.go(-1)

      expect(state.get()).toBe('d')
    })

    test('immediately publishes an update if the known state does not match the current state', () => {
      const state = createState('a')
      const updates = []
      state.subscribe(current => { updates.push(current) }, 'x')

      expect(updates).toStrictEqual(['a'])
    })

    test('publishes updates to subscribers on stack traversal', () => {
      const state = createState('a')
      state.push('b')
      state.push('c')
      const updates = []
      state.subscribe(current => { updates.push(current) }, state.get())
      state.go(-1)
      state.go(1)

      expect(updates).toStrictEqual(['b', 'c'])
    })

    test('publishes updates to subscribers on push', () => {
      const state = createState('a')
      const updates = []
      state.subscribe(current => { updates.push(current) }, state.get())
      state.push('b')
      state.push('c')

      expect(updates).toStrictEqual(['b', 'c'])
    })

    test('publishes updates to subscribers on replace', () => {
      const state = createState('a')
      const updates = []
      state.subscribe(current => { updates.push(current) }, state.get())
      state.replace('b')
      state.replace('c')

      expect(updates).toStrictEqual(['b', 'c'])
    })

    test('allows unsubscription from updates', () => {
      const state = createState('a')
      const updates = []
      const unsubscribe = state.subscribe(current => { updates.push(current) }, state.get())
      state.push('b')
      unsubscribe()
      state.push('c')

      expect(updates).toStrictEqual(['b'])
    })
  })
})
