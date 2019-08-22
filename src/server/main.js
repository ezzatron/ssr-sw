import {createServer} from 'http'

let {createApp} = require('./app.js')

const sockets = new Set()
let close, server

restartSync()

function restartSync() {
  restart().then(
    () => {},
    error => { console.error(error) },
  )
}

async function restart () {
  if (close) {
    await close()
    close = null
  }

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

if (module.hot) {
  module.hot.accept('./app.js', () => {
    try {
      ({createApp} = require('./app.js'))
      restartSync()
    } catch (error) {
      console.error('[HMR] Hot update could not be applied due to error')
    }
  })
}
