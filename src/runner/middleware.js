/* eslint-disable import/no-commonjs */

// const lruCache = require('lru-cache')
const urlParse = require('url-parse')

module.exports = {
  createPushableMiddleware,
}

function createPushableMiddleware () {
  const pushable = {}

  return function pushableMiddleware (request, response, next) {
    const fullUrl = `${request.protocol}://${request.get('host')}${request.originalUrl}`
    const pushables = pushable[fullUrl]

    if (pushables) {
      for (const entry of pushables) {
        const [url, asType] = entry.split(',')

        response.append('Link', `<${url}>; rel=preload; as=${asType}`)
      }
    }

    const {query} = urlParse(request.url, true)
    const pushableAs = query.pushable

    if (pushableAs) {
      const {referer} = request.headers

      if (!pushable[referer]) pushable[referer] = new Set()

      pushable[referer].add(`${request.url},${pushableAs}`)
    }

    return next()
  }
}
