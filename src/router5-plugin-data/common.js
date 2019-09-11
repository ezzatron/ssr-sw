import transitionPath from 'router5-transition-path'

import {createDataManager} from './data.js'

export function createDataPlugin (routes, initialData = {}) {
  return function dataPlugin (router) {
    const fetchDataMap = buildFetchDataMap(routes)

    const dataManager = createDataManager(routes, initialData)
    const {getData, getDataState, subscribeToData, waitForData} = dataManager
    Object.assign(router, {getData, getDataState, subscribeToData, waitForData})

    router.setRootFetchData = rootFetchData => {
      fetchDataMap[''] = rootFetchData
    }

    router.useMiddleware(createDataMiddleware(dataManager, fetchDataMap))

    return {}
  }
}

function createDataMiddleware (dataManager, fetchDataMap) {
  const deactivatorMap = buildDeactivatorMap(fetchDataMap)

  return function dataMiddleware (router, dependencies) {
    return function handleTransition (toState, fromState) {
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

    function handleDeactivateRoute (name) {
      const deactivators = deactivatorMap[name]

      for (const key in deactivators) {
        const deactivator = deactivators[key]
        if (deactivator) dataManager.addWork(name, key, deactivator)
      }
    }

    function handleActivateRoute (toState, fromState, name, fetchData) {
      const data = dataManager.getDataContext(name)
      const context = {data, fromState, toState}
      const fetchSpec = normalizeFetchSpec(name, fetchData(dependencies, context))

      for (const key in fetchSpec) {
        const {onActivate, onDeactivate} = fetchSpec[key]

        dataManager.addWork(name, key, onActivate)
        deactivatorMap[name][key] = (clean, outcome) => {
          delete deactivatorMap[name][key]
          onDeactivate(clean, outcome)
        }
      }
    }
  }
}

/**
 * Builds a map of route name to fetchData function
 */
function buildFetchDataMap (routes) {
  const fetchDataMap = {}

  for (const {fetchData, name} of routes) {
    if (fetchData) fetchDataMap[name] = fetchData
  }

  return fetchDataMap
}

/**
 * Builds a structure for storing deactivators by route name and data key
 */
function buildDeactivatorMap (fetchDataMap) {
  const deactivatorMap = {}

  for (const name in fetchDataMap) {
    deactivatorMap[name] = {}
  }

  return deactivatorMap
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

function cleanKey (clean) {
  clean()
}

function noop () {}
