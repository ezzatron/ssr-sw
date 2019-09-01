/* eslint-disable import/no-commonjs */

const WebpackbarPlugin = require('webpackbar')

module.exports = function qualityOfLife () {
  return {
    apply (config) {
      config.plugins.push(
        new WebpackbarPlugin({
          name: config.name || config.target,
        }),
      )
    },
  }
}
