import etag from 'etag'
import fresh from 'fresh'
import {ChunkExtractor} from '@loadable/server'
import {constants as routerConstants} from 'router5'
import {renderToString} from 'react-dom/server'

import App from '~/src/client/component/App.js'
import templateHtml from '../app.html'
import {buildEntryTags, buildHtml} from './webpack.js'

const {UNKNOWN_ROUTE} = routerConstants

export function createRenderMiddleware (clientStats) {
  const {
    linkHeader: clientOnlyLinkHeaderValue,
    scriptTags,
    styleTags,
  } = buildEntryTags(clientStats)

  const clientHtml = buildHtml(templateHtml, {
    scriptTags,
    styleTags,
  })

  return async function renderMiddleware (request, response, next) {
    const {method, routerState} = request
    const isGet = method === 'GET'
    const isHead = method === 'HEAD'

    if (!isGet && !isHead) return next()

    const {
      name: routeName,
      meta: {
        isServer,
      },
    } = routerState

    if (routeName === UNKNOWN_ROUTE) return next()

    const {router} = request
    let html

    if (isServer) {
      await router.waitForData()

      const appData = {
        routeData: router.fulfillAllData(),
        routerState: routerState,
        shouldHydrate: true,
      }

      const webExtractor = new ChunkExtractor({stats: clientStats})
      const jsx = webExtractor.collectChunks(<App router={router} />)
      const appHtml = renderToString(jsx)
      const linkElements = webExtractor.getLinkElements()
      const scriptTags = webExtractor.getScriptTags()
      const styleTags = webExtractor.getStyleTags()

      html = buildHtml(templateHtml, {
        appData,
        appHtml,
        scriptTags,
        styleTags,
      })

      if (linkElements.length > 0) {
        const linkHeaderValue = linkElements
          .map(linkElement => {
            const {props: {as: type, href, rel}} = linkElement

            return `<${href}>; rel=${rel}; as=${type}`
          })
          .join(', ')

        response.setHeader('Link', linkHeaderValue)
      }
    } else {
      html = clientHtml

      response.setHeader('Link', clientOnlyLinkHeaderValue)
    }

    const htmlEtag = etag(html)

    response.setHeader('Cache-Control', 'no-cache')
    response.setHeader('Content-Length', html.length)
    response.setHeader('Content-Type', 'text/html')
    response.setHeader('ETag', htmlEtag)

    await router.handleServerRequest(request, response)

    const isFresh = fresh(request.headers, {etag: htmlEtag})

    response.statusCode = isFresh ? 304 : 200
    response.end(isFresh || isHead ? '' : html)
  }
}
