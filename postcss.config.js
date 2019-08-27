/* eslint-disable import/no-commonjs */

module.exports = context => {
  const {webpack: {mode}} = context
  const isProduction = mode === 'production'

  const plugins = {
    'postcss-preset-env': {},
  }

  if (isProduction) plugins.cssnano = {}

  return {
    plugins,
  }
}
