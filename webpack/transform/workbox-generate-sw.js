/* eslint-disable import/no-commonjs */

const {GenerateSW: GenerateSWPlugin} = require('workbox-webpack-plugin')

const {standardManifestTransforms} = require('../util/workbox.js')

module.exports = function workboxInjectManifest (options = {}) {
  const {
    manifestTransforms = [],
    swDest = 'sw.js',
  } = options

  return {
    constraints: {
      target: 'web',
    },

    apply (config) {
      config.plugins.push(
        new GenerateSWPlugin({
          ...options,

          manifestTransforms: [...manifestTransforms, ...standardManifestTransforms],
          swDest,
        }),
      )
    },
  }
}
