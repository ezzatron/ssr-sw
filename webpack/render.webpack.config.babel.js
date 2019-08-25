const LoadablePlugin = require('@loadable/webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const nodeExternals = require('webpack-node-externals')
const StatsPlugin = require('stats-webpack-plugin')
const {optimize} = require('webpack')
const {resolve} = require('path')

const {createConfig: createBabelConfig} = require('../babel.config.js')

const rootPath = resolve(__dirname, '..')
const srcPath = resolve(rootPath, 'src')

const common = {
  mode: 'development',
  devtool: 'source-map',
  output: {
    filename: '[name].js',
    publicPath: '/',
  },
  plugins: [
    new LoadablePlugin({
      filename: '.loadable-stats.json',
    }),
    new MiniCssExtractPlugin({
      filename: '[name].css',
    }),
    new StatsPlugin('.stats.json'),
  ],
  module: {
    rules: [
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

function createJsRule (isWeb) {
  return {
    test: /\.js$/,
    include: [srcPath],
    use: {
      loader: 'babel-loader',
      options: createBabelConfig(isWeb, true),
    },
  }
}

module.exports = [
  {
    ...common,

    name: 'server-render',
    target: 'node',
    entry: './src/client/server-render.js',
    externals: [
      /webpack\.config/,
      nodeExternals(),
    ],
    output: {
      ...common.output,

      libraryTarget: 'commonjs2',
      path: resolve(rootPath, 'artifacts/build/server-render/development'),
    },
    plugins: [
      ...common.plugins,

      new optimize.LimitChunkCountPlugin({
        maxChunks: 1,
      }),
    ],
    module: {
      ...common.module,

      rules: [
        ...common.module.rules,

        createJsRule(false),
      ],
    },
  },
  {
    ...common,

    name: 'client-render',
    target: 'web',
    entry: './src/client/client-render.js',
    output: {
      ...common.output,

      path: resolve(rootPath, 'artifacts/build/client-render/development'),
    },
    module: {
      ...common.module,

      rules: [
        ...common.module.rules,

        createJsRule(true),
      ],
    },
  },
]
