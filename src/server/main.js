import {createAppServer} from './create.js'
import winston from 'winston'

export async function main (rootPath) {
  if (!rootPath) throw new Error('Root path not specified')

  const logger = winston.createLogger({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple(),
    ),
    transports: [new winston.transports.Console({level: 'info'})],
  })

  const {server} = await createAppServer(rootPath)

  await new Promise((resolve, reject) => {
    server.listen(8080, '127.0.0.1', error => { error ? reject(error) : resolve() })
  })

  const {address, port} = server.address()
  logger.info(`Listening at http://${address}:${port}`)
}
