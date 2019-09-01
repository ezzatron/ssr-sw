/* eslint-disable import/no-commonjs */

module.exports = function reactHotLoader () {
  return {
    constraints: {
      production: false,
      target: 'web',
    },

    apply (config) {
      config.resolve.alias['react-dom'] = '@hot-loader/react-dom'

      for (const name in config.entry) config.entry[name].push('react-hot-loader/patch')
    },
  }
}
