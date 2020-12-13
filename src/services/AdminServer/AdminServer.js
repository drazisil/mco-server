// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

const debug = require('debug')('mcoserver:AdminServer')
const appSettings = require('../../../config/app-settings')
const logger = require('../../shared/logger')
const fs = require('fs')
const https = require('https')

/**
 *
 *
 * @class AdminServer
 * @property {MCServer} mcServer
 * @property {winston.Logger} logger
 * @property {https.httpServer|undefined} httpServer
 */
class AdminServer {
  /**
   *
   * @param {MCServer} mcServer
   */
  constructor (mcServer) {
    this.mcServer = mcServer
    /**
     * @type {Logger}
     */
    this.logger = logger.child({ service: 'mcoserver:AdminServer' })
    /** @type {https.httpsServer|undefined} */
    let httpServer
  }

  /**
   * Create the SSL options object
   *
   * @param {IServerConfiguration.serverConfig} configuration
   * @return {sslOptionsObj}
   */
  _sslOptions (configuration) {
    return {
      cert: fs.readFileSync(configuration.certFilename),
      honorCipherOrder: true,
      key: fs.readFileSync(configuration.privateKeyFilename),
      rejectUnauthorized: false
    }
  }

  /**
   *
   * @return {string[]}
   */
  _handleGetBans () {
    const banlist = {
      mcServer: this.mcServer.mgr.getBans()
    }
    return JSON.stringify(banlist)
  }

  /**
   *
   * @return {string}
   */
  _handleGetConnections () {
    const connections = this.mcServer.mgr.dumpConnections()
    let responseText = ''
    connections.forEach((connection, index) => {
      const displayConnection = `
        index: ${index} - ${connection.id}
            remoteAddress: ${connection.remoteAddress}:${connection.localPort}
            Encryption ID: ${connection.enc.getId()}
            inQueue:       ${connection.inQueue}
        `
      responseText += displayConnection
    })
    return responseText
  }

  /**
   *
   * @return {string}
   */
  _handleResetAllQueueState () {
    this.mcServer.mgr.resetAllQueueState()
    const connections = this.mcServer.mgr.dumpConnections()
    let responseText = 'Queue state reset for all connections\n\n'
    connections.forEach((connection, index) => {
      const displayConnection = `
        index: ${index} - ${connection.id}
            remoteAddress: ${connection.remoteAddress}:${connection.localPort}
            Encryption ID: ${connection.enc.getId()}
            inQueue:       ${connection.inQueue}
        `
      responseText += displayConnection
    })
    return responseText
  }

  /**
   *
   * @param {IncomingMessage} request
   * @param {ServerResponse} response
   * @return {any}
   */
  _httpsHandler (request, response) {
    this.logger.info(
      `[Admin] Request from ${request.socket.remoteAddress} for ${request.method} ${request.url}`
    )
    this.logger.info(
      {
        url: request.url,
        remoteAddress: request.connection.remoteAddress
      },
      'Requested recieved'
    )
    switch (request.url) {
      case '/admin/connections':
        response.setHeader('Content-Type', 'text/plain')
        return response.end(this._handleGetConnections())

      case '/admin/connections/resetAllQueueState':
        response.setHeader('Content-Type', 'text/plain')
        return response.end(this._handleResetAllQueueState())

      case '/admin/bans':
        response.setHeader('Content-Type', 'application/json; charset=utf-8')
        return response.end(this._handleGetBans())

      default:
        if (request.url && request.url.startsWith('/admin')) {
          return response.end('Jiggawatt!')
        }
        response.statusCode = 404
        response.end('Unknown request.')
        break
    }
  }

  /**
   *
   * @param {IServerConfiguration.serverConfig} config
   */
  async start (config) {
    try {
      this.httpsServer = https.createServer(
        this._sslOptions(config),
        (req, res) => {
          this._httpsHandler(req, res)
        }
      )
    } catch (err) {
      this.logger.error(`${err.message}, ${err.stack}`)
      process.exit(-1)
    }
    this.httpsServer.listen({ port: 88, host: '0.0.0.0' }, () => {
      debug('port 88 listening')
    })
    this.httpsServer.on('connection', socket => {
      socket.on('error', error => {
        throw new Error(`[AdminServer] SSL Socket Error: ${error.message}`)
      })
    })
  }
}

module.exports = {
  AdminServer
}
