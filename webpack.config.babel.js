import LoadablePlugin from '@loadable/webpack-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import nodeExternals from 'webpack-node-externals'
import StatsPlugin from 'stats-webpack-plugin'
import TerserPlugin from 'terser-webpack-plugin'
import {CleanWebpackPlugin as CleanPlugin} from 'clean-webpack-plugin'
import {optimize} from 'webpack'
import {resolve} from 'path'

const TARGET_NODE = 'node'
const TARGET_WEB = 'web'

export default (_, {mode = 'production'}) => {
  return [
    createConfig(TARGET_NODE, mode),
    createConfig(TARGET_WEB, mode),
  ]
}

function createConfig (target, mode) {
  const isNode = target === TARGET_NODE
  const isProduction = mode === 'production'

  const rootPath = __dirname
  const srcPath = resolve(rootPath, 'src')
  const buildPath = resolve(rootPath, 'artifacts/build', mode)
  const targetBuildPath = resolve(buildPath, target)

  const jsFilename = isProduction ? '[name].[contenthash].js' : '[name].js'
  const cssFilename = isProduction ? '[name].[contenthash].css' : '[name].css'

  const externals = isNode ? ['@loadable/component', nodeExternals()] : undefined
  const libraryTarget = isNode ? 'commonjs2' : undefined
  const minimizer = isNode ? [] : [new TerserPlugin({sourceMap: true})]
  const extraPlugins = isNode
    ? [new optimize.LimitChunkCountPlugin({maxChunks: 1})]
    : []

  return {
    name: target,
    mode,
    target,
    devtool: 'source-map',
    entry: `./src/client/main-${target}.js`,
    externals,
    output: {
      filename: jsFilename,
      libraryTarget,
      path: targetBuildPath,
      publicPath: '/',
    },
    optimization: {
      minimizer,
    },
    plugins: [
      new CleanPlugin(),
      new LoadablePlugin({filename: '.loadable-stats.json'}),
      new MiniCssExtractPlugin({filename: cssFilename}),
      new StatsPlugin('.stats.json'),

      ...extraPlugins,
    ],
    module: {
      rules: [
        {
          test: /\.js$/,
          include: [srcPath],
          use: {
            loader: 'babel-loader',
            options: {caller: {target}},
          },
        },
        {
          test: /\.css$/,
          include: [srcPath],
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
            },
            {
              loader: 'css-loader',
              options: {
                modules: {
                  localIdentName: '[name]__[local]--[hash:base64:5]',
                },
                sourceMap: true,
              },
            },
          ],
        },
      ],
    },
  }
}
