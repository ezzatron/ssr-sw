import {createDataPlugin} from './common.js'

export default function createServerDataPlugin (routes) {
  const fetchers = []

  return createDataPlugin({
    routes,

    augmentRouter (router) {
      router.waitForData = async () => {
        await Promise.all(fetchers.map(fetcher => fetcher()))
      }
    },

    handleFetcher (fetcher) {
      fetchers.push(fetcher)
    },
  })
}
