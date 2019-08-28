/* eslint-disable import/no-commonjs */

const {resolve} = require('path')

module.exports = {
  settings: {
    'import/resolver': {
      webpack: {
        config: resolve(__dirname, '../../webpack.config.js'),
        'config-index': 1,
      },
    },
  },
}
