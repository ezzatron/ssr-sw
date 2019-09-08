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
  const cleanDataBySegment = {}
  const fetchDataBySegment = {}

  const deleteData = noop
  const keepData = data => data

  for (const route of routes) {
    const {cleanData, fetchData, name} = route

    cleanDataBySegment[name] = cleanData === false ? keepData : cleanData
    fetchDataBySegment[name] = fetchData
  }

  function findFetchData (segment) {
    if (segment === '' && rootFetchData) return rootFetchData

    return fetchDataBySegment[segment]
  }

  function findCleanData (segment) {
    return cleanDataBySegment[segment] || deleteData
  }

  return function dataMiddleware (router, dependencies) {
    const dataContexts = {}

    function prepareDataContexts (toActivate, toDeactivate) {
      function cleanSegment (segment) {
        const currentSegment = dataContexts[segment]

        if (!currentSegment) return

        const ownKeys = Object.getOwnPropertyNames(currentSegment)
        const currentSegmentIsolated = {}
        for (const key of ownKeys) currentSegmentIsolated[key] = currentSegment[key]

        const cleanData = findCleanData(segment)
        const nextSegment = cleanData(currentSegmentIsolated)

        if (!nextSegment) {
          delete dataContexts[segment]
        } else if (nextSegment !== currentSegment) {
          for (const key of ownKeys) delete currentSegment[key]
          for (const key in nextSegment) currentSegment[key] = nextSegment[key]
        }
      }

      for (const segment of toDeactivate) cleanSegment(segment)

      for (const segment of toActivate) {
        if (!dataContexts['']) dataContexts[''] = {}
        if (!segment) continue

        cleanSegment(segment)

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

      const toUpdateHooks = toActivate
        .map(segment => [segment, findFetchData(segment), findCleanData(segment)])
        .filter(([, fetchData]) => fetchData)
      const toCleanHooks = toDeactivate
        .map(segment => [segment, findCleanData(segment)])
        .filter(([, cleanData]) => cleanData)
      const needsHandling = toUpdateHooks.length > 0 || toCleanHooks.length > 0

      if (!needsHandling) return true

      prepareDataContexts(toActivate, toDeactivate)

      const toUpdate = toUpdateHooks.map(([segment, fetchData, cleanData]) => {
        const dataContext = dataContexts[segment]

        function fetchSegmentData () {
          const context = {toState, fromState, data: dataContext}
          const segmentFetchers = fetchData(dependencies, context)
          const segmentData = {}

          for (const key in segmentFetchers) {
            const keyFetcher = segmentFetchers[key]
            const keyData = keyFetcher(dataContext[key] || Promise.resolve())

            segmentData[key] = keyData
            dataContext[key] = Promise.resolve(keyData)
          }

          return segmentData
        }

        return [segment, fetchSegmentData, cleanData]
      })

      handleRoute(toUpdate, toCleanHooks)

      return true
    }
  }
}

function noop () {}
