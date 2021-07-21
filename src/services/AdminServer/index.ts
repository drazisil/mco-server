// @ts-check
// Mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import logger from '@drazisil/mco-logger'
import { IncomingMessage, ServerResponse } from 'http'
import { createServer, Server } from 'https'
import { Socket } from 'net'
import config, { IAppConfiguration } from '../../../config/index'
import { _sslOptions } from '../@drazisil/ssl-options'
import { MCServer } from '../MCServer/index'

/**
 * SSL web server for managing the state of the system
 * @module AdminServer
 */

/**
 *
 * @property {config} config
 * @property {MCServer} mcServer
 * @property {Server} httpServer
 */
export class AdminServer {
  config: IAppConfiguration
  mcServer: MCServer
  serviceName: string
  httpsServer: Server | undefined
  /**
   * @class
   * @param {module:MCServer} mcServer
   */
  constructor(mcServer: MCServer) {
    this.config = config
    this.mcServer = mcServer
    this.serviceName = 'mcoserver:AdminServer;'
  }

  /**
   *
   * @return {string}
   */
  _handleGetBans(): string {
    const banlist = {
      mcServer: this.mcServer.mgr.getBans(),
    }
    return JSON.stringify(banlist)
  }

  /**
   *
   * @return {string}
   */
  _handleGetConnections(): string {
    const connections = this.mcServer.mgr.dumpConnections()
    let responseText = ''
    for (const [index, connection] of connections.entries()) {
      const displayConnection = `
        index: ${index} - ${connection.id}
            remoteAddress: ${connection.remoteAddress}:${connection.localPort}
            Encryption ID: ${connection.enc.getId()}
            inQueue:       ${connection.inQueue}
        `
      responseText += displayConnection
    }

    return responseText
  }

  /**
   *
   * @return {string}
   */
  _handleResetAllQueueState(): string {
    this.mcServer.mgr.resetAllQueueState()
    const connections = this.mcServer.mgr.dumpConnections()
    let responseText = 'Queue state reset for all connections\n\n'
    for (const [index, connection] of connections.entries()) {
      const displayConnection = `
        index: ${index} - ${connection.id}
            remoteAddress: ${connection.remoteAddress}:${connection.localPort}
            Encryption ID: ${connection.enc.getId()}
            inQueue:       ${connection.inQueue}
        `
      responseText += displayConnection
    }

    return responseText
  }

  /**
   * @return {void}
   * @param {import("http").IncomingMessage} request
   * @param {import("http").ServerResponse} response
   */
  _httpsHandler(request: IncomingMessage, response: ServerResponse): void {
    logger.log(
      `[Admin] Request from ${request.socket.remoteAddress} for ${request.method} ${request.url}`,
      { service: 'mcoserver:AdminServer' },
    )
    logger.log(
      `Requested recieved,
      ${JSON.stringify({
        url: request.url,
        remoteAddress: request.socket.remoteAddress,
      })}`,
      { service: 'mcoserver:AdminServer' },
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
   * @returns {void}
   * @param {import("net").Socket} socket
   */
  _socketEventHandler(socket: Socket): void {
    socket.on('error', error => {
      throw new Error(`[AdminServer] SSL Socket Error: ${error.message}`)
    })
  }

  /**
   *
   * @param {module:config.config} config
   * @return {Promise<void>}
   */
  async start(config: IAppConfiguration): Promise<void> {
    try {
      const sslOptions = await _sslOptions(config.certificate, this.serviceName)

      /** @type {import("https").Server} */
      this.httpsServer = createServer(
        sslOptions,
        (
          /** @type {import("http").IncomingMessage} */ request: import('http').IncomingMessage,
          /** @type {import("http").ServerResponse} */ response: import('http').ServerResponse,
        ) => {
          this._httpsHandler(request, response)
        },
      )
    } catch (error) {
      throw new Error(`${error.message}, ${error.stack}`)
    }

    this.httpsServer.listen({ port: 88, host: '0.0.0.0' }, () => {
      logger.log('port 88 listening', {
        service: 'mcoserver:AdminServer',
        level: 'debug',
      })
    })
    this.httpsServer.on('connection', this._socketEventHandler)
  }
}
