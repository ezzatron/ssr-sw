/* eslint-disable import/no-commonjs */

const {normalizeConfig} = require('./normalize.js')
const {isConfigMatch, trueTypeOf} = require('./util.js')

module.exports = {
  processConfig,
}

function processConfig (transforms, configSource) {
  if (typeof configSource === 'function') return (...args) => processStaticConfig(transforms, configSource(...args))

  return processStaticConfig(transforms, configSource)
}

function processStaticConfig (transforms, config) {
  const configType = trueTypeOf(config)

  if (configType === 'object') return applyTransforms(transforms, config)
  if (configType === 'array') return config.map(childConfig => applyTransforms(transforms, childConfig))

  throw new Error(`Unsupported config type "${configType}"`)
}

function applyTransforms (transforms, config) {
  return transforms.reduce(
    (config, {apply, constraints}) => {
      if (constraints && !isConfigMatch(constraints, config)) return config

      return apply(config) || config
    },
    normalizeConfig(config),
  )
}
