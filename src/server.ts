// Mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { log } from '@drazisil/mco-logger'
import config, { IAppConfiguration } from '../config/index'
import { AdminServer } from './services/AdminServer/index'
import { MCServer } from './services/MCServer/index'
import { DatabaseManager } from './services/shared/database-manager'

/**
 * Main game server
 * @class
 * @property {config.config} config
 * @property {DatabaseManager} databaseManager
 * @property {MCServer} mcServer
 * @property {AdminServer} adminServer
 */
export class Server {
  config: IAppConfiguration
  databaseManager: DatabaseManager
  serviceName: string
  mcServer: MCServer | undefined
  adminServer: AdminServer | undefined
  /**
   * @param {DatabaseManager} databaseManager
   */
  constructor(databaseManager: DatabaseManager) {
    this.config = config
    this.databaseManager = databaseManager
    this.serviceName = 'mcoserver:Server'
  }

  /**
   * @return {Promise<void>}
   */
  async start(): Promise<void> {
    log('Starting servers...', { service: 'mcoserver:Server' })

    // Start the MC Server
    this.mcServer = new MCServer(this.databaseManager)
    this.mcServer.startServers()

    // Start the Admin server
    this.adminServer = new AdminServer(this.mcServer)
    await this.adminServer.start(this.config)
    log('Web Server started', { service: 'mcoserver:Server' })

    log('Servers started, ready for connections.', {
      service: 'mcoserver:Server',
    })
  }
}
