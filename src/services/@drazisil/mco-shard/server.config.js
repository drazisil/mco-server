// @ts-check
/**
 * @typedef {Object} config
 * @property {Object} [certificate] - optional if the server is not using ssl
 * @property {string} certificate.privateKeyFilename
 * @property {string} certificate.publicKeyFilename
 * @property {string} certificate.certFilename
 * @property {Object} serverSettings
 * @property {string} serverSettings.ipServer
 * @property {number} [serverSettings.port]
 * @property {Object} serviceConnections
 * @property {string} serviceConnections.databaseURL
 * @property {string} defaultLogLevel
 */

module.exports = {
  certificate: {
    // The patch server does not use ssl
  },
  serverSettings: {
    host: 'localhost',
    port: 81,
  },
  serviceConnections: {
    databaseURL: 'db.mco.db',
  },
  defaultLogLevel: 'info',
}
