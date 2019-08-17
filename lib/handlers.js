/* Request Handlers
*/

// Deps
const _data = require('./data')
const helpers = require('./helpers')

// Handlers
let handlers = {}

// Users
handlers.users = (data, callback) => {
  let acceptableMethods = ['POST', 'GET', 'PUT', 'DELETE']

  if (acceptableMethods.includes(data.method)) {
    handlers._users[data.method](data, callback)
  } else {
    callback(405, { 'Error': 'Invalid Method' })
  }
}

// Container for Users submethods
let validateStr = (payloadStr, operation) => {
  switch (operation) {
    case 'name':
      if (typeof (payloadStr) == 'string' && payloadStr.trim().length > 0) {
        return payloadStr.trim()
      } else {
        return false
      }
    case 'phone':
      if (typeof (payloadStr) == 'string' && payloadStr.trim().length == 10) {
        return payloadStr.trim()
      } else {
        return false
      }
    case 'id':
      if (typeof (payloadStr) == 'string' && payloadStr.trim().length == 32) {
        return payloadStr.trim()
      } else {
        return false
      }
    case 'password':
      if (typeof (payloadStr) == 'string' && payloadStr.trim().length > 0) {
        return payloadStr.trim()
      } else {
        return false
      }
    case ('tos'):
      if (typeof (payloadStr) == 'boolean' && payloadStr == true) {
        return true
      } else {
        return false
      }
    case ('extend'):
      if (typeof (payloadStr) == 'boolean' && payloadStr == true) {
        return true
      } else {
        return false
      }
  }
}

handlers._users = {}

handlers._users.POST = (data, callback) => {
  /* 
  Required Data:
  - firstName
  - lastName
  - phone
  - password
  - tosAgreement
  Optional Data: None
  */
  let firstName = validateStr(data.payload.firstName, 'name')
  let lastName = validateStr(data.payload.lastName, 'name')
  let phone = validateStr(data.payload.phone, 'phone')
  let password = validateStr(data.payload.password, 'password')
  let tosAgreement = validateStr(data.payload.tosAgreement, 'tos')

  if (firstName && lastName && phone && password && tosAgreement) {
    _data.read('users', phone, (err, data) => {
      if (err) {
        // Hash password
        let hashedPassword = helpers.hash(password)

        if (hashedPassword) {
          // Create User Object
          let user = {
            'firstName': firstName,
            'lastName': lastName,
            'phone': phone,
            'hashedPassword': hashedPassword,
            'tosAgreement': true
          }

          // Persist to disk
          _data.create('users', phone, user, (err) => {
            if (!err) {
              callback(200)
            } else {
              console.log(err)
              callback(500, { 'Error': 'Could not create new user' })
            }
          })
        } else {
          callback(500, { 'Error': 'Unable to hash password' })
        }

      } else {
        callback(400, { 'Error': 'User already exists' })
      }
    })
  } else {
    callback(404, { 'Error': 'Missing required fields' })
  }
}

handlers._users.GET = (data, callback) => {
  /* 
  Required Data:
  - phone
  Optional Data: None
  */
  let queryObj = data.queryStringObject.phone
  let phone = validateStr(queryObj, 'phone')

  if (phone) {
    // Get the TokenId from the headers
    let id = validateStr(queryObj.tokens, 'id')
    handlers._tokens.verifyToken(id, phone, (validToken) => {
      if (validToken) {
        // Lookup the user
        _data.read('users', phone, (err, userData) => {
          if (!err && userData) {
            delete userData.hashedPassword
            callback(200, userData)
          } else {
            callback(404, { 'Error': 'User not found' })
          }
        })
      } else {
        callback(403, { 'Error': 'Not Authorized' })
      }
    })
  } else {
    callback(400, { 'Error': 'Missing required field' })
  }
}

handlers._users.PUT = (data, callback) => {
  /* 
  Required Data:
  - phone
  Optional Data: (at least one must be specified)
  - firstName
  - lastName
  - password
  */
  let payloadObj = data.payload.phone

  let phone = validateStr(payloadObj, 'phone')
  let firstName = validateStr(data.payload.firstName, 'name')
  let lastName = validateStr(data.payload.lastName, 'name')
  let password = validateStr(data.payload.password, 'password')

  if (phone) {
    if (firstName || lastName || password) {
      // Validate Token
      let id = validateStr(queryObj.tokens, 'id')
      handlers._tokens.verifyToken(id, phone, (validToken) => {
        if (validToken) {
          // lookup the user
          _data.read('users', phone, (err, userData) => {
            if (!err && userData) {
              // Update necessary fields
              if (firstName) {
                userData.firstName = firstName
              } else if (lastName) {
                userData.lastName = lastName
              } else if (password) {
                userData.hashedPassword = helpers.hash(password)
              }
              _data.update('users', phone, userData, (err) => {
                if (!err) {
                  callback(200, userData)
                } else {
                  console.log(err)
                  callback(500, { 'Error': 'Could not update User' })
                }
              })
              callback(200, userData)
            } else {
              callback(404, { 'Error': 'User not found' })
            }
          })
        } else {
          callback(403, { 'Error': 'Not Authorized' })
        }
      })
    } else {
      callback(400, { 'Error': 'Missing fields to update' })
    }
  } else {
    callback(400, { 'Error': 'Missing required field' })
  }
}

handlers._users.DELETE = (data, callback) => {
  /* 
  Required Data:
  - phone
  Optional Data: None
  */
  let queryObj = data.queryStringObject.phone
  let phone = validateStr(queryObj, 'phone')

  if (phone) {
    // Validate Token
    let id = validateStr(queryObj.tokens, 'id')
    handlers._tokens.verifyToken(id, phone, (validToken) => {
      if (validToken) {
        // lookup the user
        _data.read('users', phone, (err, userData) => {
          if (!err && userData) {
            _data.delete('users', phone, (err) => {
              if (!err) {
                callback(200)
              } else {
                console.log(err)
                callback(500, { 'Error': 'Could not delete user' })
              }
            })
          } else {
            callback(404, { 'Error': 'User not found' })
          }
        })
      } else {
        callback(403, { 'Error': 'Not Authorized' })
      }
    })
  } else {
    callback(400, { 'Error': 'Missing required field' })
  }
}

// Tokens
handlers.tokens = (data, callback) => {
  let acceptableMethods = ['POST', 'GET', 'PUT', 'DELETE']

  if (acceptableMethods.includes(data.method)) {
    handlers._tokens[data.method](data, callback)
  } else {
    callback(405, { 'Error': 'Invalid Method' })
  }
}

// Container for all tokens methods
handlers._tokens = {}

handlers._tokens.POST = (data, callback) => {
  // Required Data
  // - Phone
  // - Password
  let phone = validateStr(data.payload.phone, 'phone')
  let password = validateStr(data.payload.password, 'password')
  if (phone && password) {
    _data.read('users', phone, (err, userData) => {
      if (!err && userData) {
        // hash the sent password && compare
        let hashedPassword = helpers.hash(password)
        if (hashedPassword === userData.hashedPassword) {
          // Create token and expire it after 1 hour
          let tokenId = helpers.createRandomString(32)
          let expires = Date.now() + 1000 * 60 * 60
          let tokenObj = {
            'phone': phone,
            'id': tokenId,
            'expires': expires
          }
          // store the token
          _data.create('tokens', tokenId, tokenObj, (err) => {
            if (!err) {
              callback(200, tokenObj)
            } else {
              console.log(err)
              callback(500, { 'Error': 'Could not create new token' })
            }
          })

        } else {
          callback(400, { 'Error': 'Password did not match' })
        }

      } else {
        callback(404, 'User not found')
      }
    })

  } else {
    callback(400, { 'Error': 'Missing required field' })
  }
}

handlers._tokens.GET = (data, callback) => {
  // Required Data: id
  let queryObj = data.queryStringObject.id
  let id = validateStr(queryObj, 'id')

  if (id) {
    // lookup the token
    _data.read('tokens', id, (err, tokenData) => {
      if (!err && data) {
        callback(200, tokenData)
      } else {
        callback(404, { 'Error': 'User not found' })
      }
    })
  } else {
    callback(400, { 'Error': 'Missing required field' })
  }
}

handlers._tokens.PUT = (data, callback) => {
  // Required Data: id, extend
  let id = validateStr(data.payload.id, 'id')
  let extend = validateStr(data.payload.extend, 'extend')

  if (id && extend) {
    // Lookup the token
    _data.read('tokens', id, (err, tokenData) => {
      if (!err && tokenData) {
        // Check if token is expired
        if (tokenData.expires > Date.now()) {
          // Increase expiration by 1 hour
          tokenData.expires = Date.now() + 1000 * 60 * 60

          _data.update('tokens', id, tokenData, (err) => {
            if (!err) {
              callback(200)
            } else {
              console.log(err)
              callback(500, { 'Error': 'Failed to update Token' })
            }
          })

        } else {
          callback(400, { 'Error': 'Token has expired' })
        }
      } else {
        callback(404, { 'Error': 'Token not found' })
      }
    })
  } else {
    callback(400, { 'Error': 'Missing required fields' })
  }
}

handlers._tokens.DELETE = (data, callback) => {
  // Required Data: id
  let queryObj = data.queryStringObject.id
  let id = validateStr(queryObj, 'id')

  console.log(id)

  if (id) {
    // lookup the Token
    _data.read('tokens', id, (err, tokenData) => {
      if (!err && tokenData) {
        _data.delete('tokens', id, (err) => {
          if (!err) {
            callback(200)
          } else {
            console.log(err)
            callback(500, { 'Error': 'Could not delete token' })
          }
        })
      } else {
        callback(404, { 'Error': 'Token not found' })
      }
    })
  } else {
    callback(400, { 'Error': 'Missing required field' })
  }
}

// Verify if a given TokenID is valid for a given user
handlers._tokens.verifyToken = (id, phone, callback) => {
  _data.read('tokens', id, (err, tokenData) => {
    if (!err && tokenData) {
      if (tokenData.phone === phone && tokenData.expires > Date.now()) {
        callback(true)
      } else {
        callback(false)
      }
    } else {
      callback(false)
    }
  })
}

// Ping
handlers.ping = (data, callback) => {
  callback(200)
}

// 404
handlers.notFound = (data, callback) => {
  callback(404)
}

// Export
module.exports = handlers