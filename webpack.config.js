/* eslint-disable import/no-commonjs */

const GitVersionPlugin = require('@eloquent/git-version-webpack-plugin')
const {CleanWebpackPlugin: CleanPlugin} = require('clean-webpack-plugin')

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
const targetNode = require('./webpack/transform/target-node.js')
const writeStats = require('./webpack/transform/write-stats.js')
const {processConfig} = require('./webpack/process.js')

module.exports = processConfig(
  [
    hotModuleReplacement(),
    loadableComponents(),
    loadBabel(),
    loadCssModules(),
    loadHtml(),
    loadImages(),
    pathConventions({rootPath: __dirname}),
    preCompression(),
    qualityOfLife(),
    reactHotLoader(),
    saneDefaults(),
    targetNode(),
    writeStats(),
  ],
  (_, {mode = 'development'}) => {
    function createPlugins () {
      return [
        new CleanPlugin(),
        new GitVersionPlugin(),
      ]
    }

    const client = {
      mode,
      name: 'client',
      plugins: createPlugins(),
    }

    const server = {
      mode,
      name: 'server',
      target: 'node',
      plugins: createPlugins(),
    }

    return [client, server]
  },
)
