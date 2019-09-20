export const ROOT = Symbol('root')

export function flattenRoutes (nested, options = {}) {
  const {
    joinRoute: joinRouteFn = joinRoute,
  } = options

  const root = nested[ROOT]
  const rootAncestors = [[ROOT, {...root, path: ''}]]
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
  const parentIndex = ancestors.length - 1

  if (parentIndex < 0) throw new Error('No ancestors supplied')

  const [parent] = ancestors[parentIndex]
  const {path} = route

  if (typeof path === 'string' && !path.startsWith('/')) {
    for (let i = parentIndex; i >= 0; --i) {
      const {path: ancestorPath} = ancestors[i][1]

      if (typeof ancestorPath !== 'string') continue

      return [name, {...route, parent, path: `${ancestorPath}/${path}`}]
    }
  }

  return [name, {...route, parent}]
}
