export function createDataFetcher () {
  const fetches = []
  let toStateName

  return {
    async resolveData () {
      const results = await Promise.all(fetches)
      const errors = results.filter(([error]) => error)

      if (errors.length > 0) throw buildError(errors)

      return buildData(results)
    },

    routeDataHandler (toState, toUpdate) {
      toStateName = toState.name

      for (const [segment, fetchData] of toUpdate) {
        const toFetch = fetchData()

        for (const key in toFetch) {
          fetches.push(
            Promise.resolve(toFetch[key]).then(
              result => [undefined, result, segment, key],
              error => [error, undefined, segment, key],
            ),
          )
        }
      }
    },
  }

  function buildError (errors) {
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
      const [, value, segment, key] = result

      data[segment] = data[segment] || {}
      data[segment][key] = value
    }

    return data
  }
}
