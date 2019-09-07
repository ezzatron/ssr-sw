export function createRouteDataFetcher () {
  const fetches = []
  let toStateName

  return {
    async resolveData () {
      const results = await Promise.all(fetches)

      const error = buildError(results)
      if (error) throw error

      return buildData(results)
    },

    routeDataHandler (context) {
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
