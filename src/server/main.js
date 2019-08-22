import {createServer} from 'http'

// import {createApp} from './app.js'

const sockets = new Set()
let close, server

async function start () {
  if (close) await close()

  const {createApp} = require('./app.js')
  const app = createApp()
  server = createServer(app)

  function handleConnection (socket) {
    sockets.add(socket)
  }

  server.on('connection', handleConnection)
  server.once('close', () => { server.removeListener('connection', handleConnection) })

  close = async () => {
    if (!server.listening) {
      await new Promise(resolve => {
        server.once('listening', resolve)
      })
    }

    sockets.forEach(socket => {
      socket.destroy()
      sockets.delete(socket)
    })

    return new Promise((resolve, reject) => {
      server.close(error => { error ? reject(error) : resolve() })
    })
  }

  server.listen(8080, '0.0.0.0', () => {
    console.log('listening at http://127.0.0.1:8080/')
  })
}

function startSync() {
  start().then(
    () => {},
    error => { console.error(error) },
  )
}

startSync()

if (module.hot) {
  console.log('Yup, we hot')

  module.hot.accept('./app.js', () => {
    console.log('Got hotter')

    startSync()
  })
}
