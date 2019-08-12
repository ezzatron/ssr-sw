import flushChunks from 'webpack-flush-chunks'
import {clearChunks, flushChunkNames} from 'react-universal-component/server'
import {cloneRouter, constants as routerConstants} from 'router5'
import {renderToString} from 'react-dom/server'
import {resolve} from 'path'

import App from '../client/component/App.js'
import {createRouter, startRouter} from '../routing.js'
import {readPublicPath, readStats} from './webpack.js'
import {readTemplate} from './template.js'

const {UNKNOWN_ROUTE} = routerConstants

export async function createRenderMiddleware (webpackConfig) {
  const webpackPublicPath = readPublicPath(webpackConfig)
  const webpackStats = await readStats(webpackConfig)

  const templatePath = resolve(__dirname, 'app.html')
  const appTemplate = await readTemplate(templatePath)

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

    const props = {
      router,
    }

    clearChunks()
    const app = renderToString(App(props))
    const chunkNames = flushChunkNames()

    const {
      js,
      scripts,
      styles,
      stylesheets,
    } = flushChunks(webpackStats, {chunkNames})

    const html = appTemplate({app, js, routerState, styles})

    response.setHeader('content-type', 'text/html')
    response.setHeader('content-length', html.length)

    const pushAssets = []
      .concat(stylesheets.map(asset => [asset, 'style']))
      .concat(scripts.map(asset => [asset, 'script']))

    if (pushAssets.length > 0) {
      const linkHeaderValue = pushAssets
        .map(([asset, type]) => `<${webpackPublicPath}${asset}>; rel=preload; as=${type}`)
        .join(', ')

      response.setHeader('link', linkHeaderValue)
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
