import {ChunkExtractor} from '@loadable/server'
import {cloneRouter, constants as routerConstants} from 'router5'
import {compile} from 'ejs'
import {renderToString} from 'react-dom/server'
import {resolve} from 'path'

import {createRouter, startRouter} from '../routing.js'
import {readFile} from './fs.js'

const {UNKNOWN_ROUTE} = routerConstants

export async function createRenderMiddleware (rootPath) {
  const nodeStatsPath = resolve(rootPath, 'node/.loadable-stats.json')
  const webStatsPath = resolve(rootPath, 'web/.loadable-stats.json')

  const appTemplatePath = resolve(__dirname, 'app.html')
  const appTemplateContent = await readFile(appTemplatePath)
  const appTemplate = compile(appTemplateContent.toString(), {filename: appTemplatePath})
  const baseRouter = createRouter()

  return async function renderMiddleware (request, response, next) {
    const {method} = request
    const isHead = method === 'HEAD'

    if (!isHead && method !== 'GET') return next()

    const router = cloneRouter(baseRouter)
    const routerState = await startRouter(router, request.originalUrl)
    const {name: routeName} = routerState

    if (routeName === UNKNOWN_ROUTE) return next()

    const {meta: {options: {redirected: isRedirect} = {}} = {}} = routerState

    if (isRedirect) {
      const redirectUrl = router.buildPath(routeName, routerState.params)

      response.writeHead(302, {
        location: redirectUrl,
      })
      response.end()

      return
    }

    const nodeExtractor = new ChunkExtractor({statsFile: nodeStatsPath})
    const webExtractor = new ChunkExtractor({statsFile: webStatsPath})

    const {default: App} = nodeExtractor.requireEntrypoint()

    const props = {
      router,
    }

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

export function createUseAsync (app) {
  return function use (...args) {
    args = args.map(arg => {
      if (typeof arg === 'function') return asyncMiddleware(arg)

      return arg
    })

    return app.use(...args)
  }
}

function asyncMiddleware (middleware) {
  return (...args) => {
    const next = args[args.length - 1]
    const result = middleware(...args)

    if (typeof result !== 'object' || typeof result.catch !== 'function') return

    result.catch(next)
  }
}
