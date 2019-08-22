import MemoryFs from 'memory-fs'
import webpack from 'webpack'

import createConfig from '../../webpack.config.js'

const config = createConfig()
const compiler = webpack(config)

const fileSystem = new MemoryFs()
compiler.outputFileSystem = fileSystem

compiler.watch({}, (error, stats) => {
  if (error) return console.error(error)

  console.log(stats.toString({colors: true}))
})
