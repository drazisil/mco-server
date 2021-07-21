// Mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import logger from '@drazisil/mco-logger'
import { IPersonaRecord } from '../../types'
import { EMessageDirection } from '../MCOTS/message-node'
import { NPSMessage } from '../MCOTS/nps-msg'

/**
 * @module NPSPersonaMapsMsg
 */

/**
 * @typedef InpsPersonaMapsPersonaRecord
 * @property {number} personaCount - uint16
 * @property {number} unknown1 - uint16
 * @property {number} maxPersonas - uint16
 * @property {number} unknown2 - uint16
 * @property {number} id - uint32
 * @property {number} shardId - uint32
 * @property {number} unknown3 - uint16
 * @property {number} unknown4 - uint16
 * @property {number} personaNameLength - uint16
 * @property {string} name - string(16)
 */

/**
 * @typedef InpsPersonaMapsMsgSchema
 * @property {number} msgNo - uint16
 * @property {number} msgLength - uint16
 * @property {number} msgVersion - uint16
 * @property {number} reserved - uint16
 * @property {number} msgChecksum - uint16
 * @property {InpsPersonaMapsPersonaRecord[]} personas
 */

/**
 *
 * @class
 * @extends {NPSMsg}
 * @property {IPersonaRecord[]} personas
 * @property {number} personaSize
 * @property {number} personaCount
 */
export class NPSPersonaMapsMessage extends NPSMessage {
  personas: IPersonaRecord[]
  personaSize: number
  personaCount: number
  /**
   *
   * @param {module:MessageNode.MESSAGE_DIRECTION} direction
   */
  constructor(direction: EMessageDirection) {
    super(direction)

    /** @type {IPersonaRecord[]} */
    this.personas = []
    // Public personaSize = 1296;
    this.personaSize = 38
    this.msgNo = 0x6_07
    this.personaCount = 0
    this.serviceName = 'mcoserver:NPSPersonaMapsMsg'
  }

  /**
   *
   * @param {IPersonaRecord[]} personas
   * @return {void}
   */
  loadMaps(personas: IPersonaRecord[]): void {
    this.personaCount = personas.length
    this.personas = personas
  }

  /**
   *
   * @param {Buffer} buf
   * @return {number}
   * @memberof! NPSPersonaMapsMsg
   */
  deserializeInt8(buf: Buffer): number {
    return buf.readInt8(0)
  }

  /**
   *
   * @param {Buffer} buf
   * @return {number}
   * @memberof! NPSPersonaMapsMsg
   */
  deserializeInt32(buf: Buffer): number {
    return buf.readInt32BE(0)
  }

  /**
   *
   * @param {Buffer} buf
   * @return {string}
   * @memberof! NPSPersonaMapsMsg
   */
  deserializeString(buf: Buffer): string {
    return buf.toString('utf8')
  }

  /**
   *
   * @return {Buffer}
   */
  serialize(): Buffer {
    let index = 0
    // Create the packet content
    // const packetContent = Buffer.alloc(40);
    const packetContent = Buffer.alloc(this.personaSize * this.personaCount)

    for (const persona of this.personas) {
      // This is the persona count
      packetContent.writeInt16BE(
        this.personaCount,
        this.personaSize * index + 0,
      )

      // This is the max persona count (confirmed - debug)
      packetContent.writeInt8(
        this.deserializeInt8(persona.maxPersonas),
        this.personaSize * index + 5,
      )

      // PersonaId
      packetContent.writeUInt32BE(
        this.deserializeInt32(persona.id),
        this.personaSize * index + 8,
      )

      // Shard ID
      // packetContent.writeInt32BE(this.shardId, 1281);
      packetContent.writeInt32BE(
        this.deserializeInt32(persona.shardId),
        this.personaSize * index + 12,
      )

      // Length of Persona Name
      packetContent.writeInt16BE(
        persona.name.length,
        this.personaSize * index + 20,
      )

      // Persona Name = 30-bit null terminated string
      packetContent.write(
        this.deserializeString(persona.name),
        this.personaSize * index + 22,
      )
      index++
    }

    // Build the packet
    return packetContent
  }

  /**
   *
   * @return {void}
   */
  dumpPacket(): void {
    this.dumpPacketHeader('NPSPersonaMapsMsg')
    logger.debug(`personaCount:        ${this.personaCount}`, {
      service: this.serviceName,
    })
    for (const persona of this.personas) {
      logger.debug(
        `maxPersonaCount:     ${this.deserializeInt8(persona.maxPersonas)}`,
        { service: this.serviceName },
      )
      logger.debug(
        `id:                  ${this.deserializeInt32(persona.id)}`,
        {
          service: this.serviceName,
        },
      )
      logger.debug(
        `shardId:             ${this.deserializeInt32(persona.shardId)}`,
        {
          service: this.serviceName,
        },
      )
      logger.debug(
        `name:                ${this.deserializeString(persona.name)}`,
        {
          service: this.serviceName,
        },
      )
    }

    logger.debug(`Packet as hex:       ${this.getPacketAsString()}`, {
      service: this.serviceName,
    })

    // TODO: Work on this more

    logger.debug('[/NPSPersonaMapsMsg]======================================', {
      service: this.serviceName,
    })
  }
}
