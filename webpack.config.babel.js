import LoadablePlugin from '@loadable/webpack-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import nodeExternals from 'webpack-node-externals'
import StatsPlugin from 'stats-webpack-plugin'
import {CleanWebpackPlugin as CleanPlugin} from 'clean-webpack-plugin'
import {HotModuleReplacementPlugin, optimize} from 'webpack'
import {resolve} from 'path'

const {LimitChunkCountPlugin} = optimize

export default (_, {mode = 'development'}) => {
  const isProduction = mode === 'production'

  const rootPath = __dirname
  const srcPath = resolve(rootPath, 'src')
  const buildPath = resolve(rootPath, 'artifacts/build', mode)

  const jsFilename = isProduction ? '[name].[contenthash].js' : '[name].js'
  const cssFilename = isProduction ? '[name].[contenthash].css' : '[name].css'

  function createPlugins (...extraPlugins) {
    const plugins = [
      new CleanPlugin(),
      new LoadablePlugin({
        filename: '.loadable-stats.json',
      }),
      new MiniCssExtractPlugin({
        filename: cssFilename,
      }),
      new StatsPlugin('.stats.json'),

      ...extraPlugins,
    ]

    if (!isProduction) plugins.push(new HotModuleReplacementPlugin())

    return plugins
  }

  const common = {
    mode,
    devtool: 'source-map',
    output: {
      filename: jsFilename,
      publicPath: '/',
    },
    module: {
      rules: [
        {
          test: /\.css$/,
          include: [srcPath],
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
              options: {
                hmr: !isProduction,
              },
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

  const extraClientEntry = isProduction ? [] : [
    'react-hot-loader/patch',
    'webpack-hot-middleware/client',
  ]

  const client = {
    ...common,

    name: 'client',
    entry: [
      ...extraClientEntry,

      './src/client/main.js',
    ],
    output: {
      ...common.output,

      path: resolve(buildPath, 'client'),
    },
    plugins: createPlugins(),
    module: {
      ...common.module,

      rules: [
        ...common.module.rules,

        createJsRule('client'),
      ],
    },
  }

  const server = {
    ...common,

    name: 'server',
    target: 'node',
    entry: './src/server/main.js',
    externals: [
      nodeExternals(),
    ],
    output: {
      ...common.output,

      libraryTarget: 'commonjs2',
      path: resolve(buildPath, 'server'),
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
      ...common.module,

      rules: [
        ...common.module.rules,

        createJsRule('server'),

        {
          test: /\.ejs\.html$/,
          include: [srcPath],
          use: [
            {
              loader: 'ejs-compiled-loader',
            },
          ],
        },
      ],
    },
  }

  return [client, server]
}
