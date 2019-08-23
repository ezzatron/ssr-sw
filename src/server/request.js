import Ansi from 'ansi-to-html'

export function createRequestHandler () {
  const ansi = new Ansi()

  function handleRequest (request, response) {
    const {app, error} = handleRequest

    if (error) {
      const errorHtml = ansi.toHtml(trimError(error))

      const style =
        '<style>' +
        'body { margin: 40px; background-color: #333; color: #EEE; }' +
        'h1 { font-size: 50px; font-weight: 400; font-family: sans-serif; }' +
        'pre { font-size: 20px; padding: 1em; overflow: auto; background-color: #222; }' +
        '</style>'
      const head = `<head><title>Server Error</title>${style}</head>`
      const title = '<h1>Server Error</h1>'
      const code = `<pre><code>${errorHtml}</code></pre>`
      const body = `<body>${title}${code}</body>`
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

function trimError (error) {
  const {message} = error

  return message.replace(/.*Module build failed.*\n([\s\S]*?)\s+at [\s\S]*$/, '$1')
}
