import express from 'express'

export function createApiV1 () {
  const app = express()

  app.set('env', process.env.NODE_ENV)
  app.set('trust proxy', true)
  app.set('x-powered-by', false)

  app.get('/user', (request, response) => {
    const {userId} = request.signedCookies

    response.end(userId)
  })

  return app
}
