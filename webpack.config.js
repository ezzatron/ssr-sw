/* eslint-disable import/no-commonjs */

const GitVersionPlugin = require('@eloquent/git-version-webpack-plugin')
const LoadablePlugin = require('@loadable/webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const nodeExternals = require('webpack-node-externals')
const StatsPlugin = require('stats-webpack-plugin')
const WebpackbarPlugin = require('webpackbar')
const {CleanWebpackPlugin: CleanPlugin} = require('clean-webpack-plugin')
const {optimize: {LimitChunkCountPlugin}} = require('webpack')
const {resolve} = require('path')

const hotModuleReplacement = require('./webpack/transform/hot-module-replacement.js')
const preCompression = require('./webpack/transform/pre-compression.js')
const reactHotLoader = require('./webpack/transform/react-hot-loader.js')
const {processConfig} = require('./webpack/util.js')

module.exports = processConfig(
  [
    hotModuleReplacement(),
    preCompression(),
    reactHotLoader(),
  ],
  (_, {mode = 'development'}) => {
    const isProduction = mode === 'production'

    const rootPath = __dirname
    const srcPath = resolve(rootPath, 'src')
    const buildPath = resolve(rootPath, 'artifacts/build', mode)

    const jsFilename = isProduction ? '[name].hash~[contenthash].js' : '[name].js'
    const cssFilename = isProduction ? '[name].hash~[contenthash].css' : '[name].css'
    const fileFilename = isProduction ? '[name].hash~[contenthash:20].[ext]' : '[path][name].[ext]'

    function createPlugins (target) {
      const isClient = target === 'client'

      const plugins = [
        new CleanPlugin(),
        new GitVersionPlugin(),
        new LoadablePlugin({
          filename: '.loadable-stats.json',
        }),
        new StatsPlugin('.stats.json'),
        new WebpackbarPlugin({
          name: target,
        }),
      ]

      if (isClient) {
        plugins.push(
          new MiniCssExtractPlugin({
            filename: cssFilename,
          }),
        )
      } else {
        plugins.push(
          new LimitChunkCountPlugin({
            maxChunks: 1,
          }),
        )
      }

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

      use.push(
        {
          loader: 'css-loader',
          options: {
            importLoaders: 1,
            modules: {
              localIdentName: '[name]__[local]--[hash:base64:5]',
            },
            onlyLocals: !isClient,
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

      return {
        test: /\.css$/,
        include: [srcPath],
        use,
      }
    }

    function createImageRule (target) {
      const isClient = target === 'client'

      return {
        test: /\.(gif|jpg|png)$/,
        include: [srcPath],
        use: [
          {
            loader: 'file-loader',
            options: {
              emitFile: isClient,
              name: fileFilename,
            },
          },
        ],
      }
    }

    const client = {
      name: 'client',
      mode,
      devtool: 'source-map',
      context: srcPath,
      entry: './client/main.js',
      output: {
        filename: jsFilename,
        path: resolve(buildPath, 'client'),
        publicPath: '/',
      },
      plugins: createPlugins('client'),
      module: {
        rules: [
          createJsRule('client'),
          createCssRule('client'),
          createImageRule('client'),
        ],
      },
    }

    const server = {
      name: 'server',
      mode,
      devtool: 'inline-source-map',
      target: 'node',
      context: srcPath,
      entry: './server/main.js',
      externals: [
        nodeExternals(),
      ],
      output: {
        filename: 'main.js',
        libraryTarget: 'commonjs2',
        path: resolve(buildPath, 'server'),
        publicPath: '/',
      },
      optimization: {
        minimize: false,
      },
      plugins: createPlugins('server'),
      module: {
        rules: [
          createJsRule('server'),
          createCssRule('server'),
          createImageRule('server'),

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
  },
)
