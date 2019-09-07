export function createDataFetcher (initialData = {}) {
  const subscribers = new Set()
  const counters = {}

  const dataBySegment = expandServerData(initialData)
  let data = buildData(dataBySegment)

  return {
    getCurrentData () {
      return data
    },

    routeDataHandler (toState, toUpdate, toRemove) {
      let needsPublish = false

      for (const segment of toRemove) {
        delete dataBySegment[segment]
        needsPublish = true
      }

      for (const [segment] of toUpdate) {
        if (!dataBySegment[segment]) continue

        delete dataBySegment[segment]
        needsPublish = true
      }

      if (needsPublish) publish()

      for (const [segment, fetchData] of toUpdate) {
        const previousCount = counters[segment]
        const expectedCount = previousCount ? previousCount + 1 : 0
        counters[segment] = expectedCount

        const toFetch = fetchData()

        for (const key in toFetch) {
          Promise.resolve(toFetch[key])
            .then(
              value => [undefined, value],
              error => [error, undefined],
            )
            .then(result => {
              if (counters[segment] !== expectedCount) return

              dataBySegment[segment] = dataBySegment[segment] || {}
              dataBySegment[segment][key] = result

              publish()
            })
        }
      }
    },

    subscribeToData (subscriber) {
      subscribers.add(subscriber)

      function unsubscribe () {
        subscribers.delete(subscriber)
      }

      return [unsubscribe, data]
    },
  }

  function buildData (dataBySegment) {
    const data = {}
    for (const segment in dataBySegment) Object.assign(data, dataBySegment[segment])

    return data
  }

  function publish () {
    data = buildData(dataBySegment)
    subscribers.forEach(subscriber => subscriber(data))
  }
}

function expandServerData (data) {
  const expanded = {}

  for (const segment in data) {
    const segmentData = data[segment]
    const expandedSegmentData = {}

    for (const key in segmentData) expandedSegmentData[key] = [undefined, segmentData[key]]

    expanded[segment] = expandedSegmentData
  }

  return expanded
}
