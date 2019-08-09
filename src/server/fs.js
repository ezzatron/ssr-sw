import {promisify} from 'util'

import {
  close as closeCps,
  fstat as fstatCps,
  open as openCps,
  readFile as readFileCps,
} from 'fs'

export const close = promisify(closeCps)
export const fstat = promisify(fstatCps)
export const open = promisify(openCps)
export const readFile = promisify(readFileCps)
