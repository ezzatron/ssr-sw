import {createServer} from './create.js'

async function main () {
  const server = await createServer()

  await server.listen(8080)
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
