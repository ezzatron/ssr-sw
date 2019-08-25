import createDevMiddleware from 'webpack-dev-middleware'
import createHotMiddleware from 'webpack-hot-middleware'
import createHotServerMiddleware from 'webpack-hot-server-middleware'
import express from 'express'
import morgan from 'morgan'
import webpack from 'webpack'

export function createApp (renderConfigPath) {
  if (!process.env.RENDER_WEBPACK_CONFIG_MODULE) throw new Error('RENDER_WEBPACK_CONFIG_MODULE must be defined')
  const renderConfig = require(process.env.RENDER_WEBPACK_CONFIG_MODULE)

  const compiler = webpack(renderConfig)
  const clientCompiler = compiler.compilers.find(({name}) => name === 'client-render')

  const app = express()

  app.use(morgan('tiny'))

  app.use(createDevMiddleware(compiler, {
    serverSideRender: true,
  }))
  app.use(createHotMiddleware(clientCompiler))
  app.use(createHotServerMiddleware(compiler))

  app.get('*', (request, response) => {
    response.send('Sup hobag')
  })

  return app
}
