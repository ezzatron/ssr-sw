/* eslint-disable import/no-commonjs */

const GitVersionPlugin = require('@eloquent/git-version-webpack-plugin')
const LoadablePlugin = require('@loadable/webpack-plugin')
const StatsPlugin = require('stats-webpack-plugin')
const WebpackbarPlugin = require('webpackbar')
const {CleanWebpackPlugin: CleanPlugin} = require('clean-webpack-plugin')
const {resolve} = require('path')

const hotModuleReplacement = require('./webpack/transform/hot-module-replacement.js')
const loadBabel = require('./webpack/transform/load-babel.js')
const loadCssModules = require('./webpack/transform/load-css-modules.js')
const preCompression = require('./webpack/transform/pre-compression.js')
const reactHotLoader = require('./webpack/transform/react-hot-loader.js')
const saneDefaults = require('./webpack/transform/sane-defaults.js')
const targetNode = require('./webpack/transform/target-node.js')
const {processConfig} = require('./webpack/process.js')

module.exports = processConfig(
  [
    hotModuleReplacement(),
    loadBabel(),
    loadCssModules(),
    preCompression(),
    reactHotLoader(),
    saneDefaults(),
    targetNode(),
  ],
  (_, {mode = 'development'}) => {
    const isProduction = mode === 'production'

    const rootPath = __dirname
    const srcPath = resolve(rootPath, 'src')
    const buildPath = resolve(rootPath, 'artifacts/build', mode)

    const fileFilename = isProduction ? '[name].hash~[contenthash:20].[ext]' : '[path][name].[ext]'

    function createPlugins (target) {
      return [
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
        path: resolve(buildPath, 'client'),
      },
      plugins: createPlugins('client'),
      module: {
        rules: [
          createImageRule('client'),
        ],
      },
    }

    const server = {
      name: 'server',
      mode,
      target: 'node',
      context: srcPath,
      entry: './server/main.js',
      output: {
        path: resolve(buildPath, 'server'),
      },
      plugins: createPlugins('server'),
      module: {
        rules: [
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
