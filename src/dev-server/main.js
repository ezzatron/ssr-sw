import {createServer} from 'http'

import {createLogger} from './logging.js'
import {createRequestHandler} from './request.js'

const logger = createLogger()
const handleRequest = createRequestHandler()

if (!loadApp()) logger.error('Could not load initial app')

const server = createServer(handleRequest)

server.listen(8080, '0.0.0.0', () => {
  logger.info('Listening at http://127.0.0.1:8080/')
})

function loadApp () {
  try {
    const {createApp} = require('./app.js')

    handleRequest.error = null
    handleRequest.app = createApp()

    return true
  } catch (error) {
    handleRequest.error = error

    return false
  }
}

if (module.hot) {
  module.hot.accept('./app.js', () => {
    if (loadApp()) {
      logger.info('[HMR] Replaced app')
    } else {
      logger.error('[HMR] App could not be replaced due to an error')
    }
  })
}
