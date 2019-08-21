export function listen (server, port, host) {
  return new Promise((resolve, reject) => {
    server.listen(port, host, error => { error ? reject(error) : resolve() })
  })
}
