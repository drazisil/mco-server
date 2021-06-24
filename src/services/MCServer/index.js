// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

const { debug, log } = require('../@mcoserver/mco-logger')
const { ListenerThread } = require('./listenerThread')
const { ConnectionMgr } = require('./ConnectionMgr')
const config = require('../../../config')

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
module.exports.MCServer = class MCServer {
  /**
   *
   * @param {DatabaseManager} databaseManager
   */
  constructor(databaseManager) {
    this.config = config
    this.mgr = new ConnectionMgr(databaseManager, this.config)
    this.serviceName = 'mcoserver:MCServer'
  }

  /**
   * Start the HTTP, HTTPS and TCP connection listeners
   * @returns {Promise<void>}
   */

  async startServers() {
    const listenerThread = new ListenerThread()
    log('Starting the listening sockets...', { service: this.serviceName })
    const tcpPortList = [
      6660,
      8228,
      8226,
      7003,
      8227,
      43200,
      43300,
      43400,
      53303,
      9000,
      9001,
      9002,
      9003,
      9004,
      9005,
      9006,
      9007,
      9008,
      9009,
      9010,
      9011,
      9012,
      9013,
      9014
    ]

    tcpPortList.forEach(port => {
      listenerThread.startTCPListener(port, this.mgr)
      debug(`port ${port} listening`, { service: this.serviceName })
    })
    log('Listening sockets create successfully.', { service: this.serviceName })
  }
}
