export const ROOT = Symbol('root')

export function createRouter (routes) {
  if (!routes || typeof routes !== 'object') throw new Error('Invalid routes')
  if (!routes[ROOT]) routes[ROOT] = {}

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
