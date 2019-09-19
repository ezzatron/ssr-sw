export const ROOT = Symbol('root')

export function joinRoute (parentRoute, route) {
  const {path = ''} = route

  if (path.startsWith('/')) return route

  const {path: parentPath} = parentRoute

  return {...route, path: `${parentPath}/${path}`}
}

export function nestedRoutes (config, joinFn = joinRoute) {
  const flat = {}

  return flat
}
