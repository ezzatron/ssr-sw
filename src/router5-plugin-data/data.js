const emptyOutcome = {status: ''}

export function createDataManager (handleFetcher, routes, initialData = {}) {
  const {outcomes, promises} = buildContexts(routes, initialData)
  const cleanHandlers = new Map()
  const subscribers = new Set()
  const pending = {status: 'pending'}
  let data = buildData()
  let work

  return {
    startBatch () {
      work = []
    },

    addWork (name, key, workFn) {
      work.push([name, key, workFn])
    },

    endBatch () {
      let needsPublish = false

      for (const [name, key, workFn] of work) {
        const clean = () => {
          const cleanHandler = cleanHandlers.get(promises[name][key])
          cleanHandler && cleanHandler()

          delete outcomes[name][key]
          delete promises[name][key]

          needsPublish = true
        }

        const outcome = outcomes[name][key]
        const fetcher = workFn(clean, outcome || emptyOutcome)

        if (!fetcher) continue

        handleFetcher(abortController => {
          const signal = abortController && abortController.signal
          const status = {isCleaned: false}
          const promise = Promise.resolve(fetcher({signal, status}))

          cleanHandlers.set(promise, () => {
            cleanHandlers.delete(promise)

            status.isCleaned = true
            abortController.abort()
          })

          outcomes[name][key] = pending
          promises[name][key] = promise

          return promise
            .then(
              value => ({status: 'fulfilled', value}),
              reason => ({status: 'rejected', reason}),
            )
            .then(outcome => {
              if (status.isCleaned) {
                return {
                  status: 'rejected',
                  reason: new Error('Route data cleaned'),
                }
              }

              outcomes[name][key] = outcome
              publish()

              return outcome
            })
        })
      }

      if (needsPublish) publish()
    },

    getContext (name) {
      return promises[name]
    },

    getData () {
      return data
    },

    getState () {
      const state = {}

      for (const name in outcomes) {
        const routeOutcomes = outcomes[name]
        if (Object.keys(routeOutcomes).length > 0) state[name] = {...routeOutcomes}
      }

      return state
    },

    subscribeToData (subscriber, currentData) {
      subscribers.add(subscriber)
      if (currentData !== data) subscriber(data)

      return {
        unsubscribe () {
          subscribers.delete(subscriber)
        },
      }
    },
  }

  function buildData () {
    const data = {}

    for (const {name} of routes) {
      Object.assign(data, outcomes[name])
    }

    return data
  }

  function publish () {
    data = buildData()
    subscribers.forEach(subscriber => subscriber(data))
  }
}

/**
 * Construct an object inheritance trees where each route's data inherits from
 * its parent's.
 */
function buildContexts (routes, initialData) {
  const outcomes = {}
  const promises = {}

  for (const {name} of routes) {
    const routeData = initialData[name]
    const routeOutcomes = {}
    const routePromises = {}

    if (routeData) {
      for (const key in routeData) {
        const value = routeData[key]

        routeOutcomes[key] = {status: 'fulfilled', value}
        routePromises[key] = Promise.resolve(value)
      }
    }

    outcomes[name] = routeOutcomes
    promises[name] = routePromises
  }

  if (!outcomes['']) outcomes[''] = {}
  if (!promises['']) promises[''] = {}

  for (const {name} of routes) {
    if (!name) continue

    const parent = parentRoute(name)
    const parentOutcomes = outcomes[parent]
    const parentPromises = promises[parent]

    if (!parentOutcomes || !parentPromises) throw new Error(`Missing route definition for ${parent}`)

    Object.setPrototypeOf(outcomes[name], parentOutcomes)
    Object.setPrototypeOf(promises[name], parentPromises)
  }

  return {outcomes, promises}
}

/**
 * Returns the parent for a given route name
 */
function parentRoute (name) {
  if (!name) return null

  const dotIndex = name.indexOf('.')

  return dotIndex < 0 ? '' : name.substring(0, dotIndex)
}
