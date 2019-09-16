/* eslint-disable import/no-commonjs */

const GitVersionPlugin = require('@eloquent/git-version-webpack-plugin')
const HtmlPlugin = require('html-webpack-plugin')
const {CleanWebpackPlugin: CleanPlugin} = require('clean-webpack-plugin')

const hotModuleReplacement = require('./webpack/transform/hot-module-replacement.js')
const loadableComponents = require('./webpack/transform/loadable-components.js')
const loadBabel = require('./webpack/transform/load-babel.js')
const loadCss = require('./webpack/transform/load-css.js')
const loadHtml = require('./webpack/transform/load-html.js')
const loadImages = require('./webpack/transform/load-images.js')
const pathConventions = require('./webpack/transform/path-conventions.js')
const preCompression = require('./webpack/transform/pre-compression.js')
const qualityOfLife = require('./webpack/transform/quality-of-life.js')
const reactHotLoader = require('./webpack/transform/react-hot-loader.js')
const saneDefaults = require('./webpack/transform/sane-defaults.js')
const sharedPlugins = require('./webpack/transform/shared-plugins.js')
const targetNode = require('./webpack/transform/target-node.js')
// const workboxGenerateSw = require('./webpack/transform/workbox-generate-sw.js')
const workboxInjectManifest = require('./webpack/transform/workbox-inject-manifest.js')
const writeStats = require('./webpack/transform/write-stats.js')
const {processConfig} = require('./webpack/process.js')

module.exports = processConfig(
  [
    pathConventions({
      rootPath: __dirname,
    }),
    sharedPlugins({
      createPlugins () {
        return [
          new CleanPlugin(),
          new GitVersionPlugin(),
        ]
      },
    }),

    hotModuleReplacement(),
    loadableComponents(),
    qualityOfLife(),
    reactHotLoader(),
    saneDefaults(),
    targetNode(),
    // workboxGenerateSw(),
    workboxInjectManifest(),
    writeStats(),

    preCompression(),

    loadBabel(),
    loadCss(),
    loadHtml(),
    loadImages(),
  ],
  (_, {mode = 'development'}) => [
    {
      mode,
      name: 'client',
      plugins: [
        new HtmlPlugin({
          filename: mode === 'production' ? 'app-shell.hash~[contenthash:20].html' : 'app-shell.html',
          template: './app.html',
        }),
      ],
    },
    {
      mode,
      name: 'server',
      target: 'node',
    },
  ],
)
