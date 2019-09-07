import {collapseSegmentedData} from '../routing.js'

export function createRouteDataFetcher () {
  const fetches = []
  let collapsedData, data, toStateName

  return {
    getData () {
      if (!collapsedData) throw new Error('Cannot get route data until waitUntilFetched() has been called')

      return collapsedData
    },

    getSegmentedData () {
      if (!data) throw new Error('Cannot get route data until waitUntilFetched() has been called')

      return data
    },

    handleRoute (context) {
      const {toState, toUpdate} = context

      toStateName = toState.name

      for (const [segment, fetchData] of toUpdate) {
        const toFetch = fetchData()

        for (const key in toFetch) {
          fetches.push(
            Promise.resolve(toFetch[key]).then(
              result => [null, result, segment, key],
              error => [error, null, segment, key],
            ),
          )
        }
      }
    },

    subscribeToData () {
      return noop
    },

    async waitUntilFetched () {
      const results = await Promise.all(fetches)

      const error = buildError(results)
      if (error) throw error

      data = buildData(results)
      collapsedData = collapseSegmentedData(data)
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

    const error = new Error(`Unable to fetch data for ${toStateName}:\n\n${errorList.join('\n\n')}`)
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
