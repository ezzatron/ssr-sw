import fastify from 'fastify'
import fastifyStatic from 'fastify-static'
import flushChunks from 'webpack-flush-chunks'
import React from 'react'
import webpack from 'webpack'
import {clearChunks, flushChunkNames} from 'react-universal-component/server'
import {renderToString} from 'react-dom/server'

import App from '../client/component/App.js'
import {createConfig} from '../client/webpack.js'

export async function createServer () {
  const webpackConfig = createConfig()
  const webpackCompiler = webpack(webpackConfig)
  const webpackStats = await new Promise((resolve, reject) => {
    webpackCompiler.run((error, stats) => {
      error ? reject(error) : resolve(stats)
    })
  })

  console.log(webpackStats.toString({
    colors: true,
  }))

  if (webpackStats.hasErrors()) throw new Error('Webpack build failed')

  const server = fastify({
    logger: true,
  })

  server.register(fastifyStatic, {
    root: webpackConfig.output.path,
  })

  server.get('/', (request, reply) => {
    clearChunks()
    const app = renderToString(App())
    const {js, styles} = flushChunks(
      webpackStats.toJson(),
      {
        chunkNames: flushChunkNames(),
      },
    )

    const head = `<head>${styles}</head>`
    const body = `<body><div id="root">${app}</div>${js}</body>`

    reply
      .type('text/html')
      .send(`<!doctype html><html>${head}${body}</html>`)
  })

  return server
}
