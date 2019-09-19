export const ROOT = Symbol('root')

export function flattenRoutes (nested, options = {}) {
  const {
    joinRoute: joinRouteFn = joinRoute,
    joinRouteName: joinRouteNameFn = joinRouteName,
  } = options

  const root = nested[ROOT] || {}
  const toAdd = [['', [root], nested]]
  const flat = {[ROOT]: root}

  for (let i = 0; i < toAdd.length; ++i) {
    const [parentName, ancestors, routes] = toAdd[i]

    for (const name in routes) {
      if (name === ROOT) continue

      const {children, ...flatRoute} = routes[name]
      const joinedName = joinRouteNameFn(parentName, name)
      const joinedRoute = joinRouteFn(ancestors, flatRoute)

      flat[joinedName] = joinedRoute
      if (children) toAdd.push([joinedName, [...ancestors, joinedRoute], children])
    }
  }

  return flat
}

export function joinRoute (ancestors, route) {
  const {path} = route

  if (typeof path !== 'string' || path.startsWith('/')) return route

  for (let i = ancestors.length - 1; i >= 0; --i) {
    const {path: ancestorPath} = ancestors[i]

    if (typeof ancestorPath === 'string') {
      return {...route, path: `${ancestorPath}/${path}`}
    }
  }

  return route
}

export function joinRouteName (parentName, name) {
  return name
}
