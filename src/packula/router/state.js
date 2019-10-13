export function createState (init) {
  const subscribers = new Set()
  let stack = [init]
  let position = 0
  let state = {current: init}

  return {
    get () {
      return state
    },

    go (offset) {
      const nextPosition = position + offset
      if (!(nextPosition in stack)) return

      position = nextPosition
      state = {current: stack[nextPosition], previous: state.current}
      publish()
    },

    push (value) {
      const discard = position - stack.length + 1
      if (discard) stack = stack.slice(0, discard)

      stack.push(value)
      ++position
      state = {current: stack[position], previous: state.current}
      publish()
    },

    replace (value) {
      stack[position] = value
      state = {current: stack[position], previous: state.current}
      publish()
    },

    subscribe (subscriber, known) {
      subscribers.add(subscriber)
      if (known !== state) subscriber(state)

      return function unsubscribe () {
        subscribers.delete(subscriber)
      }
    },
  }

  function publish () {
    subscribers.forEach(subscriber => subscriber(state))
  }
}
