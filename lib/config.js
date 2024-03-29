let environments = {}

let hashingSecret = process.env.HASHING_SECRET

// Default Environment
environments.development = {
  'httpPort': 3000,
  'httpsPort': 3001,
  'envName': 'development',
  'hashingSecret': 'assassas',
}

// Production Environment
environments.production = {
  'httpPort': 5000,
  'httpsPort': 5001,
  'envName': 'production',
  'hashingSecret': 'assassas',
}

let node_env = process.env.NODE_ENV
let curr_env = typeof (node_env) == 'string' ? node_env.toLowerCase() : ''

let env_export = typeof (environments[curr_env]) == 'object' ? environments[curr_env] : environments.development

// Export Module
module.exports = env_export