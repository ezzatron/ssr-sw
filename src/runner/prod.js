/* eslint-disable import/no-commonjs */

const express = require('express')
const morgan = require('morgan')
const {join} = require('path')

const createConfig = require('../../webpack.config.js')
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
  app.use(express.static(clientPath))
  app.use(createMainMiddleware({clientStats}))

  app.listen(8080, '0.0.0.0', () => {
    console.log('Listening at http://127.0.0.1:8080/')
  })
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
