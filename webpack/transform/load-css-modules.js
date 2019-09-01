/* eslint-disable import/no-commonjs */

const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const {isConfigProduction, isConfigTargeting} = require('../util.js')

module.exports = function loadCssModules (options = {}) {
  const {
    include,
    exclude = /\/node_modules\//,
    filename: {
      dev: filenameDev = '[name].css',
      prod: filenameProd = '[name].hash~[contenthash].css',
    } = {},
    localIdentName: {
      dev: localIdentNameDev = '[path][name]__[local]',
      prod: localIdentNameProd = '[name]__[local]--[hash:base64:5]',
    } = {},
    test = /\.css$/,
  } = options

  return {
    apply (config) {
      const isProduction = isConfigProduction(config)
      const isNode = isConfigTargeting('node', config)

      const use = []

      if (!isNode) {
        config.plugins.push(
          new MiniCssExtractPlugin({
            filename: isProduction ? filenameProd : filenameDev,
          }),
        )

        use.push({
          loader: MiniCssExtractPlugin.loader,
          options: {},
        })
      }

      use.push(
        {
          loader: 'css-loader',
          options: {
            importLoaders: 1,
            modules: {
              localIdentName: isProduction ? localIdentNameProd : localIdentNameDev,
            },
            onlyLocals: isNode,
            sourceMap: true,
          },
        },
        {
          loader: 'postcss-loader',
          options: {
            sourceMap: true,
          },
        },
      )

      config.module.rules.push({test, include, exclude, use})
    },
  }
}
