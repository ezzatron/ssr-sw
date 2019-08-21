import {createAppServer} from './create.js'
import {createLogger} from './logging.js'
import {listen} from './net.js'

export async function main (rootPath) {
  if (!rootPath) throw new Error('Root path not specified')

  const logger = createLogger()

  const {server} = await createAppServer(rootPath)
  await listen(server, 8080, '127.0.0.1')

  const {address, port} = server.address()
  logger.info(`Listening at http://${address}:${port}`)
}
