/* eslint-disable import/no-commonjs */

const express = require('express')
const morgan = require('morgan')
const webpack = require('webpack')
const webpackDevMiddleware = require('webpack-dev-middleware')
const webpackHotMiddleware = require('webpack-hot-middleware')
const webpackHotServerMiddleware = require('webpack-hot-server-middleware')

const {createPushableMiddleware} = require('./middleware.js')

const createConfig = require('../../webpack.config.js')

const config = createConfig(null, {mode: 'development'})
const clientConfig = config.find(({name}) => name === 'client')
const compiler = webpack(config)
const clientComiler = compiler.compilers.find(({name}) => name === 'client')

const {output: {publicPath}} = clientConfig

const app = express()

app.set('env', 'development')
app.set('trust proxy', true)
app.set('x-powered-by', false)

app.use(morgan('dev'))
app.use(createPushableMiddleware())
app.use(webpackDevMiddleware(compiler, {
  publicPath,
  serverSideRender: true,
  stats: {
    colors: true,
    entrypoints: false,
    excludeAssets: /(\.hot-update\.|.*(?<!\.(js|css))$)/,
    modules: false,
  },
}))
app.use(webpackHotMiddleware(clientComiler))
app.use(webpackHotServerMiddleware(compiler))

app.listen(8080, '0.0.0.0', () => {
  console.log('Listening at http://127.0.0.1:8080/')
})
