/* eslint-disable import/no-commonjs */

const GitVersionPlugin = require('@eloquent/git-version-webpack-plugin')
const {CleanWebpackPlugin: CleanPlugin} = require('clean-webpack-plugin')

const FileResourceHintsPlugin = require('./webpack/file-resource-hints-plugin.js')

const hotModuleReplacement = require('./webpack/transform/hot-module-replacement.js')
const loadableComponents = require('./webpack/transform/loadable-components.js')
const loadBabel = require('./webpack/transform/load-babel.js')
const loadCssModules = require('./webpack/transform/load-css-modules.js')
const loadHtml = require('./webpack/transform/load-html.js')
const loadImages = require('./webpack/transform/load-images.js')
const pathConventions = require('./webpack/transform/path-conventions.js')
const preCompression = require('./webpack/transform/pre-compression.js')
const qualityOfLife = require('./webpack/transform/quality-of-life.js')
const reactHotLoader = require('./webpack/transform/react-hot-loader.js')
const saneDefaults = require('./webpack/transform/sane-defaults.js')
const sharedPlugins = require('./webpack/transform/shared-plugins.js')
const targetNode = require('./webpack/transform/target-node.js')
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
          new FileResourceHintsPlugin(),
        ]
      },
    }),

    hotModuleReplacement(),
    loadableComponents(),
    preCompression(),
    qualityOfLife(),
    reactHotLoader(),
    saneDefaults(),
    targetNode(),
    writeStats(),

    loadBabel(),
    loadCssModules(),
    loadHtml(),
    loadImages(),
  ],
  (_, {mode = 'development'}) => [
    {
      mode,
      name: 'client',
    },
    {
      mode,
      name: 'server',
      target: 'node',
    },
  ],
)
