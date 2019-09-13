/* eslint-disable import/no-commonjs */

module.exports = {
  standardManifestTransforms: [
    filterManifest,
    preventHashedAssetCacheBusting,
  ],
}

const DOTFILE = /^\/?\./
const HOT_MODULE_UPDATE = /\.hot-update\./
const PRE_COMPRESSED = /\.(br|gz)$/
const VERSION = /\bVERSION$/

function filterManifest (originalManifest) {
  const manifest = originalManifest.filter(({url}) => {
    if (DOTFILE.test(url)) return false
    if (HOT_MODULE_UPDATE.test(url)) return false
    if (PRE_COMPRESSED.test(url)) return false
    if (VERSION.test(url)) return false

    return true
  })

  return {manifest, warnings: []}
}

const HASHED = /\.hash~[^.]+\./

function preventHashedAssetCacheBusting (originalManifest) {
  const manifest = originalManifest.map(entry => {
    const {url, revision} = entry

    return {
      ...entry,

      revision: HASHED.test(url) ? null : revision,
    }
  })

  return {manifest, warnings: []}
}
