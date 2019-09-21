export function createTransitionResolver (router) {
  const {getRoute} = router

  return {
    routeNodes,
  }

  function routeNodes (name) {
    const nodes = []

    do {
      nodes.push(name)
      name = getRoute(name).parent
    } while (typeof name !== 'undefined')

    return nodes.reverse()
  }
}
