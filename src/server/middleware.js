import {ChunkExtractor} from '@loadable/server'
import {cloneRouter, constants as routerConstants} from 'router5'
import {compile} from 'ejs'
import {renderToString} from 'react-dom/server'

import App from '../client/component/App.js'
import appTemplateContent from './main.ejs.html'
import routes from '../routes.js'
import {buildEntryTags} from './webpack.js'
import {createAuthClient} from './auth-client.js'
import {createDataFetcher} from './data.js'
import {createDataMiddleware, startRouter} from '../routing.js'

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

    let html

    if (isServer) {
      const {router, routerData} = request
      const data = {}

      for (const segment in routerData) {
        const segmentData = routerData[segment]

        for (const key in segmentData) data[key] = [undefined, segmentData[key]]
      }

      const props = {
        data,
        router,
        subscribeToData: () => [noop, data],
      }

      const webExtractor = new ChunkExtractor({stats: clientStats})
      const jsx = webExtractor.collectChunks(<App {...props} />)
      const appHtml = renderToString(jsx)
      const linkElements = webExtractor.getLinkElements()
      const scriptTags = webExtractor.getScriptTags()
      const styleTags = webExtractor.getStyleTags()

      const appData = {
        routerData: routerData,
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

    response.setHeader('Content-Type', 'text/html')
    response.setHeader('Content-Length', html.length)

    if (isHead) response.end()

    response.end(html)
  }
}

export function createRouterMiddleware (baseRouter) {
  return async function routerMiddleware (request, response, next) {
    const router = request.router = cloneRouter(baseRouter, {
      authClient: createAuthClient({request}),
    })

    const {routeDataHandler, resolveData} = createDataFetcher()
    router.useMiddleware(createDataMiddleware({handler: routeDataHandler, routes}))

    const routerState = request.routerState = await startRouter(router, request.originalUrl)
    request.routerData = await resolveData()

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

function noop () {}
