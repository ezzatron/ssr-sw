import {XmlEntities} from 'html-entities'

const entities = new XmlEntities()

export function attrs (map) {
  let html = ''

  for (const name in map) {
    html += ` ${name}="${entities.encode(map[name])}"`
  }

  return html
}

export function dataAttrs (data) {
  const map = {}

  for (const key in data) {
    const name = `data-${camelToKebab(key)}`
    const value = data[key]
    const valueType = typeof value

    if (valueType === 'boolean') {
      if (value) map[name] = ''
    } else if (valueType === 'string') {
      map[name] = value
    } else {
      map[name] = btoa(JSON.stringify(value))
    }
  }

  return attrs(map)
}

function camelToKebab (string) {
  return string.replace(
    /(.)([A-Z])/g,
    (_, left, right) => `${left}-${right.toLowerCase()}`,
  )
}

function btoa (string) {
  return Buffer.from(string).toString('base64')
}
