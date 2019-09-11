/* eslint-disable import/no-commonjs */

const {InjectManifest: InjectManifestPlugin} = require('workbox-webpack-plugin')

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

          swDest,
          swSrc,
          webpackCompilationPlugins: serviceWorkerPlugins,

          manifestTransforms: [
            ...manifestTransforms,

            filterManifest,
          ],
        }),
      )
    },
  }
}

const DOTFILE = /^\/?\./
const HOT_MODULE_UPDATE = /\.hot-update\./
const VERSION = /\bVERSION$/

function filterManifest (originalManifest) {
  const manifest = originalManifest.filter(({url}) => {
    if (DOTFILE.test(url)) return false
    if (HOT_MODULE_UPDATE.test(url)) return false
    if (VERSION.test(url)) return false

    return true
  })

  return {manifest, warnings: []}
}
