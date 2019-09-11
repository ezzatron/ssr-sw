/* eslint-env browser */

import {createDataPlugin} from './common.js'

export default function createClientDataPlugin (routes, initialData = {}) {
  return createDataPlugin(routes, initialData)
}
