const StatsPlugin = require('stats-webpack-plugin')
const {CleanWebpackPlugin: CleanPlugin} = require('clean-webpack-plugin')
const {resolve} = require('path')

module.exports = (_, {mode = 'production'}) => {
  const rootPath = __dirname

  const buildPath = resolve(rootPath, 'artifacts/build')
  const clientBuildPath = resolve(buildPath, 'client')

  const srcPath = resolve(rootPath, 'src')
  const clientSrcPath = resolve(srcPath, 'client')

  const entryPath = resolve(clientSrcPath, 'entry.js')

  return {
    mode,
    entry: entryPath,
    output: {
      filename: '[name].[contenthash].js',
      path: clientBuildPath,
    },
    plugins: [
      new CleanPlugin(),
      new StatsPlugin('../stats.json'),
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
