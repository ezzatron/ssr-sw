import nodeExternals from 'webpack-node-externals'
import StartServerPlugin from 'start-server-webpack-plugin'
import {DefinePlugin, HotModuleReplacementPlugin, optimize} from 'webpack'
import {relative, resolve} from 'path'

const rootPath = resolve(__dirname, '..')
const srcPath = resolve(rootPath, 'src')
const outputPath = resolve(rootPath, 'artifacts/build/dev-server')

const renderConfigModule = relative(outputPath, resolve(__dirname, 'render.webpack.config.babel.js'))

export default {
  name: 'dev-server',
  mode: 'development',
  watch: true,
  target: 'node',
  devtool: 'source-map',
  entry: [
    'webpack/hot/signal',
    './src/dev-server/main.js',
  ],
  externals: [
    /webpack\.config/,
    nodeExternals({
      whitelist: ['webpack/hot/signal'],
    }),
  ],
  output: {
    filename: 'main.js',
    libraryTarget: 'commonjs2',
    path: outputPath,
    publicPath: '/',
  },
  plugins: [
    new HotModuleReplacementPlugin(),
    new optimize.LimitChunkCountPlugin({maxChunks: 1}),
    new DefinePlugin({
      'process.env.RENDER_WEBPACK_CONFIG_MODULE': JSON.stringify(renderConfigModule),
    }),
    new StartServerPlugin({
      keyboard: true,
      name: 'main.js',
      nodeArgs: [
        '--inspect',
      ],
      signal: true,
    }),
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        include: [srcPath],
        use: 'babel-loader',
      },
    ],
  },
  resolve: {
    alias: {
      '_render_config': resolve(__dirname, 'render.webpack.config.babel.js'),
    },
  },
}
