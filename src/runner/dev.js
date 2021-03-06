/* eslint-disable import/no-commonjs */

const express = require('express')
const morgan = require('morgan')
const webpack = require('webpack')
const webpackDevMiddleware = require('webpack-dev-middleware')
const webpackHotMiddleware = require('webpack-hot-middleware')
const webpackHotServerMiddleware = require('webpack-hot-server-middleware')

const createConfig = require('../../webpack.config.js')
const devErrorMiddleware = require('./dev-error-middleware.js')

const config = createConfig(null, {mode: 'development'})
const clientConfig = config.find(({name}) => name === 'client')
const compiler = webpack(config)
const clientCompiler = compiler.compilers.find(({name}) => name === 'client')
const serverCompiler = compiler.compilers.find(({name}) => name === 'server')

const {output: {publicPath}} = clientConfig

const app = express()

app.set('env', 'development')
app.set('trust proxy', true)
app.set('x-powered-by', false)

app.use(morgan('dev'))
app.use(webpackDevMiddleware(compiler, {
  headers: {
    'Cache-Control': 'no-cache',
  },
  publicPath,
  serverSideRender: true,
  stats: {
    colors: true,
    entrypoints: false,
    excludeAssets: /(\.hot-update\.|.*(?<!\.(js|css))$)/,
    modules: false,
  },
}))
app.use(webpackHotMiddleware(clientCompiler))
app.use(webpackHotServerMiddleware(compiler, {
  serverRendererOptions: {
    createAppRouter: options => express.Router(options),
    secret: 'dev-secret',
  },
}))
app.use(devErrorMiddleware(serverCompiler))

app.listen(8080, '0.0.0.0', () => {
  console.log('Listening at http://127.0.0.1:8080/')
})
