/* eslint-disable import/no-commonjs */

module.exports = {
  isConfigMatch,
  isConfigProduction,
  isConfigTargeting,
  trueTypeOf,
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
  const {target: actualTarget} = config

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
