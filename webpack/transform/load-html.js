/* eslint-disable import/no-commonjs */

module.exports = function loadHtml (options = {}) {
  const {
    exclude,
    include,
    test = /\.html$/,
  } = options

  return {
    apply (config) {
      config.module.rules.push(
        {
          test,
          include,
          exclude,
          use: [
            {
              loader: 'html-loader',
            },
          ],
        },
      )
    },
  }
}
