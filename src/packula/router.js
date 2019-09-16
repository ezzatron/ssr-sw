import pathToRegexp from 'path-to-regexp'
import queryString from 'query-string'

export function createRouter (routes) {
  const [byName, flat] = buildRouteIndices(routes)

  return {
    build (name, params = {}) {
      const route = byName[name]
      if (!route) throw new Error(`Undefined route ${name}`)

      const {keyIndex, toPath} = route
      const pathParams = {}
      const queryParams = {}
      let hasQuery = false

      for (const paramName in params) {
        const value = params[paramName]

        if (keyIndex[paramName]) {
          pathParams[paramName] = value
        } else {
          queryParams[paramName] = value
          hasQuery = true
        }
      }

      const query = hasQuery ? '?' + queryString.stringify(queryParams) : ''

      return toPath(pathParams) + query
    },

    resolve (url) {
      const queryIndex = url.indexOf('?')
      const hasQuery = queryIndex >= 0
      const pathname = hasQuery ? url.substring(0, queryIndex) : url

      for (const {keyNames, regexp, route} of flat) {
        const match = regexp.exec(pathname)
        if (!match) continue

        const params = hasQuery ? queryString.parse(url.substring(queryIndex)) : {}

        for (let i = 0; i < keyNames.length; ++i) {
          const value = match[i + 1]
          if (typeof value !== 'undefined') params[keyNames[i]] = value
        }

        return {params, route}
      }

      return null
    },
  }
}

function buildRouteIndices (rootRoutes) {
  const toIndex = [['', rootRoutes]]
  const byName = {}
  const flat = []

  for (let i = 0; i < toIndex.length; ++i) {
    const [parentPath, routes] = toIndex[i]

    for (const route of routes) {
      const {children, name, path} = route
      const fullPath = parentPath + path
      const keys = []
      const regexp = pathToRegexp(fullPath, keys)
      const toPath = pathToRegexp.compile(fullPath)

      const keyIndex = {}
      const keyNames = []

      for (const {name: keyName} of keys) {
        keyIndex[keyName] = true
        keyNames.push(keyName)
      }

      const entry = {keyIndex, keyNames, name, path: fullPath, regexp, route, toPath}

      byName[name] = entry
      flat.push(entry)
      if (children) toIndex.push([fullPath, children])
    }
  }

  return [byName, flat]
}
