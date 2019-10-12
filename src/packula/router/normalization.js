import {ROOT} from './symbols.js'

export function normalizeRoutes (routes) {
  if (!routes || typeof routes !== 'object') throw new Error('Invalid routes')

  const {options = {}} = routes[ROOT] || {}
  const normalized = {[ROOT]: {options}}

  for (const name in routes) {
    const {parent = ROOT, path, options} = routes[name]
    const normalizedRoute = {parent, options: normalizeOptions(options)}
    if (typeof path === 'string') normalizedRoute.path = path
    normalized[name] = normalizedRoute
  }

  return normalized
}

function normalizeOptions (options) {
  if (!options) return {}

  const {redirect} = options
  const normalized = {...options}
  if (typeof redirect === 'string') normalized.redirect = {name: redirect, params: {}}

  return normalized
}
