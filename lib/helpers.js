/* Misc utilitary functions */

// Deps
const crypto = require('crypto')
const config = require('./config')

// Container
const helpers = {}

// SHA-512
helpers.hash = (str) => {
  if (typeof (str) == 'string' && str.length > 0) {
    let hash = crypto.createHmac('sha512', config.hashingSecret).update(str).digest('hex')
    return hash
  } else {
    return false
  }
}

// JSON to Object
helpers.parseJsonToObject = (str) => {
  try {
    let obj = JSON.parse(str)
    return obj
  } catch {
    return {}
  }
}

module.exports = helpers