// Mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import logger from '@drazisil/mco-logger'

// WORD  msgNo;    // typically MC_SUCCESS or MC_FAILURE
// WORD  msgReply; // message # being replied to (ex: MC_PURCHASE_STOCK_CAR)
// DWORD result; // specific to the message sent, often the reason for a failure
// DWORD data;   // specific to the message sent (but usually 0)
// DWORD data2;

/**
 * @module GenericReplyMsg
 */

/**
 * @class
 * @property {number} msgNo
 * @property {number} toFrom
 * @property {number} appId
 * @property {number} msgReply
 * @property {Buffer} result
 * @property {Buffer} data
 * @property {Buffer} data2
 */
export class GenericReplyMessage {
  msgNo: number
  toFrom: number
  appId: number
  msgReply: number
  result: Buffer
  data: Buffer
  data2: Buffer
  /**
   *
   */
  constructor() {
    this.msgNo = 0
    this.toFrom = 0
    this.appId = 0
    this.msgReply = 0
    this.result = Buffer.alloc(4)
    this.data = Buffer.alloc(4)
    this.data2 = Buffer.alloc(4)
  }

  /**
   * Setter data
   * @param {Buffer} value
   * @return {void}
   */
  setData(value: Buffer): void {
    this.data = value
  }

  /**
   * Setter data2
   * @param {Buffer} value
   * @return {void}
   */
  setData2(value: Buffer): void {
    this.data2 = value
  }

  /**
   *
   * @param {Buffer} buffer
   * @return {void}
   */
  deserialize(buffer: Buffer): void {
    try {
      this.msgNo = buffer.readInt16LE(0)
    } catch (error) {
      if (error instanceof RangeError) {
        // This is likeley not an MCOTS packet, ignore
      } else {
        throw new TypeError(
          `[GenericReplyMsg] Unable to read msgNo from ${buffer.toString(
            'hex',
          )}: ${error}`,
        )
      }
    }

    this.msgReply = buffer.readInt16LE(2)
    this.result = buffer.slice(4, 8)
    this.data = buffer.slice(8, 12)
    this.data2 = buffer.slice(12)
  }

  /**
   *
   * @return {Buffer}
   */
  serialize(): Buffer {
    const packet = Buffer.alloc(16)
    packet.writeInt16LE(this.msgNo, 0)
    packet.writeInt16LE(this.msgReply, 2)
    this.result.copy(packet, 4)
    this.data.copy(packet, 8)
    this.data2.copy(packet, 12)
    return packet
  }

  /**
   *
   * @param {Buffer} buffer
   * @return {void}
   */
  setResult(buffer: Buffer): void {
    this.result = buffer
  }

  /**
   * DumpPacket
   * @return {void}
   */
  dumpPacket(): void {
    logger.log(
      `GenericReply',
      ${JSON.stringify({
        msgNo: this.msgNo,
        msgReply: this.msgReply,
        result: this.result.toString('hex'),
        data: this.data.toString('hex'),
        tdata2: this.data2.toString('hex'),
      })}`,
      { service: 'mcoserver:GenericReplyMsg' },
    )
  }
}
