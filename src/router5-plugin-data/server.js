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

    handleRoute (toUpdate) {
      for (const [segment, fetchData] of toUpdate) {
        const toFetch = fetchData()

        for (const key in toFetch) {
          callbacks.push(() => {
            return Promise.resolve(toFetch[key]).then(
              result => [null, result, segment, key],
              error => [error, null, segment, key],
            )
          })
        }
      }
    },

    subscribeToData () {
      return {
        unsubscribe: noop,
      }
    },

    async waitForData () {
      const results = await Promise.all(callbacks.map(callback => callback()))

      const error = buildError(results)
      if (error) throw error

      data = buildData(results)
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