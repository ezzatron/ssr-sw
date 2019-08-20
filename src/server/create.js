import express from 'express'
import morgan from 'morgan'
import {createServer} from 'http'
import {resolve} from 'path'

import {createRenderMiddleware, createUseAsync} from './middleware.js'

export async function createAppServer (rootPath) {
  const webPath = resolve(rootPath, 'web')

  const app = express()
  const server = createServer(app)
  const useAsync = createUseAsync(app)

  app.use(morgan('tiny'))
  app.use(express.static(webPath))
  useAsync(await createRenderMiddleware(rootPath))

  app.set('trust proxy', true)
  app.set('x-powered-by', false)

  return {app, server}
}
