// Dependencies
const http = require('http');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./config')

// Server should respond to all requests
const server = http.createServer(
    (req, res) => {
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
                'payload': buffer,
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
)

// Start the server
server.listen(config.port, () => {
    console.log(`listening to server on port ${config.port}...`)
    console.log(`ENV_NAME = ${config.envName}`)
})

// Handlers
let handlers = {}

handlers.sample = (data, callback) => {
    callback(406, { 'name': 'name handler' })
}

handlers.notFound = (data, callback) => {
    callback(404)
}

// Routers
let router = {
    'sample': handlers.sample,
}