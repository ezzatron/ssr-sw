/* eslint-disable import/no-commonjs */

const {InjectManifest: InjectManifestPlugin} = require('workbox-webpack-plugin')

const {standardManifestTransforms} = require('../util/workbox.js')

module.exports = function workboxInjectManifest (options = {}) {
  const {
    createPlugins,
    manifestTransforms = [],
    swDest = 'sw.js',
    swSrc = './service-worker.js',
    webpackCompilationPlugins = [],
  } = options

  return {
    constraints: {
      target: 'web',
    },

    apply (config) {
      const serviceWorkerPlugins = webpackCompilationPlugins
      if (createPlugins) serviceWorkerPlugins.push(...createPlugins(config))

      serviceWorkerPlugins.push(
        {
          apply (compiler) {
            compiler.hooks.thisCompilation.tap('InjectManifest', compilation => {
              compilation.hotUpdateChunkTemplate = false
            })
          },
        },
      )

      config.plugins.push(
        new InjectManifestPlugin({
          ...options,

          manifestTransforms: [...manifestTransforms, ...standardManifestTransforms],
          swDest,
          swSrc,
          webpackCompilationPlugins: serviceWorkerPlugins,
        }),
      )
    },
  }
}
