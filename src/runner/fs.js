/* eslint-disable import/no-commonjs */

const {promisify} = require('util')
const {readFile} = require('fs')

module.exports = {
  readFile: promisify(readFile),
}
