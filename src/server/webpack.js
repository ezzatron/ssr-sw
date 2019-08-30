import {extname, join} from 'path'

export function buildEntryTags (clientStats) {
  const {entrypoints, publicPath} = clientStats

  const linkHeaderParts = []
  const scriptTags = []
  const styleTags = []

  for (const name in entrypoints) {
    const {assets} = entrypoints[name]

    for (const asset of assets) {
      switch (extname(asset)) {
        case '.css': {
          const href = encodeUriPath(join(publicPath, asset))

          linkHeaderParts.push(`<${href}>; rel=preload; as=style`)
          styleTags.push(`<link data-chunk="${name}" rel="stylesheet" href="${href}">`)

          break
        }

        case '.js': {
          const href = encodeUriPath(join(publicPath, asset))

          linkHeaderParts.push(`<${href}>; rel=preload; as=script`)
          scriptTags.push(`<script async data-chunk="${name}" src="${href}"></script>`)

          break
        }
      }
    }
  }

  return {
    linkHeader: linkHeaderParts.join(', '),
    scriptTags,
    styleTags,
  }
}

function encodeUriPath (path) {
  return (
    path
      .split('/')
      .map(atom => encodeURIComponent(atom))
      .join('/')
  )
}
