import StatsPlugin from 'stats-webpack-plugin'
import {resolve} from 'path'

import {readFile} from './fs.js'

export function readOutputPath (config) {
  const {output: {path: outputPath} = {}} = config

  if (!outputPath) throw new Error('Unable to determine Webpack output path')

  return outputPath
}

export async function readStats (config) {
  const outputPath = readOutputPath(config)
  const {plugins = []} = config

  const statsPlugin = plugins.find(plugin => plugin instanceof StatsPlugin)
  if (!statsPlugin) throw new Error('Unable to determine Webpack stats path')

  const statsPath = resolve(outputPath, statsPlugin.output)

  return JSON.parse(await readFile(statsPath))
}
