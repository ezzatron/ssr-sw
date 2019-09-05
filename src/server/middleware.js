import {ChunkExtractor} from '@loadable/server'
import {cloneRouter, constants as routerConstants} from 'router5'
import {compile} from 'ejs'
import {renderToString} from 'react-dom/server'

import App from '../client/component/App.js'
import appTemplateContent from './main.ejs.html'
import {buildEntryTags} from './webpack.js'
import {startRouter} from '../routing.js'

const {UNKNOWN_ROUTE} = routerConstants

export function createAuthMiddleware () {
  return async function authMiddleware (request, response, next) {
    await new Promise(resolve => setTimeout(resolve, 300))

    const {userId} = request.signedCookies

    switch (userId) {
      case '111': {
        request.user = {id: 111, name: 'Amy A.', username: 'amy'}

        break
      }

      case '222': {
        request.user = {id: 222, name: 'Bob B.', username: 'bob'}

        break
      }

      default:
        request.user = null
    }

    next()
  }
}

export function createRenderMiddleware (clientStats) {
  const appTemplate = compile(appTemplateContent)

  const {
    linkHeader: clientOnlyLinkHeaderValue,
    scriptTags,
    styleTags,
  } = buildEntryTags(clientStats)

  const clientOnlyHtml = appTemplate({
    appHtml: '',
    appState: null,
    scriptTags: scriptTags.join('\n'),
    styleTags: styleTags.join('\n'),
  })

  return async function renderMiddleware (request, response, next) {
    const {method, router, routerState} = request
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

    let html

    if (isServer) {
      const auth = request.user
        ? {status: 'authenticated', user: request.user}
        : {status: 'anonymous', user: null}

      const props = {
        auth,
        router,
      }

      const webExtractor = new ChunkExtractor({stats: clientStats})
      const jsx = webExtractor.collectChunks(App(props))
      const appHtml = renderToString(jsx)
      const linkElements = webExtractor.getLinkElements()
      const scriptTags = webExtractor.getScriptTags()
      const styleTags = webExtractor.getStyleTags()

      const appState = {
        auth,
        router: routerState,
      }

      html = appTemplate({
        appHtml,
        appState,
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

    response.setHeader('Content-Type', 'text/html')
    response.setHeader('Content-Length', html.length)

    if (isHead) response.end()

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
