import express from 'express'

const app = express()

app.get('*', (request, response) => {
  response.send('Sup')
})

app.listen(8080, '0.0.0.0', () => {
  console.log(`Listening on http://127.0.0.1:8080/`)
})
