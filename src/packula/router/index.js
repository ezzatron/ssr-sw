import {ROOT} from './symbols.js'

export function createRouter (routes) {
  routes = normalizeRoutes(routes)

  return {
    buildUrl (name, params = {}) {
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
