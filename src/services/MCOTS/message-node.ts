// Mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import logger from '@drazisil/mco-logger'

/**
 * Packet structure for communications with the game database
 * @module MessageNode
 */

/**
 * @typedef {'RECEIVED' | 'SENT'} MESSAGE_DIRECTION
 *
 */
export enum EMessageDirection {
  RECEIVED = 'received',
  SENT = 'sent',
}

/**
 * @class
 * @property {MESSAGE_DIRECTION} direction
 * @property {number} msgNo
 * @property {number} seq
 * @property {Buffer} data
 * @property {number} dataLength
 * @property {string} mcoSig
 * @property {number} toFrom
 * @property {number} appId
 */
export class MessageNode {
  direction: EMessageDirection
  msgNo: number
  seq: number
  flags: number
  data: Buffer
  dataLength: number
  mcoSig: string
  toFrom: number
  appId: number
  /**
   *
   * @param {MESSAGE_DIRECTION} direction
   */
  constructor(direction: EMessageDirection) {
    this.direction = direction
    this.msgNo = 0
    this.seq = 999
    this.flags = 0
    this.data = Buffer.alloc(0)
    this.dataLength = 0
    this.mcoSig = 'NotAValue'

    this.toFrom = 0
    this.appId = 0
  }

  /**
   *
   * @param {Buffer} packet
   * @return {void}
   */
  deserialize(packet: Buffer): void {
    try {
      this.dataLength = packet.readInt16LE(0)
      this.mcoSig = packet.slice(2, 6).toString()
      this.seq = packet.readInt16LE(6)
      this.flags = packet.readInt8(10)

      // Data starts at offset 11
      this.data = packet.slice(11)

      // Set message number

      this.msgNo = this.data.readInt16LE(0)
    } catch (error) {
      if (error.name.includes('RangeError')) {
        // This is likeley not an MCOTS packet, ignore
        throw new Error(
          `[MessageNode] Not long enough to deserialize, only ${packet.length} bytes long`,
        )
      } else {
        throw new Error(
          `[MessageNode] Unable to read msgNo from ${packet.toString(
            'hex',
          )}: ${error}`,
        )
      }
    }
  }

  /**
   *
   * @return {Buffer}
   */
  serialize(): Buffer {
    const packet = Buffer.alloc(this.dataLength + 2)
    packet.writeInt16LE(this.dataLength, 0)
    packet.write(this.mcoSig, 2)
    packet.writeInt16LE(this.seq, 6)
    packet.writeInt8(this.flags, 10)
    this.data.copy(packet, 11)
    return packet
  }

  /**
   *
   * @param {number} appId
   * @return {void}
   */
  setAppId(appId: number): void {
    this.appId = appId
  }

  /**
   *
   * @param {number} newMsgNo
   * @return {void}
   */
  setMsgNo(newMessageNo: number): void {
    this.msgNo = newMessageNo
    this.data.writeInt16LE(this.msgNo, 0)
  }

  /**
   *
   * @param {number} newSeq
   * @return {void}
   */
  setSeq(newSeq: number): void {
    this.seq = newSeq
  }

  /**
   *
   * @param {Buffer} packet
   * @return {void}
   */
  setMsgHeader(packet: Buffer): void {
    const header = Buffer.alloc(6)
    packet.copy(header, 0, 0, 6)
  }

  /**
   *
   * @param {Buffer} buffer
   * @return {void}
   */
  updateBuffer(buffer: Buffer): void {
    this.data = Buffer.from(buffer)
    this.dataLength = 10 + buffer.length
    this.msgNo = this.data.readInt16LE(0)
  }

  /**
   *
   * @return {boolean}
   */
  isMCOTS(): boolean {
    return this.mcoSig === 'TOMC'
  }

  /**
   *
   * @return {void}
   */
  dumpPacket(): void {
    let packetContentsArray = this.serialize().toString('hex').match(/../g)
    if (packetContentsArray === null) {
      packetContentsArray = []
    }

    logger.log(
      `Message ${JSON.stringify({
        dataLength: this.dataLength,
        isMCOTS: this.isMCOTS(),
        msgNo: this.msgNo,
        direction: this.direction,
        seq: this.seq,
        flags: this.flags,
        toFrom: this.toFrom,
        appId: this.appId,
        packetContents: packetContentsArray.join('') || '',
      })}`,
      { service: 'mcoserver:MessageNode', level: 'debug' },
    )
  }

  /**
   *
   * @return {number}
   */
  getLength(): number {
    return this.dataLength
  }

  /**
   *
   * @param {Buffer} packet
   * @return {void}
   */
  BaseMsgHeader(packet: Buffer): void {
    // WORD msgNo;
    this.msgNo = packet.readInt16LE(0)
  }
}
