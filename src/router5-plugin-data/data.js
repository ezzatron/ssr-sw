export function createDataManager (handleFetcher, routes, initialData = {}) {
  const {outcomes, promises} = buildContexts(routes, initialData)
  const subscribers = new Set()
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
          delete outcomes[name][key]
          delete promises[name][key]
          needsPublish = true
        }

        const outcome = outcomes[name][key]
        const fetcher = workFn(clean, outcome)

        if (!fetcher) continue

        handleFetcher(() => {
          const promise = fetcher()

          outcomes[name][key] = {status: 'pending'}
          promises[name][key] = promise

          promise
            .then(
              value => ({status: 'fulfilled', value}),
              reason => ({status: 'rejected', reason}),
            )
            .then(outcome => {
              outcomes[name][key] = outcome
              publish()
            })

          return promise
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
        state[name] = {...outcomes[name]}
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
        const outcome = routeData[key]

        routeOutcomes[key] = outcome
        routePromises[key] = outcomeToPromise(outcome)
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

/**
 * Converts an outcome back to a promise
 */
function outcomeToPromise (outcome) {
  const {reason, status, value} = outcome

  switch (status) {
    case 'fulfilled': return Promise.resolve(value)
    case 'rejected': return Promise.reject(reason instanceof Error ? reason : new Error(reason + ''))
  }

  throw new Error('Cannot convert an incomplete outcome to a promise')
}