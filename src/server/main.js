import {createServer} from './create.js'

export async function main (rootPath) {
  if (!rootPath) throw new Error('Root path not specified')

  const server = await createServer(rootPath)

  await server.listen(8080)
}
