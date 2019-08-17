/* Lib for storing and editing data */

// Deps
const fs = require('fs')
const fsp = require('fs').promises
const path = require('path')

const helpers = require('./helpers')

// Module Container
const lib = {}

lib.baseDir = path.join(__dirname, '/../.data/')

lib.create = (dir, file, data, callback) => {
  fs.open(`${lib.baseDir + dir}/${file}.json`, 'wx', (err, fd) => {
    if (!err && fd) {
      let stringData = JSON.stringify(data)

      fs.writeFile(fd, stringData, (err) => {
        if (!err) {
          fs.close(fd, (err) => {
            if (!err) {
              callback(false)
            } else {
              console.log(err)
              callback('Error closing file')
            }
          })
        } else {
          console.log(err)
          callback('Error writing to new file')
        }
      })
    } else {
      console.log(err)
      callback('Could not create new file!')
    }
  })
}

lib.read = (dir, file, callback) => {
  fs.readFile(`${lib.baseDir + dir}/${file}.json`, 'utf8', (err, data) => {
    if (!err && data) {
      let parsedData = helpers.parseJsonToObject(data)
      callback(false, parsedData)
    } else {
      callback(err, data)
    }
  })
}

lib.update = (dir, file, data, callback) => {
  fs.open(`${lib.baseDir + dir}/${file}.json`, 'r+', (err, fd) => {
    if (!err && fd) {
      let stringData = JSON.stringify(data)

      fs.truncate(fd, (err) => {
        if (!err) {
          fs.write(fd, stringData, (err) => {
            if (!err) {
              fs.close(fd, (err) => {
                if (!err) {
                  callback(false)
                } else {
                  console.log(err)
                  callback('Error closing file!')
                }
              })
            } else {
              console.log(err)
              callback('Error while writing to file')
            }
          })
        } else {
          console.log(err)
          callback('Error truncating file')
        }
      })

    } else {
      console.log(err)
      callback('Cannot open file for updating')
    }
  })
}

lib.delete = (dir, file, callback) => {
  fs.unlink(`${lib.baseDir + dir}/${file}.json`, (err) => {
    if (!err) {
      callback(false)
    } else {
      console.log(err)
      callback('Error deleting the file')
    }
  })
}

module.exports = lib