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
    case 'password':
      if (typeof (payloadStr) == 'string' && payloadStr.trim().length > 0) {
        return payloadStr.trim()
      } else {
        return false
      }
    case 'tos':
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
  let phone = typeof (queryObj) == 'string' && queryObj.trim().length == 10 ? queryObj : false

  if (phone) {
    // lookup the user
    _data.read('users', phone, (err, data) => {
      if (!err && data) {
        delete data.hashedPassword
        callback(200, data)
      } else {
        callback(404, { 'Error': 'User not found' })
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
  let phone = typeof (payloadObj) == 'string' && payloadObj.trim().length == 10 ? payloadObj : false

  let firstName = validateStr(data.payload.firstName, 'name')
  let lastName = validateStr(data.payload.lastName, 'name')
  let password = validateStr(data.payload.password, 'password')

  if (phone) {
    if (firstName || lastName || password) {
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
  let phone = typeof (queryObj) == 'string' && queryObj.trim().length == 10 ? queryObj : false

  if (phone) {
    // lookup the user
    _data.read('users', phone, (err, data) => {
      if (!err && data) {
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
    callback(400, { 'Error': 'Missing required field' })
  }
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