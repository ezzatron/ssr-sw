import fastify from 'fastify'
import fastifyStatic from 'fastify-static'

import createWebpackConfig from '../../webpack.config.js'
import {createRenderMiddleware, createUseAsync} from './middleware.js'
import {readOutputPath} from './webpack.js'

export async function createServer () {
  const [webpackConfig] = createWebpackConfig(null, {mode: 'production'})
  const webpackOutputPath = readOutputPath(webpackConfig)

  const app = fastify({
    logger: true,
  })
  const use = createUseAsync(app)

  app.register(fastifyStatic, {
    root: webpackOutputPath,
  })

  use(await createRenderMiddleware(webpackConfig))

  return app
}
