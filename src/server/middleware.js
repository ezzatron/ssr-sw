import {ChunkExtractor} from '@loadable/server'
import {cloneRouter, constants as routerConstants} from 'router5'
import {compile} from 'ejs'
import {renderToString} from 'react-dom/server'
import {resolve} from 'path'

import App from '../client/component/App.js'
import appTemplate from './main.ejs.html'
import {createRouter, startRouter} from '../routing.js'

const {UNKNOWN_ROUTE} = routerConstants

export function createServerMiddleware (options) {
  const baseRouter = createRouter()
  const renderMiddleware = createRenderMiddleware(options)

  return async function serverMiddleware (request, response, next) {
    const router = cloneRouter(baseRouter)
    const routerState = await startRouter(router, request.originalUrl)

    const {
      name: routeName,
      params: routerParams,
      meta: {
        options: {
          redirected: isRedirect,
        } = {},
      } = {},
    } = routerState

    if (routeName === UNKNOWN_ROUTE) return next()

    if (isRedirect) {
      response.writeHead(302, {
        location: router.buildPath(routeName, routerParams),
      })
      response.end()

      return
    }

    request.router = router
    request.routerState = routerState

    renderMiddleware(request, response, next)
  }
}

function createRenderMiddleware (options) {
  const {clientStats} = options

  return async function renderMiddleware (request, response, next) {
    const {router, routerState} = request

    const props = {
      router,
    }

    const webExtractor = new ChunkExtractor({stats: clientStats})
    const jsx = webExtractor.collectChunks(App(props))
    const appHtml = renderToString(jsx)
    const linkElements = webExtractor.getLinkElements()
    const scriptTags = webExtractor.getScriptTags()
    const styleTags = webExtractor.getStyleTags()

    const appState = {
      router: routerState,
    }

    const html = appTemplate({
      appHtml,
      appState,
      scriptTags,
      styleTags,
    })

    response.setHeader('Content-Type', 'text/html')
    response.setHeader('Content-Length', html.length)

    if (linkElements.length > 0) {
      const linkHeaderValue = linkElements
        .map(linkElement => {
          const {props: {as: type, href, rel}} = linkElement

          return `<${href}>; rel=${rel}; as=${type}`
        })
        .join(', ')

      response.setHeader('Link', linkHeaderValue)
    }

    response.end(html)
  }
}
