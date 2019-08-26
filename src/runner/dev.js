/* eslint-disable import/no-commonjs */

const express = require('express')
const webpack = require('webpack')
const webpackDevMiddleware = require('webpack-dev-middleware')
const webpackHotMiddleware = require('webpack-hot-middleware')
const webpackHotServerMiddleware = require('webpack-hot-server-middleware')

const createConfig = require('../../webpack.config.js')
const {createLogMiddleware} = require('./middleware.js')

const config = createConfig(null, {mode: 'development'})
const clientConfig = config.find(({name}) => name === 'client')
const compiler = webpack(config)
const clientComiler = compiler.compilers.find(({name}) => name === 'client')

const {output: {publicPath}} = clientConfig

const app = express()

app.use(createLogMiddleware())
app.use(webpackDevMiddleware(compiler, {
  publicPath,
  serverSideRender: true,
}))
app.use(webpackHotMiddleware(clientComiler))
app.use(webpackHotServerMiddleware(compiler))

app.listen(8080, '0.0.0.0', () => {
  console.log('Listening at http://127.0.0.1:8080/')
})
