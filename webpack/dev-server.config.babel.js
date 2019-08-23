import nodeExternals from 'webpack-node-externals'
import StartServerPlugin from 'start-server-webpack-plugin'
import {HotModuleReplacementPlugin, optimize} from 'webpack'
import {resolve} from 'path'

const rootPath = resolve(__dirname, '..')
const srcPath = resolve(rootPath, 'src')

export default {
  mode: 'development',
  watch: true,
  target: 'node',
  devtool: 'source-map',
  entry: [
    'webpack/hot/signal',
    './src/dev-server/main.js',
  ],
  externals: [
    nodeExternals({
      whitelist: ['webpack/hot/signal']
    }),
  ],
  output: {
    filename: 'main.js',
    libraryTarget: 'commonjs2',
    path: resolve(rootPath, 'artifacts/build/dev-server'),
    publicPath: '/',
  },
  plugins: [
    new HotModuleReplacementPlugin(),
    new optimize.LimitChunkCountPlugin({maxChunks: 1}),
    new StartServerPlugin({
      keyboard: true,
      name: 'main.js',
      nodeArgs: ['--inspect'],
      signal: true,
    }),
  ],
  optimization: {
    minimizer: [],
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: [srcPath],
        use: 'babel-loader',
      }
    ],
  },
}
