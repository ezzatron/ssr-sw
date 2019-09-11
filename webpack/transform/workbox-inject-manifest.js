/* eslint-disable import/no-commonjs */

const {InjectManifest: InjectManifestPlugin} = require('workbox-webpack-plugin')

module.exports = function workboxInjectManifest (options = {}) {
  const {
    createPlugins,
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

          swDest,
          swSrc,
          webpackCompilationPlugins: serviceWorkerPlugins,
        }),
      )
    },
  }
}
