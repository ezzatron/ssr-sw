/* eslint-disable import/no-commonjs */

const CACHE_IMMUTABLE = 'max-age=31536000' // cache indefinitely
const CACHE_INDEX = 'must-revalidate, max-age=60' // cache for 1 minute
const CACHE_NEVER = 'no-store' // do not cache at all
const CACHE_SUB_OPTIMAL = 'must-revalidate, max-age=3600' // there's no good choice here - cache for 1 hour

const HASH_PATTERN = /\.hash~[^.]+\./

module.exports = {
  cacheControlByBasename,
}

function cacheControlByBasename (fileBasename) {
  if (fileBasename === 'favicon.ico') return CACHE_INDEX
  if (fileBasename === 'VERSION') return CACHE_NEVER
  if (fileBasename.endsWith('.browserconfig.xml')) return CACHE_INDEX
  if (fileBasename.endsWith('.sw.js')) return CACHE_NEVER
  if (fileBasename.endsWith('.webmanifest')) return CACHE_INDEX
  if (HASH_PATTERN.test(fileBasename)) return CACHE_IMMUTABLE

  return CACHE_SUB_OPTIMAL
}
