import {tokensToFunction} from 'path-to-regexp'

export function createUrlBuilder (router) {
  const {getParsedRoute, parsedRoutes} = router
  const pathnameBuilders = createPathnameBuilders(parsedRoutes)

  return function buildUrl (name, params) {
    const {tokensByKey} = getParsedRoute(name)

    const [pathParams, searchParams] = splitParams(tokensByKey, params)
    const pathname = pathnameBuilders[name](pathParams)
    const search = searchParams ? `?${searchParams.toString()}` : ''

    return `${pathname}${search}`
  }
}

function createPathnameBuilders (parsedRoutes) {
  const builders = {}

  for (const name in parsedRoutes) {
    const {tokens} = parsedRoutes[name]
    builders[name] = tokensToFunction(tokens, {validate: false})
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
