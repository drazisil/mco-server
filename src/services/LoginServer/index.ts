// Mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { debug, log } from '@drazisil/mco-logger'
import { IAppConfiguration } from '../../../config'
import { IRawPacket, IUserRecordMini } from '../../types'
import { TCPConnection } from '../MCServer/tcpConnection'
import { DatabaseManager } from '../shared/database-manager'
import { NPSUserStatus } from './nps-user-status'
import { premadeLogin } from './packet'

/**
 * Manages the initial game connection setup and teardown.
 * @module LoginServer
 */

/**
 * @class
 * @property {DatabaseManager} databaseManager
 */
export class LoginServer {
  databaseManager: DatabaseManager
  serviceName: string
  /**
   *
   * @param {DatabaseManager} databaseMgr
   */
  constructor(databaseMgr: DatabaseManager) {
    this.databaseManager = databaseMgr
    this.serviceName = 'mcoserver:LoginServer'
  }

  /**
   *
   * @param {IRawPacket} rawPacket
   * @param {IServerConfig} config
   * @return {Promise<ConnectionObj>}
   */
  async dataHandler(
    rawPacket: IRawPacket,
    config: IAppConfiguration,
  ): Promise<TCPConnection> {
    let processed = true
    const { connection, data } = rawPacket
    const { localPort, remoteAddress } = rawPacket
    log(
      `Received Login packet: ${JSON.stringify({ localPort, remoteAddress })}`,
      { service: this.serviceName },
    )
    // TODO: Check if this can be handled by a MessageNode object
    const { sock } = connection
    const requestCode = data.readUInt16BE(0).toString(16)

    let responsePacket

    switch (requestCode) {
      // NpsUserLogin
      case '501': {
        responsePacket = await this._userLogin(connection, data, config)
        break
      }

      default:
        debug(
          `Unknown nps code recieved',
          ${{
            requestCode,
            localPort,
            data: rawPacket.data.toString('hex'),
          }}`,
          { service: this.serviceName },
        )
        processed = false
    }

    if (processed && responsePacket) {
      debug(
        `responsePacket object from dataHandler',
      ${{
        userStatus: responsePacket.toString('hex'),
      }}`,
        { service: this.serviceName },
      )
      debug(
        `responsePacket's data prior to sending: ${responsePacket.toString(
          'hex',
        )}`,
        { service: this.serviceName },
      )
      sock.write(responsePacket)
    }

    return connection
  }

  /**
   *
   * @param {string} contextId
   * @return {Promise<IUserRecordMini>}
   */
  async _npsGetCustomerIdByContextId(
    contextId: string,
  ): Promise<IUserRecordMini> {
    debug('Entering _npsGetCustomerIdByContextId...', {
      service: this.serviceName,
    })
    /** @type {IUserRecordMini[]} */
    const users: IUserRecordMini[] = [
      {
        contextId: '5213dee3a6bcdb133373b2d4f3b9962758',
        customerId: 0xac_01_00_00,
        userId: 0x00_00_00_02,
      },
      {
        contextId: 'd316cd2dd6bf870893dfbaaf17f965884e',
        customerId: 0x00_54_b4_6c,
        userId: 0x00_00_00_01,
      },
    ]
    if (contextId.toString() === '') {
      throw new Error(`Unknown contextId: ${contextId.toString()}`)
    }

    const userRecord = users.filter(user => user.contextId === contextId)
    if (userRecord.length !== 1) {
      debug(
        `preparing to leave _npsGetCustomerIdByContextId after not finding record',
        ${{
          contextId,
        }}`,
        { service: this.serviceName },
      )
      throw new Error(
        `Unable to locate user record matching contextId ${contextId}`,
      )
    }

    debug(
      `preparing to leave _npsGetCustomerIdByContextId after finding record',
      ${{
        contextId,
        userRecord,
      }}`,
      { service: this.serviceName },
    )
    return userRecord[0]
  }

  /**
   * Process a UserLogin packet
   * Should return a @link {module:NPSMsg} object
   * @param {ConnectionObj} connection
   * @param {Buffer} data
   * @param {IServerConfig} config
   * @return {Promise<Buffer>}
   */
  async _userLogin(
    connection: TCPConnection,
    data: Buffer,
    config: IAppConfiguration,
  ): Promise<Buffer> {
    const { sock } = connection
    const { localPort } = sock
    const userStatus = new NPSUserStatus(data)
    log(
      `Received login packet',
      ${{
        localPort,
        remoteAddress: connection.remoteAddress,
      }}`,
      { service: this.serviceName },
    )

    userStatus.extractSessionKeyFromPacket(config['certificate'], data)

    debug(
      `UserStatus object from _userLogin',
      ${{
        userStatus: userStatus.toJSON(),
      }}`,
      { service: this.serviceName },
    )
    userStatus.dumpPacket()

    // Load the customer record by contextId
    // TODO: This needs to be from a database, right now is it static
    const customer = await this._npsGetCustomerIdByContextId(
      userStatus.contextId,
    )

    // Save sessionkey in database under customerId
    debug('Preparing to update session key in db', {
      service: this.serviceName,
    })
    await this.databaseManager._updateSessionKey(
      customer.customerId,
      userStatus.sessionkey,
      userStatus.contextId,
      connection.id,
    )
    log('Session key updated', { service: this.serviceName })

    // Create the packet content
    // TODO: This needs to be dynamically generated, right now we are using a
    // a static packet that works _most_ of the time
    const packetContent = premadeLogin()
    debug(`Using Premade Login: ${packetContent.toString('hex')}`, {
      service: this.serviceName,
    })

    // MsgId: 0x601
    Buffer.from([0x06, 0x01]).copy(packetContent)

    // Packet length: 0x0100 = 256
    Buffer.from([0x01, 0x00]).copy(packetContent, 2)

    // Load the customer id
    packetContent.writeInt32BE(customer.customerId, 12)

    // Don't use queue (+208, but I'm not sure if this includes the header or not)
    Buffer.from([0x00]).copy(packetContent, 208)

    /**
     * Return the packet twice for debug
     * Debug sends the login request twice, so we need to reply twice
     * Then send ok to login packet
     */
    return Buffer.concat([packetContent, packetContent])
  }
}
