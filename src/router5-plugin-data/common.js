export function createDataPlugin (routes, createFetcher, data) {
  return function dataPlugin (router) {
    const {
      getData,
      getDataState,
      handleRoute,
      subscribeToData,
      waitForData,
    } = createFetcher(router, data)

    const options = {}

    Object.assign(router, {getData, getDataState, subscribeToData})
    if (waitForData) router.waitForData = waitForData

    router.setRootFetchData = rootFetchData => {
      options.rootFetchData = rootFetchData
    }

    router.useMiddleware(createDataMiddleware(routes, data, handleRoute, options))

    return {}
  }
}

function createDataMiddleware (routes, initialData, handleRoute, options) {
  return function dataMiddleware (router, dependencies) {
  }
}
