import transitionPath from 'router5-transition-path'

export function collapseData (dataByRoute) {
  const data = {}
  for (const segment in dataByRoute) Object.assign(data, dataByRoute[segment])

  return data
}

export function createDataPlugin (routes, createFetcher, data) {
  return function dataPlugin (router) {
    const {
      getData,
      getDataState,
      handleRoute,
      subscribeToData,
      waitForData,
    } = createFetcher(router, data)

    const options = {}

    Object.assign(router, {getData, getDataState, subscribeToData})
    if (waitForData) router.waitForData = waitForData

    router.setRootFetchData = rootFetchData => {
      options.rootFetchData = rootFetchData
    }

    router.useMiddleware(createDataMiddleware(routes, data, handleRoute, options))

    return {}
  }
}

function createDataMiddleware (routes, initialData, handleRoute, options) {
  const {rootFetchData} = options

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
    const dataContexts = {}

    function prepareDataContexts (toActivate, toDeactivate) {
      for (const segment of toDeactivate) delete dataContexts[segment]
      for (const segment of toActivate) {
        if (!dataContexts['']) dataContexts[''] = {}
        if (!segment) continue

        let parent = ''
        let parentContext = dataContexts[parent]

        for (const atom of segment.split('.')) {
          const current = parent ? `${parent}.${atom}` : atom

          if (!dataContexts[current]) {
            dataContexts[current] = Object.create(parentContext)
          }

          parent = current
          parentContext = dataContexts[parent]
        }
      }
    }

    if (initialData) {
      prepareDataContexts(Object.keys(initialData), [])

      for (const segment in initialData) {
        const segmentData = initialData[segment]

        for (const key in segmentData) {
          dataContexts[segment][key] = Promise.resolve(segmentData[key][1])
        }
      }
    }

    return (toState, fromState) => {
      const {toActivate, toDeactivate} = transitionPath(toState, fromState)
      if (!fromState) toActivate.unshift('')

      const toUpdateFetchData = toActivate
        .map(segment => [segment, findFetchData(segment)])
        .filter(([, fetchData]) => fetchData)
      const toRemove = toDeactivate.filter(findFetchData)
      const needsHandling = toUpdateFetchData.length > 0 || toRemove.length > 0

      if (!needsHandling) return true

      prepareDataContexts(toActivate, toDeactivate)

      const toUpdate = toUpdateFetchData
        .map(([segment, fetchData]) => {
          const dataContext = dataContexts[segment]

          function fetchSegmentData () {
            const context = {toState, fromState, data: dataContext}
            const segmentData = fetchData(dependencies, context)

            for (const key in segmentData) {
              dataContext[key] = Promise.resolve(segmentData[key])
            }

            return segmentData
          }

          return [segment, fetchSegmentData]
        })

      handleRoute(toUpdate, toRemove)

      return true
    }
  }
}
