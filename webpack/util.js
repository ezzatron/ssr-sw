/* eslint-disable import/no-commonjs */

module.exports = {
  isConfigProduction,
  isConfigTargeting,
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

function normalizeConfig (config) {
  const {
    entry,
    module: moduleConfig = {},
    plugins = [],
    resolve = {},
  } = config || {}

  const {
    rules = [],
  } = moduleConfig

  const {
    alias = {},
  } = resolve

  return {
    ...config,

    entry: normalizeEntry(entry),
    plugins,

    module: {
      ...moduleConfig,

      rules,
    },

    resolve: {
      ...resolve,

      alias,
    },
  }
}

function normalizeEntry (entryConfig) {
  if (!entryConfig) return {main: ['./src']}

  const entryConfigType = trueTypeOf(entryConfig)

  if (entryConfigType === 'string') return {main: [entryConfig]}
  if (entryConfigType === 'array') return {main: entryConfig}

  if (entryConfigType === 'object') {
    for (const name in entryConfig) {
      const entrypoint = entryConfig[name]
      const entrypointType = trueTypeOf(entrypoint)

      if (entryConfigType === 'array') continue
      if (entryConfigType === 'string') entryConfig[name] = [entrypoint]

      throw new Error(`Unsupported entrypoint type "${entrypointType}"`)
    }
  }

  throw new Error(`Unsupported entry config type "${entryConfigType}"`)
}

function isConfigMatch (constraints, config) {
  const {production, target} = constraints

  if (typeof production !== 'undefined' && isConfigProduction(config) !== !!production) return false
  if (typeof target !== 'undefined' && !isConfigTargeting(target, config)) return false

  return true
}

function isConfigProduction (config) {
  return config.mode === 'production'
}

function isConfigTargeting (target, config) {
  const targetType = trueTypeOf(target)
  const {target: actualTarget = 'web'} = config

  if (targetType === 'string') return actualTarget === target
  if (targetType === 'function') return target(actualTarget)
  if (targetType === 'array') return target.includes(actualTarget)

  throw new Error(`Unsupported target filter type "${targetType}"`)
}

function trueTypeOf (value) {
  if (value === null) return 'null'

  const valueType = typeof value

  if (valueType !== 'object') return valueType
  if (Array.isArray(value)) return 'array'

  return 'object'
}
