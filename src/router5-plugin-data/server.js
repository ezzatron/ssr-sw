import {createDataPlugin} from './common.js'

export default function createServerDataPlugin (routes) {
  const fetchers = []

  return createDataPlugin({
    routes,

    augmentRouter (router, dataManager) {
      router.waitForData = () => {
        return Promise.all(fetchers.map(fetcher => fetcher()))
      }

      router.fulfillAllData = () => {
        const state = dataManager.getState()

        for (const name in state) {
          const routeState = state[name]

          for (const key in routeState) {
            const {reason, status, value} = routeState[key]

            if (status === 'rejected') throw reason
            if (status !== 'fulfilled') throw new Error(`Route data for route ${name} key ${key} is pending`)

            routeState[key] = value
          }
        }

        return state
      }
    },

    handleFetcher (fetcher) {
      fetchers.push(fetcher)
    },
  })
}
