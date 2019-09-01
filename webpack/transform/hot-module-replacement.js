/* eslint-disable import/no-commonjs */

const {HotModuleReplacementPlugin} = require('webpack')
const {loader: mcepLoader} = require('safe-require')('mini-css-extract-plugin')

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

      for (const name in config.entry) config.entry[name].push(clientEntry)

      for (const rule of config.module.rules) {
        for (const entry of rule.use) {
          if (entry.loader === mcepLoader) entry.options.hmr = true
        }
      }
    },
  }
}
