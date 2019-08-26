const morgan = require('morgan')

module.exports = {
  createLogMiddleware,
}

function createLogMiddleware () {
  return morgan('tiny')
}
