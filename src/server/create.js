import fastify from 'fastify'
import fastifyStatic from 'fastify-static'
import {resolve} from 'path'

import {createRenderMiddleware, createUseAsync} from './middleware.js'

export async function createServer (rootPath) {
  const app = fastify({
    logger: true,
  })
  const use = createUseAsync(app)

  const webPath = resolve(rootPath, 'web')
  app.register(fastifyStatic, {
    root: webPath,
  })

  use(await createRenderMiddleware(rootPath))

  return app
}
