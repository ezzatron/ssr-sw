/* eslint-env browser */

import {createDataPlugin} from './common.js'

export default function createClientDataPlugin (routes, initialData) {
  const createAbortController = 'AbortController' in window
    ? () => new AbortController()
    : () => {}

  return createDataPlugin({
    initialData,
    routes,

    handleFetcher (fetcher) {
      fetcher(createAbortController())
    },
  })
}
