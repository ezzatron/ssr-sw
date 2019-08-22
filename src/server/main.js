let {createApp} = require('./app.js')
let {createLogger} = require('./logging.js')
let {createServer, startServer} = require('./server.js')

const listenOptions = {
  host: '0.0.0.0',
  port: 8080,
  url: 'http://localhost:8080/',
}

let server, stopServer
let isServerStopping = false
let logger = createLogger()
let app = createApp()

start()

function start () {
  server = createServer()
  server.on('request', app)

  stopServer = startServer(server, listenOptions, () => {
    logger.info(`Listening at ${listenOptions.url}`)
  })
}

function replaceLogger () {
  logger.info('[HMR] Replacing logger')

  logger = createLogger()

  logger.info('[HMR] Logger replaced')
}

function replaceApp () {
  logger.info('[HMR] Removing current app')

  server.removeListener('request', app)

  logger.info('[HMR] Adding new app')

  app = createApp()
  server.on('request', app)
}

function replaceServer () {
  if (isServerStopping) return

  logger.info('[HMR] Stopping current server')

  isServerStopping = true

  stopServer()
    .then(() => {
      stopServer = null

      logger.info('[HMR] Starting new server')

      start()
    })
    .finally(() => {
      isServerStopping = false
    })
}

if (module.hot) {
  module.hot.accept('./logging.js', () => {
    try {
      ({createLogger} = require('./logging.js'))
    } catch (error) {
      logger.error('[HMR] Logger could not be replaced due to an error')

      return
    }

    replaceLogger()
  })

  module.hot.accept('./app.js', () => {
    try {
      ({createApp} = require('./app.js'))
    } catch (error) {
      logger.error('[HMR] App could not be replaced due to an error')

      return
    }

    replaceApp()
  })

  module.hot.accept('./server.js', () => {
    try {
      ({createServer, startServer} = require('./server.js'))
    } catch (error) {
      logger.error('[HMR] Server could not be replaced due to an error')

      return
    }

    replaceServer()
  })
}
