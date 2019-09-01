/* eslint-disable import/no-commonjs */

module.exports = function saneDefaults () {
  return {
    apply (config) {
      const {
        output: {
          publicPath = '/',
        },
      } = config

      config.output.publicPath = publicPath
    },
  }
}
