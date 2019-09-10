import {collapseData, createDataPlugin} from './common.js'

export default function createClientDataPlugin (routes) {
  return createDataPlugin(routes, createFetcher)
}

function createFetcher (router) {
  const callbacks = []
  let collapsedData, data

  return {
    getData () {
      if (!collapsedData) throw new Error('Cannot get route data until waitForData() has been called')

      return collapsedData
    },

    getDataState () {
      if (!data) throw new Error('Cannot get route data until waitForData() has been called')

      return data
    },

    handleRoute (toFetch) {
      for (const {segment, startFetch} of toFetch) {
        callbacks.push(() => {
          const fetches = startFetch()
          const fetchResolvers = []

          for (const key in fetches) {
            fetchResolvers.push(
              Promise.resolve(fetches[key]).then(
                result => [null, result, segment, key],
                error => [error, null, segment, key],
              ),
            )
          }

          return Promise.all(fetchResolvers)
        })
      }
    },

    subscribeToData () {
      return {
        unsubscribe: noop,
      }
    },

    async waitForData () {
      const results = await Promise.all(callbacks.map(callback => callback()))
      const flatResults = results.flat()

      const error = buildError(flatResults)
      if (error) throw error

      data = buildData(flatResults)
      collapsedData = collapseData(data)
    },
  }

  function buildError (results) {
    const [error] = results.find(([error]) => error) || []

    if (!error) return null

    const {name} = router.getState()
    error.message = `Unable to fetch route data for ${name}: ${error.message}`

    return error
  }

  function buildData (results) {
    const data = {}

    for (const result of results) {
      const [error, value, segment, key] = result

      data[segment] = data[segment] || {}
      data[segment][key] = [error, value]
    }

    return data
  }
}

function noop () {}
