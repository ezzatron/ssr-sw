import nodeExternals from 'webpack-node-externals'
import {optimize} from 'webpack'
import {resolve} from 'path'

export default (_, {mode = 'development'} = {}) => {
  const srcPath = resolve(__dirname, 'src')

  return {
    mode,
    target: 'node',
    devtool: 'source-map',
    entry: './src/server/main.js',
    externals: [nodeExternals()],
    output: {
      filename: 'main.js',
      libraryTarget: 'commonjs2',
      path: resolve(__dirname, 'artifacts/build', mode, 'server'),
      publicPath: '/',
    },
    plugins: [
      new optimize.LimitChunkCountPlugin({maxChunks: 1}),
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
