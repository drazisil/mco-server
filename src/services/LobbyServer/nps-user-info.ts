// @ts-check
// Mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import logger from '@drazisil/mco-logger'
import { EMessageDirection } from '../MCOTS/message-node'
import { NPSMessage } from '../MCOTS/nps-msg'

/**
 * @module NPSUserInfo
 */

/**
 * @class
 * @extends {NPSMsg}
 * @property {number} userId
 * @property {Buffer} userName
 * @property {Buffer} userData
 */
export class NPSUserInfo extends NPSMessage {
  userId: number
  userName: Buffer
  userData: Buffer
  /**
   *
   * @param {MESSAGE_DIRECTION} direction
   */
  constructor(direction: EMessageDirection) {
    super(direction)
    this.userId = 0
    this.userName = Buffer.from([0x00]) // 30 length
    this.userData = Buffer.from([0x00]) // 64 length
    this.serviceName = 'mcoserver:NPSUserInfo'
  }

  /**
   *
   * @param {Buffer} rawData
   * @return {NPSUserInfo}
   */
  deserialize(rawData: Buffer): NPSUserInfo {
    this.userId = rawData.readInt32BE(4)
    this.userName = rawData.slice(8, 38)
    this.userData = rawData.slice(38)
    return this
  }

  /**
   * @return {void}
   */
  dumpInfo(): void {
    this.dumpPacketHeader('NPSUserInfo')
    logger.debug(`UserId:        ${this.userId}`, { service: this.serviceName })
    logger.debug(`UserName:      ${this.userName.toString()}`, {
      service: this.serviceName,
    })
    logger.debug(`UserData:      ${this.userData.toString('hex')}`, {
      service: this.serviceName,
    })
    logger.debug('[/NPSUserInfo]======================================', {
      service: this.serviceName,
    })
  }
}
