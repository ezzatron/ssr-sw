import etag from 'etag'
import fresh from 'fresh'
import {ChunkExtractor} from '@loadable/server'
import {cloneRouter, constants as routerConstants} from 'router5'
import {compile} from 'ejs'
import {renderToString} from 'react-dom/server'

import App from '~/src/client/component/App.js'
import appTemplateContent from './main.ejs.html'
import dataPlugin from '~/src/router5-plugin-data/server.js'
import routes from '~/src/routes.js'
import {buildEntryTags} from './webpack.js'
import {startRouter} from '~/src/routing.js'

const {UNKNOWN_ROUTE} = routerConstants

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

      const webExtractor = new ChunkExtractor({stats: clientStats})
      const jsx = webExtractor.collectChunks(<App router={router} />)
      const appHtml = renderToString(jsx)
      const linkElements = webExtractor.getLinkElements()
      const scriptTags = webExtractor.getScriptTags()
      const styleTags = webExtractor.getStyleTags()

      const appData = {
        routeData: router.getDataState(),
        routerState: routerState,
        shouldHydrate: true,
      }

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

    await router.handleServerRequest(request, response)

    const isFresh = fresh(request.headers, {etag: htmlEtag})

    response.statusCode = isFresh ? 304 : 200
    response.end(isFresh || isHead ? '' : html)
  }
}

export function createRouterMiddleware (baseRouter) {
  return async function routerMiddleware (request, response, next) {
    const router = cloneRouter(baseRouter)
    router.usePlugin(dataPlugin(routes))
    const routerState = await startRouter(router, request.originalUrl)

    request.router = router
    request.routerState = routerState

    const {
      meta: {
        options: {
          redirected: isRedirect,
        } = {},
      } = {},
    } = routerState

    if (!isRedirect) return next()

    const {name, params} = routerState

    response.writeHead(302, {
      location: router.buildPath(name, params),
    })
    response.end()
  }
}
