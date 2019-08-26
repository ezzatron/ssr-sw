/* eslint-disable import/no-commonjs */

const LoadablePlugin = require('@loadable/webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const nodeExternals = require('webpack-node-externals')
const StatsPlugin = require('stats-webpack-plugin')
const {CleanWebpackPlugin: CleanPlugin} = require('clean-webpack-plugin')
const {HotModuleReplacementPlugin, optimize: {LimitChunkCountPlugin}} = require('webpack')
const {resolve} = require('path')

module.exports = (_, {mode = 'development'}) => {
  const isProduction = mode === 'production'

  const rootPath = __dirname
  const srcPath = resolve(rootPath, 'src')
  const buildPath = resolve(rootPath, 'artifacts/build', mode)

  function createPlugins (...extraPlugins) {
    const plugins = [
      new CleanPlugin(),
      new LoadablePlugin({
        filename: '.loadable-stats.json',
      }),
      new StatsPlugin('.stats.json'),

      ...extraPlugins,
    ]

    if (!isProduction) plugins.push(new HotModuleReplacementPlugin())

    return plugins
  }

  function createJsRule (target) {
    return {
      test: /\.js$/,
      include: [srcPath],
      use: {
        loader: 'babel-loader',
        options: {
          caller: {
            target,
          },
        },
      },
    }
  }

  function createCssRule (target) {
    const isClient = target === 'client'
    const use = []

    if (isClient) {
      use.push({
        loader: MiniCssExtractPlugin.loader,
        options: {
          hmr: isClient && !isProduction,
        },
      })
    }

    use.push({
      loader: 'css-loader',
      options: {
        modules: {
          localIdentName: '[name]__[local]--[hash:base64:5]',
        },
        onlyLocals: !isClient,
        sourceMap: true,
      },
    })

    return {
      test: /\.css$/,
      include: [srcPath],
      use,
    }
  }

  const extraClientEntry = isProduction ? [] : [
    'react-hot-loader/patch',
    'webpack-hot-middleware/client',
  ]
  const jsFilename = isProduction ? '[name].[contenthash].js' : '[name].js'
  const cssFilename = isProduction ? '[name].[contenthash].css' : '[name].css'

  const client = {
    name: 'client',
    mode,
    devtool: 'source-map',
    entry: [
      ...extraClientEntry,

      './src/client/main.js',
    ],
    output: {
      filename: jsFilename,
      path: resolve(buildPath, 'client'),
      publicPath: '/',
    },
    plugins: createPlugins(
      new MiniCssExtractPlugin({
        filename: cssFilename,
      }),
    ),
    resolve: {
      alias: {
        'react-dom': '@hot-loader/react-dom',
      },
    },
    module: {
      rules: [
        createJsRule('client'),
        createCssRule('client'),
      ],
    },
  }

  const server = {
    name: 'server',
    mode,
    devtool: 'inline-source-map',
    target: 'node',
    entry: './src/server/main.js',
    externals: [
      nodeExternals(),
    ],
    output: {
      filename: '[name].js',
      libraryTarget: 'commonjs2',
      path: resolve(buildPath, 'server'),
      publicPath: '/',
    },
    optimization: {
      minimize: false,
    },
    plugins: createPlugins(
      new LimitChunkCountPlugin({
        maxChunks: 1,
      }),
    ),
    module: {
      rules: [
        createJsRule('server'),
        createCssRule('server'),

        {
          test: /\.html$/,
          include: [srcPath],
          use: [
            {
              loader: 'html-loader',
            },
          ],
        },
      ],
    },
  }

  return [client, server]
}
