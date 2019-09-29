export function createState (init) {
  const subscribers = new Set()
  let current = init

  const state = {
    subscribe (subscriber, known) {
      subscribers.add(subscriber)
      if (known !== current) subscriber(current)

      return function unsubscribe () {
        subscribers.delete(subscriber)
      }
    },
  }

  Object.defineProperty(state, 'current', {
    get () {
      return current
    },

    set (next) {
      current = next
      subscribers.forEach(subscriber => { subscriber(next) })
    },
  })

  return state
}
