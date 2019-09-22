import {parse, tokensToFunction} from 'path-to-regexp'

import {ROOT} from './symbols.js'

export function createRouter (routes) {
  routes = normalizeRoutes(routes)
  const parsedRoutes = parseRoutes(routes)

  return {
    buildUrl (name, params) {
      const parsed = parsedRoutes[name]
      if (!parsed) throw new Error(`Undefined route ${JSON.stringify(name)}`)

      const {buildPathname, splitParams} = parsed
      const [pathParams, searchParams] = splitParams(params)
      const pathname = buildPathname(pathParams)
      const search = searchParams ? `?${searchParams.toString()}` : ''

      return `${pathname}${search}`
    },

    getRoute (name) {
      const route = routes[name]
      if (!route) throw new Error(`Undefined route ${JSON.stringify(name)}`)

      return route
    },

    resolveUrl (url) {
    },

    routes,
  }
}

function normalizeRoutes (routes) {
  if (!routes || typeof routes !== 'object') throw new Error('Invalid routes')

  const normalized = {[ROOT]: {...routes[ROOT]}}
  for (const name in routes) normalized[name] = {parent: ROOT, ...routes[name]}

  return normalized
}

function parseRoutes (routes) {
  const parsed = {}

  for (const name in routes) {
    const {path} = routes[name]
    if (typeof path !== 'string') continue

    const tokens = parse(path)
    const tokensByKey = {}
    for (const token of tokens) tokensByKey[token.name] = token

    parsed[name] = {
      buildPathname: tokensToFunction(tokens),

      splitParams (params) {
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
      },
    }
  }

  return parsed
}
