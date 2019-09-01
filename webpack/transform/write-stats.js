/* eslint-disable import/no-commonjs */

const StatsPlugin = require('stats-webpack-plugin')

module.exports = function writeStats (options = {}) {
  const {
    filename = '.stats.json',
  } = options

  return {
    apply (config) {
      config.plugins.push(
        new StatsPlugin(filename),
      )
    },
  }
}
