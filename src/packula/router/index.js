import {parse} from 'path-to-regexp'

import {normalizeRoutes} from './normalization.js'

export function createRouter (routes) {
  routes = normalizeRoutes(routes)
  const parsedRoutes = parseRoutes(routes)

  return {
    getParsedRoute (name) {
      if (!routes[name]) throw new Error(`Undefined route ${name}`)
      const parsedRoute = parsedRoutes[name]
      if (!parsedRoute) throw new Error(`Route ${name} does not have a path`)

      return parsedRoute
    },

    getRoute (name) {
      const route = routes[name]
      if (!route) throw new Error(`Undefined route ${name}`)

      return route
    },

    getRouteOption (name, key, defaultValue) {
      do {
        const route = routes[name]
        if (!route) throw new Error(`Undefined route ${name}`)

        const {options: {[key]: value}, parent} = route
        if (typeof value !== 'undefined') return value

        name = parent
      } while (name)

      return defaultValue
    },

    parsedRoutes,
    routes,
  }
}

function parseRoutes (routes) {
  const parsed = {}

  for (const name in routes) {
    const {path} = routes[name]
    if (typeof path !== 'string') continue

    const tokens = parse(path)
    const tokensByKey = {}

    for (const token of tokens) {
      const {name} = token
      if (typeof name !== 'undefined') tokensByKey[name] = token
    }

    parsed[name] = {tokens, tokensByKey}
  }

  return parsed
}
