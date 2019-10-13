import {createRouter} from './index.js'
import {createState} from './state.js'
import {createUrlBuilder} from './url-builder'
import {createUrlResolver} from './url-resolver'
import {ROOT, UNKNOWN} from './symbols'

export function createMemoryRouter (routes, initialState) {
  const router = createRouter(routes)
  const buildUrl = createUrlBuilder(router)
  const resolveUrl = createUrlResolver(router)
  const {get: getState, go, push, replace, subscribe} = createState(initialState)

  return {
    ...router,

    ROOT,
    UNKNOWN,

    buildUrl,
    getState,
    go,
    resolveUrl,
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
