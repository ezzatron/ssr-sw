/* eslint-disable import/no-commonjs */

const {join} = require('path')

module.exports = function pathConventions (options = {}) {
  const {
    rootPath,
  } = options

  const {
    context = join(rootPath, 'src'),
    outputPath = join(rootPath, 'artifacts/build'),
  } = options

  return {
    apply (config) {
      const name = config.name || config.target

      config.context = context
      config.output.path = join(outputPath, config.mode, name)

      config.entry = {
        main: [`./${name}/main`],
      }
    },
  }
}
