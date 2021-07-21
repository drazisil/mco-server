// Mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import logger from '@drazisil/mco-logger'

/**
 * @module ClientConnectMsg
 */

/**
 *
 *
 * @class
 * @property {number} msgNo
 * @property {number} personaId
 * @property {number} appId
 * @property {number} customerId
 * @property {string} custName
 * @property {string} personaName
 * @property {Buffer} mcVersion
 */
export class ClientConnectMessage {
  msgNo: number
  personaId: number
  appId: number
  customerId: number
  custName: string
  personaName: string
  mcVersion: Buffer
  /**
   *
   * @param {Buffer} buffer
   */
  constructor(buffer: Buffer) {
    try {
      this.msgNo = buffer.readInt16LE(0)
    } catch (error) {
      if (error instanceof RangeError) {
        // This is likeley not an MCOTS packet, ignore
        this.msgNo = 0
      } else {
        throw new TypeError(
          `[ClientConnectMsg] Unable to read msgNo from ${buffer.toString(
            'hex',
          )}: ${error}`,
        )
      }
    }

    this.personaId = buffer.readInt32LE(6)

    // Set the appId to the Persona Id
    this.appId = this.personaId

    this.customerId = buffer.readInt32LE(2)
    this.custName = buffer.slice(10, 41).toString()
    this.personaName = buffer.slice(42, 73).toString()
    this.mcVersion = buffer.slice(74)
  }

  /**
   *
   * @return {number}
   */
  getAppId(): number {
    return this.appId
  }

  /**
   * DumpPacket
   * @return {void}
   */
  dumpPacket(): void {
    logger.log(
      `ClientConnectMsg',
      ${JSON.stringify({
        msgNo: this.msgNo.toString(),
        customerId: this.customerId.toString(),
        personaId: this.personaId.toString(),
        custName: this.custName,
        personaName: this.personaName,
        mcVersion: this.mcVersion.toString('hex'),
      })}`,
      { service: 'mcoserver:ClientConnectMsg' },
    )
  }
}
