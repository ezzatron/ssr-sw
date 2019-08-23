import express from 'express'
import morgan from 'morgan'

export function createApp () {
  const app = express()

  app.use(morgan('tiny'))

  app.get('*', (request, response) => {
    response.send('Sup hobag')
  })

  return app
}
