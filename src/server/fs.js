import {promisify} from 'util'
import {readFile as readFileCps} from 'fs'

export const readFile = promisify(readFileCps)
