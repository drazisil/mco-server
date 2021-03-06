// Mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { log } from '@drazisil/mco-logger'
import { IAppConfiguration } from '../../../config'
import { IRawPacket } from '../../types'
import { LobbyServer } from '../LobbyServer'
import { LoginServer } from '../LoginServer'
import { PersonaServer } from '../PersonaServer/persona-server'
import { DatabaseManager } from '../shared/database-manager'
import { TCPConnection } from './tcpConnection'

/**
 * @module npsPacketManager
 */

/**
 * @typedef IMsgNameMapping
 * @property {number} id
 * @property {string} name
 */
export interface IMsgNameMapping {
  id: number
  name: string
}

/**
 * @class
 * @property {module:IAppSettings} config
 * @property {module:DatabaseManager} database
 * @property {string} npsKey
 * @property {module:npsPacketManager~IMsgNameMapping[]} msgNameMapping
 * @property {module:LoginServer} loginServer
 * @property {module:PersonaServer} personaServer
 * @property {module:LobbyServer} lobbyServer
 */
export class NPSPacketManager {
  config: IAppConfiguration
  database: DatabaseManager
  npsKey: string
  msgNameMapping: IMsgNameMapping[]
  loginServer: LoginServer
  personaServer: PersonaServer
  lobbyServer: LobbyServer
  serviceName: string
  /**
   *
   * @param {module:DatabaseManager} databaseMgr
   * @param {IAppSettings} appSettings
   */
  constructor(databaseMgr: DatabaseManager, appSettings: IAppConfiguration) {
    this.config = appSettings
    this.database = databaseMgr
    this.npsKey = ''
    this.msgNameMapping = [
      { id: 0x1_00, name: 'NPS_LOGIN' },
      { id: 0x1_20, name: 'NPS_LOGIN_RESP' },
      { id: 0x1_28, name: 'NPS_GET_MINI_USER_LIST' },
      { id: 0x2_07, name: 'NPS_ACK' },
      { id: 0x2_17, name: 'NPS_HEATBEAT' },
      { id: 0x2_29, name: 'NPS_MINI_USER_LIST' },
      { id: 0x3_0c, name: 'NPS_SEND_MINI_RIFF_LIST' },
      { id: 0x5_01, name: 'NPS_USER_LOGIN' },
      { id: 0x5_03, name: 'NPS_REGISTER_GAME_LOGIN' },
      { id: 0x5_07, name: 'NPS_NEW_GAME_ACCOUNT' },
      { id: 0x5_32, name: 'NPS_GET_PERSONA_MAPS' },
      { id: 0x6_07, name: 'NPS_GAME_ACCOUNT_INFO' },
      { id: 0x11_01, name: 'NPS_CRYPTO_DES_CBC' },
    ]

    this.loginServer = new LoginServer(this.database)
    this.personaServer = new PersonaServer()
    this.lobbyServer = new LobbyServer()
    this.serviceName = 'mcoserver:NPSPacketManager'
  }

  /**
   *
   * @param {number} msgId
   * @return {string}
   */
  msgCodetoName(messageId: number): string {
    const mapping = this.msgNameMapping.find(code => code.id === messageId)
    return mapping ? mapping.name : 'Unknown msgId'
  }

  /**
   *
   * @return {string}
   */
  getNPSKey(): string {
    return this.npsKey
  }

  /**
   *
   * @param {string} key
   * @return {void}
   */
  setNPSKey(key: string): void {
    this.npsKey = key
  }

  /**
   *
   * @param {module:IRawPacket} rawPacket
   * @return {Promise<ConnectionObj>}
   */
  async processNPSPacket(rawPacket: IRawPacket): Promise<TCPConnection> {
    const messageId = rawPacket.data.readInt16BE(0)
    log(
      `Handling message',
      ${{ msgName: this.msgCodetoName(messageId), msgId: messageId }}`,
      { service: this.serviceName },
    )

    const { localPort } = rawPacket

    switch (localPort) {
      case 8226:
        return this.loginServer.dataHandler(rawPacket, this.config)
      case 8228:
        return this.personaServer.dataHandler(rawPacket)
      case 7003:
        return this.lobbyServer.dataHandler(rawPacket)
      default:
        process.exitCode = -1
        throw new Error(
          `[npsPacketManager] Recieved a packet',
          ${{
            msgId: messageId,
            localPort,
          }}`,
        )
    }
  }
}
