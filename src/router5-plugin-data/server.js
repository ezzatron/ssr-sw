import {createDataPlugin} from './common.js'

export default function createServerDataPlugin (routes) {
  const fetchers = []

  return createDataPlugin({
    routes,

    augmentRouter (router) {
      router.waitForData = async () => {
        await Promise.all(fetchers.map(async fetcher => {
          const {reason, status} = await fetcher()

          if (status === 'rejected') throw reason
        }))
      }
    },

    handleFetcher (fetcher) {
      fetchers.push(fetcher)
    },
  })
}
