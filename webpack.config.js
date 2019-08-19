/* eslint-disable import/no-commonjs */

const ExtractCssChunksPlugin = require('extract-css-chunks-webpack-plugin')
const nodeExternals = require('webpack-node-externals')
const StatsPlugin = require('stats-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const {CleanWebpackPlugin: CleanPlugin} = require('clean-webpack-plugin')
const {optimize} = require('webpack')
const {resolve} = require('path')

module.exports = (_, {mode = 'production'}) => {
  const rootPath = __dirname

  const buildPath = resolve(rootPath, 'artifacts/build')
  const clientBuildPath = resolve(buildPath, 'client')
  const serverBuildPath = resolve(buildPath, 'server')

  const srcPath = resolve(rootPath, 'src')
  const clientSrcPath = resolve(srcPath, 'client')
  const serverSrcPath = resolve(srcPath, 'server')

  const entryPath = resolve(clientSrcPath, 'entry.js')
  const serverMainPath = resolve(serverSrcPath, 'main.js')

  const module = {
    rules: [
      {
        test: /\.js$/,
        include: [srcPath],
        use: 'babel-loader',
      },
      {
        test: /\.css$/,
        include: [srcPath],
        use: [
          {
            loader: ExtractCssChunksPlugin.loader,
          },
          {
            loader: 'css-loader',
            options: {
              modules: {
                localIdentName: '[name]__[local]--[hash:base64:5]',
              },
            },
          },
        ],
      },
      {
        test: /\.html$/,
        include: [srcPath],
        use: 'html-loader',
      },
    ],
  }

  function createPlugins () {
    return [
      new CleanPlugin(),
      new ExtractCssChunksPlugin({
        filename: '[name].[contenthash].css',
      }),
      new StatsPlugin('.stats.json'),
    ]
  }

  const clientConfig = {
    name: 'client',
    mode,
    entry: entryPath,
    output: {
      filename: '[name].[contenthash].js',
      path: clientBuildPath,
      publicPath: '/',
    },
    optimization: {
      minimizer: [new TerserPlugin()],
    },
    plugins: createPlugins(),
    module,
  }

  const serverConfig = {
    name: 'server',
    mode,
    target: 'node',
    entry: serverMainPath,
    externals: [
      nodeExternals({
        whitelist: [
          'react-universal-component',
          'webpack-flush-chunks',
        ],
      }),
      /webpack\.config/,
    ],
    output: {
      filename: 'main.js',
      libraryTarget: 'commonjs2',
      path: serverBuildPath,
    },
    optimization: {
      minimizer: [],
    },
    plugins: [
      ...createPlugins(),

      new optimize.LimitChunkCountPlugin({
        maxChunks: 1,
      }),
    ],
    module,
  }

  return [clientConfig, serverConfig]
}
