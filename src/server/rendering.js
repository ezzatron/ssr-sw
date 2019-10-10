import etag from 'etag'
import fresh from 'fresh'
import {ChunkExtractor} from '@loadable/server'
import {compile} from 'ejs'
import {renderToString} from 'react-dom/server'

import App from '~/src/client/component/App.js'
import appTemplateContent from './main.ejs.html'
import {buildEntryTags} from './webpack.js'

export function createRenderMiddleware (clientStats) {
  const appTemplate = compile(appTemplateContent)

  const {
    linkHeader: clientOnlyLinkHeaderValue,
    scriptTags,
    styleTags,
  } = buildEntryTags(clientStats)

  const clientOnlyHtml = appTemplate({
    appData: undefined,
    appHtml: '',
    scriptTags: scriptTags.join('\n'),
    styleTags: styleTags.join('\n'),
  })

  return async function renderMiddleware (request, response, next) {
    const {method, route, router, routerState} = request
    const isGet = method === 'GET'
    const isHead = method === 'HEAD'

    if (!route || (!isGet && !isHead)) return next()

    let html

    if (router.getRouteOption(route.name, 'ssr')) {
      // TODO: re-add router data
      // await router.waitForData()

      const appData = {
        // routeData: router.fulfillAllData(), // TODO: re-add router data
        routerState: routerState,
        shouldHydrate: true,
      }

      const webExtractor = new ChunkExtractor({stats: clientStats})
      const jsx = webExtractor.collectChunks(<App router={router} />)
      const appHtml = renderToString(jsx)
      const linkElements = webExtractor.getLinkElements()
      const scriptTags = webExtractor.getScriptTags()
      const styleTags = webExtractor.getStyleTags()

      html = appTemplate({
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
      html = clientOnlyHtml

      response.setHeader('Link', clientOnlyLinkHeaderValue)
    }

    const htmlEtag = etag(html)

    response.setHeader('Cache-Control', 'no-cache')
    response.setHeader('Content-Length', html.length)
    response.setHeader('Content-Type', 'text/html')
    response.setHeader('ETag', htmlEtag)

    // TODO: re-add headers
    // await router.handleServerRequest(request, response)

    const isFresh = fresh(request.headers, {etag: htmlEtag})

    response.statusCode = isFresh ? 304 : 200
    response.end(isFresh || isHead ? '' : html)
  }
}
