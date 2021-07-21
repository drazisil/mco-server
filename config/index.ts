// @ts-check

/**
 * @module mco_config
 */
export interface IAppConfiguration {
  certificate: {
    privateKeyFilename: string
    publicKeyFilename: string
    certFilename: string
  },
  serverSettings: {
    ipServer: string
  },
  serviceConnections: {
    databaseURL: string
  },
  defaultLogLevel: string
}

/**
 * @typedef {Object} config
 * @property {Object} certificate
 * @property {string} certificate.privateKeyFilename
 * @property {string} certificate.publicKeyFilename
 * @property {string} certificate.certFilename
 * @property {Object} serverSettings
 * @property {string} serverSettings.ipServer
 * @property {Object} serviceConnections
 * @property {string} serviceConnections.databaseURL
 * @property {string} defaultLogLevel
 * @memberof {mco_config}
 * @global
 */
export const certificate: IAppConfiguration['certificate'] = {
  privateKeyFilename: 'data/private_key.pem',
  publicKeyFilename: 'data/pub.key',
  certFilename: 'data/mcouniverse.crt',
}
export const serverSettings: IAppConfiguration['serverSettings'] = {
  ipServer: 'localhost',
}
export const serviceConnections: IAppConfiguration['serviceConnections'] = {
  databaseURL: 'db.mco.db',
}
export const defaultLogLevel: IAppConfiguration['defaultLogLevel'] = 'info'

const config: IAppConfiguration = {
  certificate,
  serverSettings,
  serviceConnections,
  defaultLogLevel,
}
export default config
