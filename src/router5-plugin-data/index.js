import {noop, normalizeFetchSpec, normalizeKeySpec} from './common.js'

export function persistentKey (keySpec) {
  const {onActivate} = normalizeKeySpec(keySpec)

  return {
    onActivate: createPersistentOnActivate(onActivate),
    onDeactivate: noop,
  }
}

export function persistentRoute (fetchData) {
  return function persistentFetchData (dependencies, context) {
    const fetchSpec = normalizeFetchSpec(fetchData(dependencies, context))
    const persistent = {}

    for (const key in fetchSpec) {
      const {onActivate} = fetchSpec[key]

      persistent[key] = {
        onActivate: createPersistentOnActivate(onActivate),
        onDeactivate: noop,
      }
    }

    return persistent
  }
}

function createPersistentOnActivate (onActivate) {
  return function persistentOnActivate (clean, outcome) {
    if (outcome) {
      if (outcome.status === 'rejected') {
        clean()
      } else {
        return
      }
    }

    return onActivate(clean, outcome)
  }
}
