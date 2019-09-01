/* eslint-disable import/no-commonjs */

module.exports = function sharedPlugins (options = {}) {
  const {
    createPlugins,
  } = options

  return {
    apply (config) {
      config.plugins.push(...createPlugins(config))
    },
  }
}
