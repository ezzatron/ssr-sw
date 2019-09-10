import transitionPath from 'router5-transition-path'

export function createDataPlugin (routes, createDriver, initialData = {}) {
  return function dataPlugin (router) {
    const {
      getData,
      getDataState,
      handleRoute,
      subscribeToData,
      waitForData,
    } = createDriver(router, initialData)

    Object.assign(router, {getData, getDataState, subscribeToData})
    if (waitForData) router.waitForData = waitForData

    const fetchDataMap = buildFetchDataMap(routes)

    router.setRootFetchData = rootFetchData => {
      fetchDataMap[''] = rootFetchData
    }

    const dataContexts = buildDataContexts(routes, initialData)

    router.useMiddleware(createDataMiddleware({
      dataContexts,
      fetchDataMap,
      handleRoute,
    }))

    return {}
  }
}

function createDataMiddleware (options) {
  const {
  //   dataContexts,
    fetchDataMap,
    handleRoute,
  } = options

  return function dataMiddleware (router, dependencies) {
    return function handleTransition (toState, fromState) {
      const {toActivate, toDeactivate} = transitionPath(toState, fromState)
      if (!fromState) toActivate.unshift('')

      const toFetch = toActivate.filter(name => fetchDataMap[name])
      const toClean = toDeactivate.filter(name => fetchDataMap[name])

      handleRoute(fetchDataMap, toFetch, toClean)

      return true
    }
  }
}

function buildFetchDataMap (routes) {
  const fetchDataMap = {}

  for (const {fetchData, name} of routes) {
    fetchDataMap[name] = fetchData
  }

  return fetchDataMap
}

function buildDataContexts (routes, initialData) {
  const dataContexts = {}

  // create a context for every route
  for (const {name} of routes) {
    const routeContext = {}
    const routeData = initialData[name]

    if (routeData) {
      for (const key in routeData) {
        routeContext[key] = Promise.resolve(routeData[key][1])
      }
    }

    dataContexts[name] = routeContext
  }

  // ensure the root context is created
  if (!dataContexts['']) dataContexts[''] = {}

  // make each context interit from its parent route's context
  for (const {name} of routes) {
    if (!name) continue // root has no parent

    const parent = parentRoute(name)
    const parentContext = dataContexts[parent]

    if (!parentContext) throw new Error(`Missing route definition for ${parent}`)

    Object.setPrototypeOf(dataContexts[name], parentContext)
  }

  return dataContexts
}

function parentRoute (name) {
  if (!name) return null

  const dotIndex = name.indexOf('.')

  return dotIndex < 0 ? '' : name.substring(0, dotIndex)
}
