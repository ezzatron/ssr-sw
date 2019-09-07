import {collapseData, createDataPlugin} from './common.js'

export default function createClientDataPlugin (routes, data = {}) {
  return createDataPlugin(routes, createFetcher, data)
}

function createFetcher (router, data) {
  const subscribers = new Set()
  const counters = {}
  let collapsedData = collapseData(data)

  return {
    getData () {
      return collapsedData
    },

    getDataState () {
      return data
    },

    handleRoute (toUpdate, toRemove) {
      deleteSegments(toUpdate, toRemove)
      updateSegments(toUpdate)
    },

    subscribeToData (subscriber, currentData) {
      subscribers.add(subscriber)
      if (currentData !== collapsedData) subscriber(collapsedData)

      return {
        unsubscribe () {
          subscribers.delete(subscriber)
        },
      }
    },
  }

  function deleteSegments (toUpdate, toRemove) {
    const nextData = {...data}
    let needsUpdate = false

    for (const segment of toRemove) {
      delete nextData[segment]
      needsUpdate = true
    }

    for (const [segment] of toUpdate) {
      if (!nextData[segment]) continue

      delete nextData[segment]
      needsUpdate = true
    }

    if (needsUpdate) publish(nextData)
  }

  function updateSegments (toUpdate) {
    for (const [segment, fetchData] of toUpdate) {
      const previousCount = counters[segment]
      const expectedCount = previousCount ? previousCount + 1 : 0
      counters[segment] = expectedCount

      const toFetch = fetchData()

      for (const key in toFetch) {
        Promise.resolve(toFetch[key])
          .then(
            value => [null, value],
            error => [error, null],
          )
          .then(result => {
            if (counters[segment] === expectedCount) publishResult(segment, key, result)
          })
      }
    }
  }

  function publish (nextData) {
    data = nextData
    collapsedData = collapseData(data)
    subscribers.forEach(subscriber => subscriber(collapsedData))
  }

  function publishResult (segment, key, result) {
    const segmentData = data[segment]
    const nextSegment = segmentData
      ? {...segmentData, [key]: result}
      : {[key]: result}

    publish({...data, [segment]: nextSegment})
  }
}
