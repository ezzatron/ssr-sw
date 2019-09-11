export function createDataManager (routes, initialData) {
  const dataContexts = buildDataContexts(routes, initialData)
  const subscribers = new Set()
  let work

  return {
    startBatch () {
      work = []
    },

    addWork (name, key, workFn) {
      work.push([name, key, workFn])
    },

    endBatch () {
      // call each work function with clean cb and key outcome
      // on server, store fetchers returned from work functions
      // on client, immediately invoke fetchers
      // publish update if any clean cb was called
    },

    getDataState () {
      // return outcomes for each key in each route
    },

    getDataContext (name) {
      return dataContexts[name]
    },

    getData () {
      // collapse outcomes into a single object and return
    },

    subscribeToData (subscriber, currentData) {
      subscribers.add(subscriber)
      // immediately update subscriber if currentData does not match what we have

      return {
        unsubscribe () {
          subscribers.delete(subscriber)
        },
      }
    },

    async waitForData () {
      // await all fetchers
    },
  }
}

/**
 * Construct an object inheritance tree where each route's object inherits from
 * its parent's.
 */
function buildDataContexts (routes, initialData) {
  const dataContexts = {}

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

  if (!dataContexts['']) dataContexts[''] = {}

  for (const {name} of routes) {
    if (!name) continue

    const parent = parentRoute(name)
    const parentContext = dataContexts[parent]

    if (!parentContext) throw new Error(`Missing route definition for ${parent}`)

    Object.setPrototypeOf(dataContexts[name], parentContext)
  }

  return dataContexts
}

/**
 * Returns the parent for a given route name
 */
function parentRoute (name) {
  if (!name) return null

  const dotIndex = name.indexOf('.')

  return dotIndex < 0 ? '' : name.substring(0, dotIndex)
}
