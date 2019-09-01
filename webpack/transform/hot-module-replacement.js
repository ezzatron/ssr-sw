/* eslint-disable import/no-commonjs */

const {HotModuleReplacementPlugin} = require('webpack')

const {isConfigTargeting} = require('../util.js')

module.exports = function hotModuleReplacement (options = {}) {
  const {
    clientQuery = '?noInfo=true',
  } = options

  const clientEntry = `webpack-hot-middleware/client${clientQuery}`

  return {
    constraints: {
      production: false,
    },

    apply (config) {
      config.plugins.push(new HotModuleReplacementPlugin())

      if (!isConfigTargeting('web', config)) return

      for (const name in config.entry) {
        config.entry[name].push(clientEntry)
      }
    },
  }
}
