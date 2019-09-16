/* eslint-disable import/no-commonjs */

const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const {isConfigHot, isConfigProduction, isConfigTargeting} = require('../util.js')

module.exports = function loadCss (options = {}) {
  const {
    include,
    filename: {
      dev: filenameDev = '[name].css',
      prod: filenameProd = '[name].hash~[contenthash].css',
    } = {},
    localIdentName: {
      dev: localIdentNameDev = '[path][name]__[local]',
      prod: localIdentNameProd = '[name]__[local]--[hash:base64:5]',
    } = {},
    moduleTest = /\.module\.css$/,
    test = /\.css$/,
  } = options

  return {
    apply (config) {
      const isHot = isConfigHot(config)
      const isNode = isConfigTargeting('node', config)
      const isProduction = isConfigProduction(config)

      if (!isNode) {
        config.plugins.push(
          new MiniCssExtractPlugin({
            filename: isProduction ? filenameProd : filenameDev,
          }),
        )
      }

      config.module.rules.push({
        test,
        exclude: moduleTest,
        include,
        use: buildUse(isNode, isHot),
      })

      config.module.rules.push({
        test: moduleTest,
        include,
        use: buildUse(isNode, isHot, {
          modules: {
            localIdentName: isProduction ? localIdentNameProd : localIdentNameDev,
          },
          onlyLocals: isNode,
        }),
      })
    },
  }
}

function buildUse (isNode, isHot, options = {}) {
  const use = []

  if (!isNode) {
    use.push({
      loader: MiniCssExtractPlugin.loader,
      options: {
        hmr: isHot,
      },
    })
  }

  use.push(
    {
      loader: 'css-loader',
      options: {
        ...options,

        importLoaders: 1,
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

  return use
}
