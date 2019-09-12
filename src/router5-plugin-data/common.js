import transitionPath, {nameToIDs} from 'router5-transition-path'

import {createDataManager} from './data.js'

export function cleanKey (clean) {
  clean()
}

export function createDataPlugin (options) {
  const {
    augmentRouter,
    handleFetcher,
    initialData,
    routes,
  } = options

  return function dataPlugin (router) {
    const fetchDataMap = buildFetchDataRouteMap(routes, ({fetchData}) => fetchData)
    const deactivatorMap = buildFetchDataRouteMap(routes, () => ({}))

    const dataManager = createDataManager(handleFetcher, routes, initialData)
    const {getData, getState, subscribeToData} = dataManager

    Object.assign(router, {
      getData,
      getDataState: getState,
      subscribeToData,
    })

    augmentRouter && augmentRouter(router, dataManager)

    router.setRootFetchData = rootFetchData => {
      fetchDataMap[''] = rootFetchData
    }

    router.useMiddleware(createDataMiddleware(dataManager, deactivatorMap, fetchDataMap))

    return {}
  }
}

function createDataMiddleware (dataManager, deactivatorMap, fetchDataMap) {
  return function dataMiddleware (router, dependencies) {
    let isInitialized = false

    return function handleTransition (toState, fromState) {
      if (fromState && !isInitialized) {
        isInitialized = true
        handleInitialize(fromState)
      }

      const {toActivate, toDeactivate} = transitionPath(toState, fromState)
      if (!fromState) toActivate.unshift('')

      dataManager.startBatch()
      toDeactivate.map(handleDeactivateRoute)

      for (const name of toActivate) {
        const fetchData = fetchDataMap[name]
        if (fetchData) handleActivateRoute(toState, fromState, name, fetchData)
      }

      dataManager.endBatch()

      return true
    }

    function handleInitialize (toState) {
      const toActivate = ['', ...nameToIDs(toState.name)]
      const context = {data: {}, toState}

      for (const name of toActivate) {
        const fetchData = fetchDataMap[name]

        if (fetchData) {
          registerDeactivators(
            name,
            normalizeFetchSpec(name, fetchData(dependencies, context)),
          )
        }
      }
    }

    function handleDeactivateRoute (name) {
      const deactivators = deactivatorMap[name]

      for (const key in deactivators) {
        const deactivator = deactivators[key]
        if (deactivator) dataManager.addWork(name, key, deactivator)
      }
    }

    function handleActivateRoute (toState, fromState, name, fetchData) {
      const data = dataManager.getContext(name)
      const context = {data, fromState, toState}
      const fetchSpec = normalizeFetchSpec(name, fetchData(dependencies, context))

      registerDeactivators(name, fetchSpec)

      for (const key in fetchSpec) {
        const {onActivate} = fetchSpec[key]

        dataManager.addWork(name, key, onActivate)
      }
    }

    function registerDeactivators (name, fetchSpec) {
      for (const key in fetchSpec) {
        const {onDeactivate} = fetchSpec[key]

        deactivatorMap[name][key] = (clean, outcome) => {
          delete deactivatorMap[name][key]
          onDeactivate(clean, outcome)
        }
      }
    }
  }
}

export function noop () {}

/**
 * Builds a map of routes with fetchData to the result of a callback
 */
function buildFetchDataRouteMap (routes, fn) {
  const map = {}

  for (const route of routes) {
    const {fetchData, name} = route

    if (fetchData) map[name] = fn(route)
  }

  return map
}

/**
 * Fills in each key of a fetchData function result with default behaviours
 */
function normalizeFetchSpec (name, fetchSpec) {
  const normalized = {}

  if (!fetchSpec) return normalized

  const fetchSpecType = typeof fetchSpec

  if (fetchSpecType !== 'object') {
    throw new Error(`The ${name} route's fetchData function should return an object, but returned ${fetchSpecType}`)
  }

  for (const key in fetchSpec) {
    normalized[key] = normalizeKeySpec(name, key, fetchSpec[key])
  }

  return normalized
}

/**
 * Ensures each key has an onActivate and onDeactivate function
 */
function normalizeKeySpec (name, key, keySpec) {
  const keySpecType = keySpec === null ? 'null' : typeof keySpec

  if (keySpecType === 'function') {
    return {
      onActivate: () => keySpec,
      onDeactivate: cleanKey,
    }
  }

  if (keySpecType === 'object') {
    const {onActivate, onDeactivate} = keySpec

    return {
      onActivate: onActivate || noop,
      onDeactivate: onDeactivate || (onActivate ? cleanKey : noop),
    }
  }

  throw new Error(
    `The ${name} route's ${key} fetchData handler should be a function or an object, but found ${keySpecType}`,
  )
}
