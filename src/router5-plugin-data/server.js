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
    const errors = results.filter(([error]) => error)

    if (errors.length < 1) return null

    const errorList = errors.map(([segment, key, error]) => {
      const message = error.stack || '' + error
      const lines = message.split('\n').map(line => `  ${line}`).join('\n')

      return `- Fetching "${key}" for route segment "${segment}" failed:\n\n${lines}`
    })

    const {name} = router.getState()

    const error = new Error(`Unable to fetch data for ${name}:\n\n${errorList.join('\n\n')}`)
    error.isDataError = true
    error.errors = errors
    error.stack = ''

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
