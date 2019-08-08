import {CleanWebpackPlugin as CleanPlugin} from 'clean-webpack-plugin'
import {resolve} from 'path'

export function createConfig () {
  const rootPath = resolve(__dirname, '../..')

  const distPath = resolve(rootPath, 'dist')
  const srcPath = resolve(rootPath, 'src')
  const clientPath = resolve(srcPath, 'client')

  return {
    mode: 'production',
    entry: resolve(clientPath, 'entry.js'),
    output: {
      filename: '[name].[contenthash].js',
      path: distPath
    },
    plugins: [
      new CleanPlugin(),
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
  }
}
