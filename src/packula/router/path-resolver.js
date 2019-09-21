import {ROOT} from './symbols.js'

export function createPathResolver (router) {
  const {routes} = router

  return {
    routePath,
    routePathFrom,
  }

  function routePath (name) {
    const route = routes[name]
    if (!route) throw new Error(`Undefined route ${JSON.stringify(name)}`)

    const {path} = route
    if (typeof path === 'string') return path

    throw new Error(`Route ${JSON.stringify(name)} has no path`)
  }

  function routePathFrom (fromName, toName) {
    if (fromName === ROOT) return routePath(toName)

    const fromPath = routePath(fromName)
    const toPath = routePath(toName)

    if (toPath.startsWith(`${fromPath}/`)) return toPath.substring(fromPath.length)

    const toDescription = `${JSON.stringify(toName)} (${JSON.stringify(toPath)})`
    const fromDescription = `${JSON.stringify(fromName)} (${JSON.stringify(fromPath)})`

    throw new Error(`Route path for ${toDescription} is not a descendent of ${fromDescription}`)
  }
}
