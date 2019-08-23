import Ansi from 'ansi-to-html'

export function createRequestHandler () {
  const ansi = new Ansi()

  function handleRequest (request, response) {
    const {app, error} = handleRequest

    if (error) {
      const errorHtml = ansi.toHtml(error.message)

      const style = '<style>body { font-size: 16px; background-color: #222; color: #EEE; }</style>'
      const head = `<head><title>Error</title>${style}</head>`
      const body = `<body><pre><code>${errorHtml}</code></pre></body>`
      const html = `<html>${head}${body}</html>`

      response.writeHead(500, 'Internal Server Error', {
        'Content-Length': html.length,
        'Content-Type': 'text/html',
      })
      response.end(html)

      return
    }

    app(request, response)
  }

  return handleRequest
}
