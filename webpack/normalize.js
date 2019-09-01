/* eslint-disable import/no-commonjs */

const {trueTypeOf} = require('./util.js')

module.exports = {
  normalizeConfig,
}

function normalizeConfig (config) {
  const {
    entry,
    externals = [],
    module: moduleConfig = {},
    optimization = {},
    output = {},
    plugins = [],
    resolve = {},
    target = 'web',
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
    externals,
    optimization,
    output,
    plugins,
    target,

    module: {
      ...moduleConfig,

      rules: rules.map(normalizeRule),
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

function normalizeRule (rule) {
  const {
    loader,

    ...rest
  } = rule

  const use = normalizeUse(rule.use || loader || [])

  return {
    ...rest,

    use,
  }
}

function normalizeUse (use) {
  const useType = trueTypeOf(use)

  if (useType === 'string' || useType === 'object') return [normalizeUseEntry(use)]
  if (useType === 'array') return use.map(normalizeUseEntry)
  if (useType === 'function') return use

  throw new Error(`Unsupported module rule use type "${useType}"`)
}

function normalizeUseEntry (entry) {
  const entryType = trueTypeOf(entry)

  if (entryType === 'string') return {loader: entry, options: {}}
  if (entryType === 'object') return {options: {}, ...entry}

  throw new Error(`Unsupported module rule use entry type "${entryType}"`)
}
