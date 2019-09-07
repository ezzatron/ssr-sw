import transitionPath from 'router5-transition-path'

export function collapseData (dataByRoute) {
  const data = {}
  for (const segment in dataByRoute) Object.assign(data, dataByRoute[segment])

  return data
}

export function createDataPlugin (routes, createFetcher, data) {
  return function dataPlugin (router) {
    const {getData, getDataState, handleRoute, subscribeToData, waitForData} = createFetcher(router, data)
    const context = {}

    Object.assign(router, {getData, getDataState, subscribeToData})
    if (waitForData) router.waitForData = waitForData

    router.setRootFetchData = rootFetchData => {
      context.rootFetchData = rootFetchData
    }

    router.useMiddleware(createDataMiddleware(routes, handleRoute, context))

    return {}
  }
}

function createDataMiddleware (routes, handleRoute, context) {
  const {rootFetchData} = context

  const fetchDataBySegment = routes.reduce((byRoute, route) => {
    const {fetchData, name} = route
    if (fetchData) byRoute[name] = fetchData

    return byRoute
  }, {})

  function findFetchData (segment) {
    if (segment === '' && rootFetchData) return rootFetchData

    return fetchDataBySegment[segment]
  }

  return function dataMiddleware (router, dependencies) {
    return (toState, fromState) => {
      const {toActivate, toDeactivate} = transitionPath(toState, fromState)
      if (!fromState) toActivate.unshift('')

      const toRemove = toDeactivate.filter(findFetchData)
      const toUpdate = toActivate
        .map(segment => [segment, findFetchData(segment)])
        .filter(([, fetchData]) => fetchData)
        .map(([segment, fetchData]) => {
          return [segment, () => fetchData(dependencies, toState.params)]
        })

      const needsHandling = toUpdate.length > 0 || toRemove.length > 0
      if (needsHandling) handleRoute(toUpdate, toRemove)

      return true
    }
  }
}
