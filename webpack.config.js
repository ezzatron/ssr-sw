/* eslint-disable import/no-commonjs */

const GitVersionPlugin = require('@eloquent/git-version-webpack-plugin')
const LoadablePlugin = require('@loadable/webpack-plugin')
const StatsPlugin = require('stats-webpack-plugin')
const {CleanWebpackPlugin: CleanPlugin} = require('clean-webpack-plugin')

const hotModuleReplacement = require('./webpack/transform/hot-module-replacement.js')
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
const {processConfig} = require('./webpack/process.js')

module.exports = processConfig(
  [
    hotModuleReplacement(),
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
  ],
  (_, {mode = 'development'}) => {
    function createPlugins () {
      return [
        new CleanPlugin(),
        new GitVersionPlugin(),
        new LoadablePlugin({
          filename: '.loadable-stats.json',
        }),
        new StatsPlugin('.stats.json'),
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
