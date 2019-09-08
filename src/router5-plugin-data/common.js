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

export const ON_ERROR_CLEAN = 'clean'
export const ON_ERROR_KEEP = 'keep'
export const ON_ERROR_REPLACE = 'replace'

export function persistent (...args) {
  const fetcher = args.length > 1 ? args[1] : args[0]
  const options = args.length > 1 ? args[0] : {}

  const {
    onError = 'clean',
  } = options

  return (previous, clean) => {
    return previous
      .catch(error => {
        if (onError === ON_ERROR_KEEP) throw error
        if (onError === ON_ERROR_CLEAN) clean()
      })
      .then(previous => previous || fetcher())
  }
}

function createDataMiddleware (routes, initialData, handleRoute, options) {
  const {rootFetchData} = options
  const cleanDataBySegment = {}
  const fetchDataBySegment = {}

  for (const route of routes) {
    const {cleanData, fetchData, name} = route

    cleanDataBySegment[name] = cleanData
    fetchDataBySegment[name] = fetchData
  }

  function findFetchData (segment) {
    if (segment === '' && rootFetchData) return rootFetchData

    return fetchDataBySegment[segment]
  }

  function shouldCleanSegment (segment) {
    return cleanDataBySegment[segment] !== false
  }

  return function dataMiddleware (router, dependencies) {
    const dataContexts = {}
    const previousFetches = {}

    if (initialData) prepareInitialData(initialData)

    return (toState, fromState) => {
      const {toActivate, toDeactivate} = transitionPath(toState, fromState)
      if (!fromState) toActivate.unshift('')

      const toFetchHooks = toActivate
        .map(segment => ({
          segment,
          fetchData: findFetchData(segment),
          shouldClean: shouldCleanSegment(segment),
        }))
        .filter(({fetchData}) => fetchData)

      const toClean = toDeactivate.filter(shouldCleanSegment)
      const needsHandling = toFetchHooks.length > 0 || toClean.length > 0

      if (!needsHandling) return true

      prepareDataContexts(toActivate, toDeactivate)

      const toFetch = toFetchHooks.map(hook => {
        const {segment, fetchData, shouldClean} = hook
        const data = dataContexts[segment]
        const segmentPreviousFetches = previousFetches[segment] || {}

        return {
          segment,
          shouldClean,

          startFetch (onClean) {
            const context = {toState, fromState, data}
            const keyFetchers = fetchData(dependencies, context)

            const fetches = {}
            const promisedFetches = {}

            for (const key in keyFetchers) {
              const previous = segmentPreviousFetches[key] || Promise.resolve()
              const clean = () => {
                delete data[key]
                onClean(key)
              }

              const keyFetcher = keyFetchers[key]
              const fetch = keyFetcher(previous, clean)
              const promisedFetch = Promise.resolve(fetch)

              fetches[key] = fetch
              promisedFetches[key] = promisedFetch
              data[key] = promisedFetch
            }

            previousFetches[segment] = shouldClean ? {} : promisedFetches

            return fetches
          },
        }
      })

      handleRoute(toFetch, toClean)

      return true
    }

    function prepareInitialData (initialData) {
      prepareDataContexts(Object.keys(initialData), [])

      for (const segment in initialData) {
        previousFetches[segment] = {}
        const segmentData = initialData[segment]

        for (const key in segmentData) {
          const fetch = Promise.resolve(segmentData[key][1])

          previousFetches[segment][key] = fetch
          dataContexts[segment][key] = fetch
        }
      }
    }

    function prepareDataContexts (toActivate, toDeactivate) {
      for (const segment of toDeactivate) delete dataContexts[segment]

      for (const segment of toActivate) {
        if (!dataContexts['']) dataContexts[''] = {}
        if (!segment) continue

        if (shouldCleanSegment(segment)) delete dataContexts[segment]

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
  }
}
