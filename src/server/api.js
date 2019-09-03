import express from 'express'

export function createApiV1 (router) {
  const app = express()

  app.set('env', process.env.NODE_ENV)
  app.set('trust proxy', true)
  app.set('x-powered-by', false)

  app.post('/sign-in', (request, response) => {
    const {userId} = request.body
    const isValid = /^[1-9]\d*$/.test(userId)

    if (!isValid) return response.sendStatus(400)

    response.cookie('userId', userId, {httpOnly: true})
    response.redirect(router.buildPath('foo'))
  })

  app.post('/sign-out', (request, response) => {
    response.clearCookie('userId', {httpOnly: true})
    response.redirect(router.buildPath('sign-in'))
  })

  return app
}
