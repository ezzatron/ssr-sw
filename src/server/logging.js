import winston from 'winston'

export function createLogger () {
  return winston.createLogger({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple(),
    ),
    transports: [new winston.transports.Console({level: 'info'})],
  })
}
