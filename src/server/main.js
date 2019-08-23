import Ansi from 'ansi-to-html'

const listenOptions = {
  host: '0.0.0.0',
  port: 8080,
  url: 'http://localhost:8080/',
}

const errors = {
  app: null,
  loggger: null,
  server: null,
}

let app, logger, createApp, createLogger, createServer, server, startServer, stop
let isServerStopping = false

if (module.hot) {
  module.hot.accept('./logging.js', () => {
    loadLogger(
      () => {
        logger.error('[HMR] Logger could not be replaced due to an error')
      },
      replaceLogger,
    )
  })

  module.hot.accept('./app.js', () => {
    loadApp(
      () => {
        logger.error('[HMR] App could not be replaced due to an error')
      },
      replaceApp,
    )
  })

  module.hot.accept('./server.js', () => {
    loadServer(
      () => {
        logger.error('[HMR] Server could not be replaced due to an error')
      },
      replaceServer,
    )
  })
}

loadLogger(
  error => { die(error.stack) },
  () => { logger = createLogger() }
)
loadServer(
  error => { die(error.stack) }
)
loadApp(
  null,
  () => { app = createApp() }
)

start()

function start () {
  const ansi = new Ansi()

  function handleRequest (request, response) {
    const {
      app: appError,
      loggger: loggerError,
      server: serverError,
    } = errors

    const error = loggerError || serverError || appError

    if (error) {
      const style = '<style>body { font-size: 16px; background-color: #222; color: #EEE; }</style>'
      const head = `<head><title>Error</title>${style}</head>`
      const body = `<body><pre><code>${ansi.toHtml(error.message)}</code></pre></body>`
      const html = `<html>${head}${body}</html>`

      response.writeHead(500, 'Internal Server Error', {
        'Content-Length': html.length,
        'Content-Type': 'text/html',
      })
      response.end(html)

      return
    }

    app(request, response)
  }

  server = createServer()
  server.on('request', handleRequest)

  const stopServer = startServer(server, listenOptions, () => {
    logger.info(`Listening at ${listenOptions.url}`)
  })

  stop = async () => {
    server.removeListener('request', handleRequest)

    return stopServer()
  }
}

function replaceLogger () {
  logger.info('[HMR] Replacing logger')

  logger = createLogger()

  logger.info('[HMR] Logger replaced')
}

function replaceApp () {
  logger.info('[HMR] Replacing app')

  app = createApp()
}

function replaceServer () {
  if (isServerStopping) return

  logger.info('[HMR] Stopping current server')

  isServerStopping = true

  stop()
    .then(() => {
      stop = null

      logger.info('[HMR] Starting new server')

      start()
    })
    .finally(() => {
      isServerStopping = false
    })
}

function loadLogger (onError, onSuccess) {
  try {
    const result = require('./logging.js')
    errors.logger = null
    createLogger = result.createLogger

    onSuccess && onSuccess(result)
  } catch (error) {
    errors.logger = error
    onError && onError(error)
  }
}

function loadApp (onError, onSuccess) {
  try {
    const result = require('./app.js')
    errors.app = null
    createApp = result.createApp

    onSuccess && onSuccess(result)
  } catch (error) {
    errors.app = error
    onError && onError(error)
  }
}

function loadServer (onError, onSuccess) {
  try {
    const result = require('./server.js')
    errors.server = null
    createServer = result.createServer
    startServer = result.startServer

    onSuccess && onSuccess(result)
  } catch (error) {
    errors.server = error
    onError && onError(error)
  }
}

function die (message) {
  console.log(message)
  process.exit(1)
}
