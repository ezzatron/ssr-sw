/* eslint-disable import/no-commonjs */

const {isConfigProduction, isConfigTargeting} = require('../util.js')

module.exports = function saneDefaults (options = {}) {
  const {
    filename: {
      dev: filenameDev = '[name].js',
      prod: filenameProd = '[name].hash~[contenthash].js',
    } = {},
  } = options

  return {
    apply (config) {
      const isProduction = isConfigProduction(config)
      const isNode = isConfigTargeting('node', config)

      const defaultFilename = isNode || !isProduction ? filenameDev : filenameProd

      const {
        devtool = 'source-map',
        output: {
          filename = defaultFilename,
          publicPath = '/',
        },
      } = config

      config.devtool = devtool
      config.output.filename = filename
      config.output.publicPath = publicPath
    },
  }
}
