import {tokensToFunction} from 'path-to-regexp'

export function createUrlBuilder (router) {
  const {getRoute, parsedRoutes} = router
  const pathnameBuilders = createPathnameBuilders(parsedRoutes)

  return function buildUrl (name, params) {
    getRoute(name) // throws a better exception if undefined
    const parsedRoute = parsedRoutes[name]
    if (!parsedRoute) throw new Error(`Cannot build URL - route ${JSON.stringify(name)} has no path`)

    const [pathParams, searchParams] = splitParams(parsedRoute.tokensByKey, params)
    const pathname = pathnameBuilders[name](pathParams)
    const search = searchParams ? `?${searchParams.toString()}` : ''

    return `${pathname}${search}`
  }
}

function createPathnameBuilders (parsedRoutes) {
  const builders = {}

  for (const name in parsedRoutes) {
    const {tokens} = parsedRoutes[name]
    builders[name] = tokensToFunction(tokens)
  }

  return builders
}

function splitParams (tokensByKey, params) {
  if (!params) return [{}]
  if (!(params instanceof URLSearchParams)) params = new URLSearchParams(params)

  const pathParams = {}
  const searchParams = []

  for (const entry of params) {
    const [key] = entry
    const token = tokensByKey[key]

    if (token) {
      const [, value] = entry

      if (token.repeat) {
        if (!pathParams[key]) pathParams[key] = []
        pathParams[key].push(value)
      } else if (pathParams[key]) {
        searchParams.push(entry)
      } else {
        pathParams[key] = value
      }
    } else {
      searchParams.push(entry)
    }
  }

  if (searchParams.length < 1) return [pathParams]

  return [pathParams, new URLSearchParams(searchParams)]
}
