import {createRouter} from './index.js'
import {createState} from './state.js'

export function createMemoryRouter (routes, initialState) {
  const router = createRouter(routes)
  const {get: getState, go, push, replace, subscribe} = createState(initialState)

  return {
    ...router,

    getState,
    go,
    subscribe,

    back () {
      go(-1)
    },

    forward () {
      go(1)
    },

    navigate (name, options = {}) {
      const {
        params = {},
        replace: isReplace = false,
      } = options

      const fn = isReplace ? replace : push
      fn({name, params})
    },
  }
}
