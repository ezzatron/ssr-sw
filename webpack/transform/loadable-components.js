/* eslint-disable import/no-commonjs */

const LoadablePlugin = require('@loadable/webpack-plugin')

module.exports = function loadableComponents (options = {}) {
  const {
    filename = '.loadable-stats.json',
  } = options

  return {
    apply (config) {
      config.plugins.push(
        new LoadablePlugin({
          filename,
        }),
      )
    },
  }
}
