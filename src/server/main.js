import {asyncMiddleware} from './express.js'
import {createServerMiddleware} from './middleware.js'

export default options => asyncMiddleware(createServerMiddleware(options))
