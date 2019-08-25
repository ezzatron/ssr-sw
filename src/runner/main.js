import express from 'express'
import webpack from 'webpack'
import webpackDevMiddleware from 'webpack-dev-middleware'
import webpackHotMiddleware from 'webpack-hot-middleware'
import webpackHotServerMiddleware from 'webpack-hot-server-middleware'

import createConfig from '../../webpack.config.babel.js'

const config = createConfig(null, {mode: 'development'})
const clientConfig = config.find(({name}) => name === 'client')
const compiler = webpack(config)
const clientComiler = compiler.compilers.find(({name}) => name === 'client')

const {output: {publicPath}} = clientConfig

const app = express()

app.use(webpackDevMiddleware(compiler, {
  publicPath,
  serverSideRender: true,
}))
app.use(webpackHotMiddleware(clientComiler))
app.use(webpackHotServerMiddleware(compiler))

app.listen(8080, '0.0.0.0', () => {
  console.log('Listening at http://127.0.0.1:8080/')
})
