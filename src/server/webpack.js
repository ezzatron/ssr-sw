import {extname, join} from 'path'

export function buildEntryTags (clientStats) {
  const {entrypoints, publicPath} = clientStats

  const linkHeader = []
  const scriptTags = []
  const styleTags = []

  for (const name in entrypoints) {
    const {assets} = entrypoints[name]

    for (const asset of assets) {
      switch (extname(asset)) {
        case '.css': {
          const href = encodeUriPath(join(publicPath, asset))

          linkHeader.push(`<${href}>; rel=preload; as=style`)
          styleTags.push(`<link data-chunk="${name}" rel="stylesheet" href="${href}">`)

          break
        }

        case '.js': {
          if (asset.match(/\.hot-update\./)) break

          const href = encodeUriPath(join(publicPath, asset))

          linkHeader.push(`<${href}>; rel=preload; as=script`)
          scriptTags.push(`<script async data-chunk="${name}" src="${href}"></script>`)

          break
        }
      }
    }
  }

  return {
    linkHeader: linkHeader.join(', '),
    scriptTags: scriptTags.join(''),
    styleTags: styleTags.join(''),
  }
}

export function buildHtml (templateHtml, options = {}) {
  const {
    styleTags = '',
  } = options

  return injectHtml(
    templateHtml,
    styleTags,
    buildHtmlBody(options),
  )
}

function buildHtmlBody (options) {
  const {
    appData,
    appHtml = '',
    scriptTags = '',
    version,
  } = options

  let body = ''

  if (appHtml) body += `<span id="root">${appHtml}</span>`

  if (version) {
    body += `<script type="text/javascript">window.VERSION = ${JSON.stringify(version)}</script>`
  }

  if (typeof appData !== 'undefined') {
    body += `<script id="__APP_DATA__" type="application/json">${JSON.stringify(appData)}</script>`
  }

  body += scriptTags

  return body
}

function encodeUriPath (path) {
  return (
    path
      .split('/')
      .map(atom => encodeURIComponent(atom))
      .join('/')
  )
}

function injectHtml (templateHtml, head, body) {
  return templateHtml
    .replace(/<\/head>/i, `${head}</head>`)
    .replace(/<\/body>/i, `${body}</body>`)
}
