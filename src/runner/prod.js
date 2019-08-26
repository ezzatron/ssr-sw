import express from 'express'
import {join} from 'path'

import createConfig from '../../webpack.config.babel.js'
import {readFile} from './fs.js'

async function main () {
  const config = createConfig(null, {mode: 'production'})
  const clientConfig = config.find(({name}) => name === 'client')
  const serverConfig = config.find(({name}) => name === 'server')

  const {output: {path: clientPath}} = clientConfig
  const clientStats = JSON.parse(await readFile(join(clientPath, '.stats.json')))

  const {output: {path: serverPath}} = serverConfig
  const {default: createMainMiddleware} = require(join(serverPath, 'main.js'))

  const app = express()

  app.use(express.static(clientPath))
  app.use(createMainMiddleware({clientStats}))

  app.listen(8080, '0.0.0.0', () => {
    console.log('Listening at http://127.0.0.1:8080/')
  })
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
