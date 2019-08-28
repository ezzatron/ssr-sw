import htmlnano from 'htmlnano'
import posthtml from 'posthtml'

export function createHtmlProcessor () {
  const processor = posthtml([
    htmlnano(),
  ])

  return async function processHtml (html) {
    const {html: processed} = await processor.process(html)

    return processed
  }
}
