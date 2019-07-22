let environments = {}

// Default Environment
environments.development = {
    'port': 3000,
    'envName': 'development',
}

// Production Environment
environments.production = {
    'port': 5000,
    'envName': 'production',
}

let node_env = process.env.NODE_ENV
let curr_env = typeof (node_env) == 'string' ? node_env.toLowerCase() : ''

let env_export = typeof (environments[curr_env]) == 'object' ? environments[curr_env] : environments.development

// Export Module
module.exports = env_export