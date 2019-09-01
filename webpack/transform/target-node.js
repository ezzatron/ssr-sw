/* eslint-disable import/no-commonjs */

const nodeExternals = require('webpack-node-externals')
const {optimize: {LimitChunkCountPlugin}} = require('webpack')

module.exports = function targetNode (options = {}) {
  const {
    externals = {},
  } = options

  return {
    constraints: {
      target: 'node',
    },

    apply (config) {
      config.devtool = 'inline-source-map'
      config.externals.push(nodeExternals(externals))
      config.optimization.minimize = false
      config.output.libraryTarget = 'commonjs2'

      config.plugins.push(
        new LimitChunkCountPlugin({
          maxChunks: 1,
        }),
      )
    },
  }
}
