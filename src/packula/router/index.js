import {ROOT} from './symbols.js'

export function createRouter (routes) {
  routes = normalizeRoutes(routes)

  return {
    buildUrl (name, params = {}) {
    },

    resolveUrl (url) {
    },

    routeNodes (toName, fromName = ROOT) {
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
