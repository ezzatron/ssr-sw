import {ROOT} from './symbols.js'

export function createPathResolver (router) {
  const {getRoute} = router

  return {
    routePath,
    routePathFrom,
  }

  function routePath (name) {
    const route = getRoute(name)

    const {path} = route
    if (typeof path === 'string') return path

    throw new Error(`Route ${name} has no path`)
  }

  function routePathFrom (fromName, toName) {
    if (fromName === ROOT) return routePath(toName)

    const fromPath = routePath(fromName)
    const toPath = routePath(toName)

    if (toPath.startsWith(`${fromPath}/`)) return toPath.substring(fromPath.length)

    throw new Error(`Route path for ${toName} (${toPath}) is not a descendent of ${fromName} (${fromPath})`)
  }
}
