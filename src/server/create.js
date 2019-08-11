import fastify from 'fastify'
import fastifyStatic from 'fastify-static'
import flushChunks from 'webpack-flush-chunks'
import {clearChunks, flushChunkNames} from 'react-universal-component/server'
import {renderToString} from 'react-dom/server'
import {resolve} from 'path'

import App from '../client/component/App.js'
import createWebpackConfig from '../../webpack.config.js'
import {readOutputPath, readPublicPath, readStats} from './webpack.js'
import {readTemplate} from './template.js'

export async function createServer () {
  const webpackConfig = createWebpackConfig(null, {mode: 'production'})
  const webpackOutputPath = readOutputPath(webpackConfig)
  const webpackPublicPath = readPublicPath(webpackConfig)
  const webpackStats = await readStats(webpackConfig)

  const templatePath = resolve(__dirname, 'app.html')
  const appTemplate = await readTemplate(templatePath)

  const server = fastify({
    logger: true,
  })

  server.register(fastifyStatic, {
    root: webpackOutputPath,
  })

  server.get('/', async (request, reply) => {
    clearChunks()
    const app = renderToString(App())
    const chunkNames = flushChunkNames()

    const {
      js,
      scripts,
      styles,
      stylesheets,
    } = flushChunks(webpackStats, {chunkNames})

    const pushAssets = []
      .concat(stylesheets.map(asset => [asset, 'style']))
      .concat(scripts.map(asset => [asset, 'script']))

    if (pushAssets.length > 0) {
      const linkHeaderValue = pushAssets
        .map(([asset, type]) => `<${webpackPublicPath}${asset}>; rel=preload; as=${type}`)
        .join(', ')

      reply.header('link', linkHeaderValue)
    }

    const html = appTemplate({app, js, styles})

    reply
      .type('text/html')
      .send(html)
  })

  return server
}
