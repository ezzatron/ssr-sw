/* eslint-disable import/no-commonjs */

module.exports = function babelLoader (options = {}) {
  const {
    include,
    exclude = /\/node_modules\//,
    test = /\.js$/,
  } = options

  return {
    apply (config) {
      config.module.rules.push(
        {
          test,
          include,
          exclude,
          use: {
            loader: 'babel-loader',
            options: {
              caller: {
                target: config.name || config.target,
              },
            },
          },
        },
      )
    },
  }
}
