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

    handleRoute (toFetch, toClean) {
      cleanSegments(toFetch, toClean)
      updateSegments(toFetch)
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

  function cleanSegments (toFetch, toClean) {
    const nextData = {...data}
    let needsUpdate = false

    for (const segment of toClean) {
      if (!nextData[segment]) continue

      delete nextData[segment]
      needsUpdate = true
    }

    for (const {segment, shouldClean} of toFetch) {
      if (!shouldClean || !nextData[segment]) continue

      delete nextData[segment]
      needsUpdate = true
    }

    if (needsUpdate) publish(nextData)
  }

  function updateSegments (toFetch) {
    for (const {segment, startFetch} of toFetch) {
      const previousCount = counters[segment]
      const expectedCount = previousCount ? previousCount + 1 : 0
      counters[segment] = expectedCount

      const fetches = startFetch(key => {
        publishClean(segment, key)
      })

      for (const key in fetches) {
        Promise.resolve(fetches[key])
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

  function publishClean (segment, key) {
    const segmentData = data[segment]

    if (!segmentData || !segmentData[key]) return

    const nextSegment = {...segmentData}
    delete nextSegment[key]

    publish({...data, [segment]: nextSegment})
  }

  function publishResult (segment, key, result) {
    const segmentData = data[segment]
    const currentResult = segmentData && segmentData[key]

    if (isSameResult(result, currentResult)) return

    const nextSegment = segmentData
      ? {...segmentData, [key]: result}
      : {[key]: result}

    publish({...data, [segment]: nextSegment})
  }
}

function isSameResult (resultA, resultB) {
  if (!resultA || !resultB) return false

  const [errorA, valueA] = resultA
  const [errorB, valueB] = resultB

  if (errorA) return errorA === errorB
  if (errorB) return false

  return valueA === valueB
}
