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

    handleRoute (toUpdate, toClean) {
      cleanSegments(toUpdate, toClean)
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

  function cleanSegments (toUpdate, toClean) {
    const nextData = {...data}
    let needsUpdate = false

    function cleanSegment (segment, cleanData) {
      const currentSegment = data[segment]

      if (!currentSegment) return

      const nextSegment = cleanData(currentSegment)

      if (!nextSegment) {
        delete nextData[segment]
        needsUpdate = true
      } else if (nextSegment !== currentSegment) {
        nextData[segment] = nextSegment
        needsUpdate = true
      }
    }

    for (const [segment, cleanData] of toClean) cleanSegment(segment, cleanData)
    for (const [segment,, cleanData] of toUpdate) cleanSegment(segment, cleanData)

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
