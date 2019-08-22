import express from 'express'

export function createApp () {
  const app = express()

  app.get('*', (request, response) => {
    response.send('Sup hobag')
  })

  return app
}
