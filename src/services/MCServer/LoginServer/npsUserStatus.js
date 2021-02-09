// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

const debug = require('debug')('mcoserver:npsUserStatus')
const {logger} = require('../../../shared/logger')
const crypto = require('crypto')
const fs = require('fs')
const { NPSMsg, INPSMsgJSON } = require('../MCOTS/NPSMsg')
const { Socket } = require('net')
const { IServerConfig} = require('../../../../config/app-settings')

/**
 * Load the RSA private key
 *
 * @param {string} privateKeyPath
 * @return {string}
 */
function fetchPrivateKeyFromFile (privateKeyPath) {
  try {
    fs.statSync(privateKeyPath)
  } catch (e) {
    throw new Error(`[npsUserStatus] Error loading private key: ${e}`)
  }
  return fs.readFileSync(privateKeyPath).toString()
}

/**
 * Structure the raw packet into a login packet structure
 * @param {Socket} socket
 * @param {Buffer} packet
 * @return {LoginPacket}
 */

/**
 *
 * @extends {NPSMsg}
 */
class NPSUserStatus extends NPSMsg {
  /**
   *
   * @param {Buffer} packet
   */
  constructor (packet) {
    super('Recieved')
    this.logger = logger.child({ service: 'mcoserver:NPSUserStatus' })
    this.sessionKey = ''

    // Save the NPS opCode
    this.opCode = packet.readInt16LE(0)

    // Save the contextId
    this.contextId = packet.slice(14, 48).toString()

    // Save the raw packet
    this.buffer = packet

    return this
  }

  /**
   * extractSessionKeyFromPacket
   *
   * Take 128 bytes
   * They are the utf-8 of the hex bytes that are the key
   *
   * @param {IServerConfig} serverConfig
   * @param {Buffer} packet
   */
  extractSessionKeyFromPacket (serverConfig, packet) {
    // Decrypt the sessionKey
    const privateKey = fetchPrivateKeyFromFile(serverConfig.privateKeyFilename)

    const sessionKeyStr = Buffer.from(
      packet.slice(52, -10).toString('utf8'),
      'hex'
    )
    const decrypted = crypto.privateDecrypt(privateKey, sessionKeyStr)
    this.sessionKey = decrypted.slice(2, -4).toString('hex')
  }

  /**
   *
   * @return {INPSMsgJSON}
   */
  toJSON () {
    return {
      msgNo: this.msgNo,
      msgLength: this.msgLength,
      msgVersion: this.msgVersion,
      content: this.content.toString('hex'),
      direction: this.direction,
      opCode: this.opCode,
      contextId: this.contextId,
      sessionKey: this.sessionKey,
      rawBuffer: this.buffer.toString('hex')
    }
  }

  /**
   *
   */
  dumpPacket () {
    this.dumpPacketHeader('NPSUserStatus')
    debug(
      'NPSUserStatus',
      {
        contextId: this.contextId,
        sessionKey: this.sessionKey
      }
    )
  }
}

module.exports = {
  fetchPrivateKeyFromFile,
  NPSUserStatus
}
