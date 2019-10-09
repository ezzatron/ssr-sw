export function createState (init) {
  const subscribers = new Set()
  let stack = [init]
  let position = 0

  return {
    get () {
      return stack[position]
    },

    go (offset) {
      const nextPosition = position + offset
      if (!(nextPosition in stack)) return

      position = nextPosition
      publish()
    },

    push (value) {
      const discard = position - stack.length + 1
      if (discard) stack = stack.slice(0, discard)

      stack.push(value)
      ++position
      publish()
    },

    replace (value) {
      stack[position] = value
      publish()
    },

    subscribe (subscriber, known) {
      subscribers.add(subscriber)

      const current = stack[position]
      if (known !== current) subscriber(current)

      return function unsubscribe () {
        subscribers.delete(subscriber)
      }
    },
  }

  function publish () {
    const current = stack[position]
    subscribers.forEach(subscriber => subscriber(current))
  }
}
