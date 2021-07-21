// Mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import logger from '@drazisil/mco-logger'
import config, { IAppConfiguration } from '../../../config/index'
import { ConnectionManager } from './connection-mgr'
import { ListenerThread } from './listener-thread'

/**
 * This class starts all the servers
 * TODO: Better document this
 * @module MCServer
 */

/**
 * @class
 * @property {config.config} config
 * @property {ConnectionMgr} mgr
 */
export class MCServer {
  static _instance: MCServer
  config: IAppConfiguration
  mgr: ConnectionManager
  serviceName: string

  static getInstance(): MCServer {
    if (!MCServer._instance) {
      MCServer._instance = new MCServer()
    }
    return MCServer._instance
  }

  private constructor() {
    this.config = config
    this.mgr = ConnectionManager.getInstance()
    this.serviceName = 'mcoserver:MCServer'
  }

  /**
   * Start the HTTP, HTTPS and TCP connection listeners
   * @returns {Promise<void>}
   */

  async startServers(): Promise<void> {
    const listenerThread = new ListenerThread()
    logger.log('Starting the listening sockets...', {
      service: this.serviceName,
    })
    const tcpPortList = [
      6660, 8228, 8226, 7003, 8227, 43_200, 43_300, 43_400, 53_303, 9000, 9001,
      9002, 9003, 9004, 9005, 9006, 9007, 9008, 9009, 9010, 9011, 9012, 9013,
      9014,
    ]

    for (const port of tcpPortList) {
      listenerThread.startTCPListener(port, this.mgr)
      logger.debug(`port ${port} listening`, { service: this.serviceName })
    }

    logger.log('Listening sockets create successfully.', {
      service: this.serviceName,
    })
  }
}
