import fastify from 'fastify'
import fastifyStatic from 'fastify-static'
import flushChunks from 'webpack-flush-chunks'
import {clearChunks, flushChunkNames} from 'react-universal-component/server'
import {renderToString} from 'react-dom/server'

import App from '../client/component/App.js'
import createWebpackConfig from '../../webpack.config.js'
import {readOutputPath, readStats} from './webpack.js'

export async function createServer () {
  const webpackConfig = createWebpackConfig(null, {mode: 'production'})
  const webpackOutputPath = readOutputPath(webpackConfig)
  const webpackStats = await readStats(webpackConfig)

  const server = fastify({
    logger: true,
  })

  server.register(fastifyStatic, {
    root: webpackOutputPath,
  })

  server.get('/', (request, reply) => {
    clearChunks()
    const app = renderToString(App())
    const chunkNames = flushChunkNames()
    const {js, styles} = flushChunks(webpackStats, {chunkNames})

    const head = `<head>${styles}</head>`
    const body = `<body><div id="root">${app}</div>${js}</body>`

    reply
      .type('text/html')
      .send(`<!doctype html><html>${head}${body}</html>`)
  })

  return server
}
