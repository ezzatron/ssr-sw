import {tokensToRegExp} from 'path-to-regexp'

import {UNKNOWN} from './symbols.js'

export function createUrlResolver (router) {
  const {parsedRoutes} = router
  const pathnameRegexps = createPathnameRegexps(parsedRoutes)

  return function resolveUrl (url) {
    if (!(url instanceof URL)) url = new URL(url, 'http://x')
    const {pathname, searchParams} = url

    for (const {keys, name, regexp} of pathnameRegexps) {
      const match = regexp.exec(pathname)
      if (!match) continue

      return {name, params: mergeParams(keys, match, searchParams)}
    }

    return {name: UNKNOWN, params: searchParams}
  }
}

function createPathnameRegexps (parsedRoutes) {
  const regexps = []

  for (const name in parsedRoutes) {
    const {tokens} = parsedRoutes[name]
    const keys = []
    const regexp = tokensToRegExp(tokens, keys)
    regexps.push({keys, name, regexp})
  }

  return regexps
}

function mergeParams (keys, match, searchParams) {
  const params = new URLSearchParams()

  for (let i = 1; i < match.length; ++i) {
    const keyMatch = match[i]
    if (typeof keyMatch !== 'string') continue

    const {delimiter, name} = keys[i - 1]
    for (const value of keyMatch.split(delimiter)) params.append(name, value)
  }

  for (const [key, value] of searchParams) params.append(key, value)

  return params
}
