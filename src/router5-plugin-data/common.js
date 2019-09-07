import transitionPath from 'router5-transition-path'

export function collapseData (dataByRoute) {
  const data = {}
  for (const segment in dataByRoute) Object.assign(data, dataByRoute[segment])

  return data
}

export function createDataPlugin (routes, createFetcher, data) {
  return function dataPlugin (router) {
    const {getData, getDataState, handleRoute, subscribeToData, waitForData} = createFetcher(router, data)

    Object.assign(router, {getData, getDataState, subscribeToData})
    if (waitForData) router.waitForData = waitForData

    router.useMiddleware(createDataMiddleware(routes, handleRoute))

    return {}
  }
}

function createDataMiddleware (routes, handleRoute) {
  const fetchDataByRoute = routes.reduce((byRoute, route) => {
    const {fetchData, name} = route
    if (fetchData) byRoute[name] = fetchData

    return byRoute
  }, {})

  return function dataMiddleware (router, dependencies) {
    return (toState, fromState) => {
      const {toActivate, toDeactivate} = transitionPath(toState, fromState)
      if (!fromState) toActivate.unshift('')

      const toRemove = toDeactivate.filter(segment => fetchDataByRoute[segment])
      const toUpdate = toActivate
        .filter(segment => fetchDataByRoute[segment])
        .map(segment => {
          const fetchData = fetchDataByRoute[segment]

          return [segment, () => fetchData(dependencies, toState.params)]
        })

      const needsHandling = toUpdate.length > 0 || toRemove.length > 0
      if (needsHandling) handleRoute(toUpdate, toRemove)

      return true
    }
  }
}
