/* eslint-disable import/no-commonjs */

const createStaticMiddleware = require('express-static-gzip')
const express = require('express')
const fs = require('fs')
const morgan = require('morgan')
const {basename, join} = require('path')

const createConfig = require('../../webpack.config.js')
const {cacheControlByBasename} = require('./caching.js')
const {readFile} = require('./fs.js')

// this is just the 'combined' format prefixed with the Host header
const LOG_FORMAT = ':req[Host] :remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"'

async function main () {
  const config = createConfig(null, {mode: 'production'})
  const clientConfig = config.find(({name}) => name === 'client')
  const serverConfig = config.find(({name}) => name === 'server')

  const {output: {path: clientPath}} = clientConfig
  const clientStats = JSON.parse(await readFile(join(clientPath, '.stats.json')))

  const {output: {path: serverPath}} = serverConfig
  const {default: createMainMiddleware} = require(join(serverPath, 'main.js'))

  const app = express()

  app.set('env', 'production')
  app.set('trust proxy', true)
  app.set('x-powered-by', false)

  app.use(morgan(LOG_FORMAT))
  app.use(createStaticMiddleware(clientPath, {
    enableBrotli: true,
    index: false,
    orderPreference: ['br'],
    setHeaders (response, urlPath) {
      response.setHeader('Cache-Control', cacheControlByBasename(basename(urlPath)))
    },
  }))

  app.use((request, response, next) => {
    response.locals.fs = fs
    next()
  })

  app.use(createMainMiddleware({
    clientStats,
    createAppRouter: options => express.Router(options),
    secret: 'prod-secret',
  }))

  app.listen(8080, '0.0.0.0', () => {
    console.log('Listening at http://127.0.0.1:8080/')
  })
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
