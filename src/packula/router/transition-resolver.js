export function createTransitionResolver (router) {
  const {getRoute} = router

  return {
    routeNodes,
    routeTransition,
  }

  function routeNodes (name) {
    const nodes = []

    do {
      nodes.push(name)
      name = getRoute(name).parent
    } while (name)

    return nodes.reverse()
  }

  function routeTransition (fromName, toName) {
    if (!fromName) return {intersection: [], toActivate: routeNodes(toName), toDeactivate: []}

    const fromNodes = routeNodes(fromName)
    const toNodes = routeNodes(toName)
    const intersection = findIntersection(fromNodes, toNodes)
    const {length} = intersection

    return {
      intersection,
      toActivate: toNodes.slice(length),
      toDeactivate: fromNodes.slice(length).reverse(),
    }
  }

  function findIntersection (fromNodes, toNodes) {
    const limit = Math.min(fromNodes.length, toNodes.length)

    for (let i = 0; i < limit; ++i) {
      if (fromNodes[i] !== toNodes[i]) return toNodes.slice(0, i)
    }

    return toNodes.slice(0, limit)
  }
}
