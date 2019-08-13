/* eslint-disable import/no-commonjs */

const ExtractCssChunksPlugin = require('extract-css-chunks-webpack-plugin')
const nodeExternals = require('webpack-node-externals')
const StatsPlugin = require('stats-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const {CleanWebpackPlugin: CleanPlugin} = require('clean-webpack-plugin')
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
  const runPath = resolve(serverSrcPath, 'run.js')

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
              modules: true,
            },
          },
        ],
      },
    ],
  }

  function createPlugins () {
    return [
      new CleanPlugin(),
      new ExtractCssChunksPlugin({
        filename: '[name].[contenthash].css',
      }),
      new StatsPlugin('../stats.json'),
    ]
  }

  const clientConfig = {
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
    mode,
    target: 'node',
    entry: runPath,
    externals: [
      nodeExternals(),
      /webpack\.config/,
    ],
    output: {
      filename: 'run.js',
      libraryTarget: 'commonjs2',
      path: serverBuildPath,
    },
    plugins: createPlugins(),
    module,
  }

  return [clientConfig, serverConfig]
}
