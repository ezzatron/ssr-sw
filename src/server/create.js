import fastify from 'fastify'
import fastifyStatic from 'fastify-static'
import flushChunks from 'webpack-flush-chunks'
import {clearChunks, flushChunkNames} from 'react-universal-component/server'
import {renderToString} from 'react-dom/server'
import {resolve} from 'path'

import App from '../client/component/App.js'
import createWebpackConfig from '../../webpack.config.js'
import {close, fstat, open, readFile} from './fs.js'
import {readOutputPath, readPublicPath, readStats} from './webpack.js'
import {readTemplate} from './template.js'

export async function createServer () {
  const webpackConfig = createWebpackConfig(null, {mode: 'production'})
  const webpackOutputPath = readOutputPath(webpackConfig)
  const webpackPublicPath = readPublicPath(webpackConfig)
  const webpackStats = await readStats(webpackConfig)

  const templatePath = resolve(__dirname, 'app.html')
  const appTemplate = await readTemplate(templatePath)

  const rootPath = resolve(__dirname, '../..')
  const certPath = resolve(rootPath, 'artifacts/cert')
  const [httpsCert, httpsKey] = await Promise.all([
    readFile(resolve(certPath, 'cert.pem')),
    readFile(resolve(certPath, 'key.pem')),
  ])

  const server = fastify({
    http2: true,
    https: {
      cert: httpsCert,
      key: httpsKey,
    },
    logger: true,
  })

  server.register(fastifyStatic, {
    root: webpackOutputPath,
  })

  server.get('/', async (request, reply) => {
    clearChunks()
    const app = renderToString(App())
    const chunkNames = flushChunkNames()

    const {
      js,
      scripts,
      styles,
      stylesheets,
    } = flushChunks(webpackStats, {chunkNames})

    const pushAssets = []
      .concat(stylesheets.map(asset => [asset, 'style']))
      .concat(scripts.map(asset => [asset, 'script']))

    // for (const asset of stylesheets) {
    //   pushAssets.push([asset, 'style'])
    //   // linkEntries.push(`<${pushAsset}>; rel=preload; as=style`)
    // }

    // for (const asset of scripts) {
    //   pushAssets.push([asset, 'script'])
    //   // linkEntries.push(`<${webpackPublicPath}${script}>; rel=preload; as=script`)
    // }

    if (pushAssets.length > 0) {
      const {res: {stream}} = reply

      // await Promise.all(pushAssets.map(async ([asset, type]) => {
      //   const filePath = resolve(webpackOutputPath, asset)
      //   const publicPath = webpackPublicPath + asset
      //   const mimeType = type === 'script' ? 'text/javascript' : 'text/css'

      //   return push(stream, filePath, publicPath, mimeType)
      // }))

      const linkHeaderValue = pushAssets
        .map(([asset, type]) => `<${webpackPublicPath}${asset}>; rel=preload; as=${type}`)
        .join(', ')

      reply.header('link', linkHeaderValue)
    }

    const html = appTemplate({app, js, styles})

    reply
      .type('text/html')
      .send(html)
  })

  return server
}

async function push (stream, filePath, publicPath, mimeType) {
  const fd = await open(filePath)
  let pushStream, stat

  try {
    stat = await fstat(fd)
    pushStream = await createPushStream(stream, {':path': publicPath})
  } catch (error) {
    await close(fd)
  }

  pushStream.respondWithFD(fd, {
    'content-length': stat.size,
    'content-type': mimeType,
    'last-modified': stat.mtime.toUTCString(),
  })

  pushStream.once('close', () => { close(fd).catch(() => {}) })
}

function createPushStream (stream, ...args) {
  return new Promise((resolve, reject) => {
    stream.pushStream(...args, (error, pushStream) => {
      error ? reject(error) : resolve(pushStream)
    })
  })
}
