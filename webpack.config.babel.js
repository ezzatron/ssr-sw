import nodeExternals from 'webpack-node-externals'
import StartServerPlugin from 'start-server-webpack-plugin'
import {HotModuleReplacementPlugin, optimize} from 'webpack'
import {resolve} from 'path'

export default (_, {mode = 'development'} = {}) => {
  const srcPath = resolve(__dirname, 'src')

  return {
    mode,
    watch: true,
    target: 'node',
    devtool: 'source-map',
    entry: [
      'webpack/hot/signal',
      './src/server/main.js',
    ],
    externals: [
      nodeExternals({
        whitelist: ['webpack/hot/signal']
      }),
    ],
    output: {
      filename: 'main.js',
      libraryTarget: 'commonjs2',
      path: resolve(__dirname, 'artifacts/build', mode, 'server'),
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
}
