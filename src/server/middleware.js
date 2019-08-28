import {ChunkExtractor} from '@loadable/server'
import {cloneRouter, constants as routerConstants} from 'router5'
import {compile} from 'ejs'
import {renderToString} from 'react-dom/server'

import App from '../client/component/App.js'
import appTemplateContent from './main.ejs.html'
import {createHtmlProcessor} from './html.js'
import {startRouter} from '../routing.js'

const {UNKNOWN_ROUTE} = routerConstants

export function createRenderMiddleware (clientStats) {
  const appTemplate = compile(appTemplateContent)
  const processHtml = createHtmlProcessor()

  return async function renderMiddleware (request, response, next) {
    const {router, routerState} = request
    const {name: routeName} = routerState

    if (routeName === UNKNOWN_ROUTE) return next()

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

    const html = processHtml(appTemplate({
      appHtml,
      appState,
      scriptTags,
      styleTags,
    }))

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

export function createRouterMiddleware (baseRouter) {
  return async function routerMiddleware (request, response, next) {
    const router = request.router = cloneRouter(baseRouter)
    const routerState = request.routerState = await startRouter(router, request.originalUrl)

    const {
      name: routeName,
      params: routerParams,
      meta: {
        options: {
          redirected: isRedirect,
        } = {},
      } = {},
    } = routerState

    if (!isRedirect) return next()

    response.writeHead(302, {
      location: router.buildPath(routeName, routerParams),
    })
    response.end()
  }
}
