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
    return {
      test: /\.css$/,
      include: [srcPath],
      use: [
        {
          loader: MiniCssExtractPlugin.loader,
          options: {
            hmr: !isProduction && target === 'client',
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
    devtool: 'source-map',
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
      new MiniCssExtractPlugin({
        filename: '[name].css',
      }),
      new LimitChunkCountPlugin({
        maxChunks: 1,
      }),
    ),
    module: {
      rules: [
        createJsRule('server'),
        createCssRule('server'),

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
