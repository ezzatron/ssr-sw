import bodyParser from 'body-parser'
import express from 'express'

import {asyncMiddleware} from './express.js'

export function createApiV1 () {
  const app = express()

  app.set('env', process.env.NODE_ENV)
  app.set('trust proxy', true)
  app.set('x-powered-by', false)

  app.use(bodyParser.json())

  app.get('/user', asyncMiddleware(async (request, response) => {
    const {userId} = request.signedCookies
    const user = userId ? findUser(userId) : null

    if (userId && !user) response.clearCookie('userId', {httpOnly: true, signed: true})

    response.setHeader('Cache-Control', 'no-cache')
    response.json(user)
  }))

  app.post('/sign-in', asyncMiddleware(async (request, response) => {
    await new Promise(resolve => setTimeout(resolve, 300))

    const {userId} = request.body
    const user = findUser(userId)

    if (user) {
      response.cookie('userId', userId, {httpOnly: true, signed: true})
    } else {
      response.clearCookie('userId', {httpOnly: true, signed: true})
    }

    response.setHeader('Cache-Control', 'no-cache')
    response.json(user)
  }))

  app.post('/sign-out', asyncMiddleware(async (request, response) => {
    response.clearCookie('userId', {httpOnly: true, signed: true})

    response.setHeader('Cache-Control', 'no-cache')
    response.end()
  }))

  app.post('/slow', asyncMiddleware(async (request, response) => {
    await new Promise(resolve => setTimeout(resolve, 3000))

    response.setHeader('Cache-Control', 'no-cache')
    response.json({echo: request.body.echo})
  }))

  return app
}

function findUser (userId) {
  if (userId === '111') return {name: 'Amy'}
  if (userId === '222') return {name: 'Bob'}

  return null
}
