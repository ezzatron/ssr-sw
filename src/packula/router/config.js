export const ROOT = Symbol('root')

export function flattenRoutes (nested, options = {}) {
  const {
    joinRoute: joinRouteFn = joinRoute,
  } = options

  const root = nested[ROOT]
  const rootAncestors = [['', {...root, path: ''}]]
  const toAdd = [[rootAncestors, nested]]
  const flat = {[ROOT]: root}

  for (let i = 0; i < toAdd.length; ++i) {
    const [ancestors, routes] = toAdd[i]

    for (const name in routes) {
      const {children, ...flatRoute} = routes[name]
      const joinResult = joinRouteFn(ancestors, name, flatRoute)

      flat[joinResult[0]] = joinResult[1]
      if (children) toAdd.push([[...ancestors, joinResult], children])
    }
  }

  return flat
}

export function joinRoute (ancestors, name, route) {
  const {path} = route

  if (typeof path !== 'string' || path.startsWith('/')) return [name, route]

  for (let i = ancestors.length - 1; i >= 0; --i) {
    const {path: ancestorPath} = ancestors[i][1]

    if (typeof ancestorPath === 'string') {
      return [name, {...route, path: `${ancestorPath}/${path}`}]
    }
  }

  return [name, route]
}
