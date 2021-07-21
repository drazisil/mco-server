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
    privateKeyFilename: 'data/private_key.pem',
    publicKeyFilename: 'data/pub.key',
    certFilename: 'data/mcouniverse.crt',
  },
  serverSettings: {
    host: 'localhost',
    port: 443,
  },
  serviceConnections: {
    databaseURL: 'db.mco.db',
  },
  defaultLogLevel: 'info',
}
