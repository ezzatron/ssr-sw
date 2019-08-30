/* eslint-disable import/no-commonjs */

// const lruCache = require('lru-cache')
const urlParse = require('url-parse')

module.exports = {
  createPreloadAsMiddleware,
}

function createPreloadAsMiddleware () {
  const mapping = {}

  return function preloadAsMiddleware (request, response, next) {
    const {
      headers: {
        host,
        referer,
      },
      url,
    } = request

    const links = mapping[`${host}${url}`]

    if (links) {
      const linkHeaderValues = []

      for (const preloadUrl in links) {
        const {asType, isPushable} = links[preloadUrl]
        const nopush = isPushable ? '' : '; nopush'

        linkHeaderValues.push(`<${preloadUrl}>; rel=preload; as=${asType}${nopush}`)
      }

      response.append('Link', linkHeaderValues.join(', '))
    }

    const {query = {}} = urlParse(url, true)
    const {'preload-as': preloadAs} = query

    if (preloadAs) {
      const refererKey = referer && referer.replace(/^https?:\/\//, '')

      if (!mapping[refererKey]) mapping[refererKey] = {}

      mapping[refererKey][url] = {
        asType: preloadAs,
        isPushable: typeof query['preload-nopush'] === 'undefined',
      }
    }

    return next()
  }
}
