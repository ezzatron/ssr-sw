/* eslint-disable import/no-commonjs */

const {resolve} = require('path')

console.log(resolve(__dirname, '../../webpack.config.js'))

module.exports = {
  settings: {
    'import/resolver': {
      webpack: {
        config: resolve(__dirname, '../../webpack.config.js'),
        'config-index': 0,
      },
    },
  },
}
