import {createServer as createHttpServer} from 'http'

export function createServer () {
  return createHttpServer()
}

export function startServer (server, options, onListen) {
  const sockets = new Set()

  function handleConnection (socket) {
    sockets.add(socket)
  }

  async function stopServer () {
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

  server.on('connection', handleConnection)
  server.once('close', () => {
    server.removeListener('connection', handleConnection)
  })

  server.listen(options, onListen)

  return stopServer
}
