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

      for (const linkKey in links) {
        const {
          isPushable,
          preloadAs,
          preloadUrl,
        } = links[linkKey]

        const nopush = isPushable ? '' : '; nopush'

        linkHeaderValues.push(`<${preloadUrl}>; rel=preload; as=${preloadAs}${nopush}`)
      }

      response.append('Link', linkHeaderValues.join(', '))
    }

    if (!referer) return next()

    const parsedUrl = urlParse(url, true)
    const preloadAs = parsedUrl.query['preload-as']
    const isPushable = typeof parsedUrl.query['preload-nopush'] === 'undefined'

    if (preloadAs) {
      const refererKey = referer.replace(/^https?:\/\//, '')

      parsedUrl.protocol = ''
      parsedUrl.slashes = false
      delete parsedUrl.query['preload-as']
      delete parsedUrl.query['preload-nopush']

      const linkKey = parsedUrl.toString()

      if (!mapping[refererKey]) mapping[refererKey] = {}

      mapping[refererKey][linkKey] = {
        isPushable,
        preloadAs,
        preloadUrl: url,
      }
    }

    return next()
  }
}
