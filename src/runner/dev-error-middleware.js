/* eslint-disable import/no-commonjs */

const PrettyError = require('pretty-error')
const Youch = require('@nuxtjs/youch')

module.exports = function devErrorMiddleware (compiler) {
  const {context} = compiler

  const prettyError = new PrettyError()
  prettyError.skipNodeFiles()
  prettyError.skipPackage('express')
  prettyError.appendStyle({
    'pretty-error': {
      marginLeft: '0',
    },
    'pretty-error > header > title > kind': {
      padding: '0 1',
      background: 'red',
      color: 'black',
    },
    'pretty-error > header > colon': {
      display: 'none',
    },
    'pretty-error > header > message': {
      padding: '0 1',
      color: 'red',
    },
    'pretty-error > trace': {
      marginTop: '0',
      marginLeft: '1',
    },
    'pretty-error > trace > item': {
      marginBottom: '0',
    },
  })

  return (error, request, response, next) => {
    if (!error) next()

    error.status = 500
    error.stack = error.stack.replace(/[^\s(]*webpack:/g, context)

    const youch = new Youch(error, request)

    youch.toHTML().then(html => {
      response.writeHead(500, {
        'Cache-Control': 'no-store',
        'Content-Length': html.length,
        'Content-Type': 'text/html',
      })

      response.write(html)
      response.end()
    })

    console.error(prettyError.render(error).replace(/\n[^\n]*$/s, ''))
  }
}
