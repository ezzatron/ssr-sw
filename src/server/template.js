import {compile} from 'ejs'

import {readFile} from './fs.js'

export async function readTemplate (templatePath) {
  const content = await readFile(templatePath)

  return compile(content.toString())
}
