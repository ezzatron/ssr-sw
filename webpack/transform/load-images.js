/* eslint-disable import/no-commonjs */

const {isConfigProduction, isConfigTargeting} = require('../util.js')

module.exports = function loadImages (options = {}) {
  const {
    exclude,
    filename: {
      dev: filenameDev = '[path][name].[ext]',
      prod: filenameProd = '[name].hash~[contenthash:20].[ext]',
    } = {},
    include,
    test = /\.(gif|jpg|png)$/,
  } = options

  return {
    apply (config) {
      const isProduction = isConfigProduction(config)
      const isNode = isConfigTargeting('node', config)

      config.module.rules.push(
        {
          test,
          include,
          exclude,
          use: [
            {
              loader: 'file-loader',
              options: {
                emitFile: !isNode,
                name: isProduction ? filenameProd : filenameDev,
              },
            },
          ],
        },
      )
    },
  }
}
