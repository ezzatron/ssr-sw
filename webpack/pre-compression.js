/* eslint-disable import/no-commonjs */

const CompressionPlugin = require('compression-webpack-plugin')
const {gzip} = require('@gfx/zopfli')

module.exports = function preCompression (options = {}) {
  const {
    brotliLevel = 11,
    gzipIterations = 15,
    minRatio = 0.8,
    test = /^[^.].*(?<!\.map)$/,
    threshold = 1024,
  } = options

  return {
    constraints: {
      production: true,
      target: 'web',
    },

    apply (config) {
      config.plugins.push(
        new CompressionPlugin({
          algorithm: 'brotliCompress',
          compressionOptions: {
            level: brotliLevel,
          },
          filename: '[path].br[query]',
          minRatio,
          test,
          threshold,
        }),
        new CompressionPlugin({
          algorithm (input, compressionOptions, callback) {
            return gzip(input, compressionOptions, callback)
          },
          compressionOptions: {
            numiterations: gzipIterations,
          },
          minRatio,
          test,
          threshold,
        }),
      )
    },
  }
}
