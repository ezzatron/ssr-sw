/* eslint-disable import/no-commonjs */

module.exports = context => {
  const {webpack: {mode}} = context
  const isProduction = mode === 'production'

  const plugins = {
    'postcss-preset-env': {
      autoprefixer: {
        grid: true,
      },
    },
  }

  if (isProduction) plugins.cssnano = {}

  return {
    plugins,
  }
}
