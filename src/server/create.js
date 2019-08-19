import fastify from 'fastify'
import fastifyStatic from 'fastify-static'

import {createRenderMiddleware, createUseAsync} from './middleware.js'

export async function createServer (rootPath) {
  const app = fastify({
    logger: true,
  })
  const use = createUseAsync(app)

  app.register(fastifyStatic, {
    root: rootPath,
  })

  use(await createRenderMiddleware(rootPath))

  return app
}
