export const ROOT = Symbol('root')

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

export function nestedRoutes (config, joinFn = joinRoute) {
  const flat = {}

  return flat
}
