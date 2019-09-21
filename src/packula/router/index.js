export const ROOT = Symbol('root')

export function createRouter (routes) {
  routes = normalizeRoutes(routes)

  return {
    buildUrl (name, params = {}) {
    },

    resolveUrl (url) {
    },

    routeNodes (to, from = ROOT) {
    },

    routePath (to, from = ROOT) {
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
