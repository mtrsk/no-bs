// Dependencies
const http = require('http');
const https = require('https');
const url = require('url');
const fs = require('fs');
const StringDecoder = require('string_decoder').StringDecoder;

// Libs
const config = require('./lib/config')
const handlers = require('./lib/handlers')
const helpers = require('./lib/helpers')

// Instantiate the HTTP Server
const httpServer = http.createServer((req, res) => {
  unifiedServer(req, res)
})

// Start the HTTP server
httpServer.listen(config.httpPort, () => {
  console.log(`listening to server on port ${config.httpPort}...`)
  console.log(`ENV_NAME = ${config.envName}`)
})

// Instantiate the HTTPS Server
let httpsServerOptions = {
  'key': fs.readFileSync('./https/key.pem'),
  'cert': fs.readFileSync('./https/cert.pem'),
}

const httpsServer = https.createServer(httpsServerOptions, (req, res) => {
  unifiedServer(req, res)
})

// Start the HTTPS server
httpsServer.listen(config.httpsPort, () => {
  console.log(`listening to server on port ${config.httpsPort}...`)
  console.log(`ENV_NAME = ${config.envName}`)
})

// Unified Server
let unifiedServer = (req, res) => {
  // Get URL from req and parse it
  let parsedUrl = url.parse(req.url, true)

  // Get path from URL
  let path = parsedUrl.pathname
  let trimmedPath = path.replace(/^\/+|\/+$/g, '')

  // Get the query string as an object
  let queryStringObject = parsedUrl.query

  // Get the request method, headers &&
  // payload
  let method = req.method.toUpperCase()
  let headers = req.headers

  let decoder = new StringDecoder('utf-8')
  let buffer = ''

  req.on('data', (data) => {
    // If there is no payload, then it'll never get
    // anything appended
    buffer += decoder.write(data)
  })
  req.on('end', () => {
    // Request has finished
    buffer += decoder.end();

    // Choose a handler
    let chosenHandler = typeof (router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound

    let data = {
      'trimmedPath': trimmedPath,
      'queryStringObject': queryStringObject,
      'method': method,
      'headers': headers,
      'payload': helpers.parseJsonToObject(buffer)
    }

    chosenHandler(data, (status, payload) => {
      status = typeof (status) == 'number' ? status : 200
      payload = typeof (payload) == 'object' ? payload : {}

      payloadStr = JSON.stringify(payload)

      // Return the response
      res.setHeader('Content-Type', 'application/json')
      res.writeHead(status)
      res.end(payloadStr)

      // Log the resquest Path
      console.log('Status: ', status, '\nPayload: ', payloadStr)
    })
  })
}

// Routers
let router = {
  'users': handlers.users
}