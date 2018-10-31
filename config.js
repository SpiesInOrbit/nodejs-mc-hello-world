/*
 * Create and export configuration variables
 *
 */

// Container for environments
var environments = {};


// Staging (default) object
environments.staging = {
  'httpPort' : 3000,
  'httpsPort' : 3001,
  'envName' : 'staging'
};

environments.production = {
  'httpPort' : 5000,
  'httpsPort' : 5001,
  'envName' : 'production'
};

// determine which to export based on env variables
var currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ?
  process.env.NODE_ENV.toLowerCase() : '';

// Validate the environment or default to staging
var envToExport = typeof(environments[currentEnvironment]) == 'object' ?
  environments[currentEnvironment] : environments.staging;

module.exports = envToExport;
