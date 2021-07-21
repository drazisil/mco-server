// Mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { Cipher, createCipheriv, createDecipheriv, Decipher } from 'crypto'
import { Socket } from 'net'
import { ConnectionManager } from './connection-mgr'
import { EncryptionManager } from './encryption-mgr'

/**
 * Contains the proporties and methods for a TCP connection
 * @module ConnectionObj
 */

/**
 * @typedef {'Active' | 'Inactive'} ConnectionStatus
 */

/**
 * @typedef LobbyCiphers
 * @property { crypto.Cipher | null } cipher
 * @property { crypto.Decipher | null} decipher
 */

/**
 * @class
 * @property {string} id
 * @property {number} appId
 * @property {ConnectionStatus} status
 * @property {string} remoteAddress
 * @property {string} localPort
 * @property {import("net").Socket} sock
 * @property {null} msgEvent
 * @property {number} lastMsg
 * @property {boolean} useEncryption
 * @property {LobbyCiphers} encLobby
 * @property {EncryptionManager} enc
 * @property {boolean} isSetupComplete
 * @property {module:ConnectionMgr.ConnectionMgr} mgr
 * @property {boolean} inQueue
 * @property {Buffer} decryptedCmd
 * @property {Buffer} encryptedCmd
 */
export class TCPConnection {
  id: string
  appId: number
  status: string
  remoteAddress: string | undefined
  localPort: number
  sock: Socket
  msgEvent: null
  lastMsg: number
  useEncryption: boolean
  encLobby: { cipher: Cipher | undefined; decipher: Decipher | undefined }
  enc: EncryptionManager
  isSetupComplete: boolean
  mgr: ConnectionManager
  inQueue: boolean
  decryptedCmd: Buffer
  encryptedCmd: Buffer
  /**
   *
   * @param {string} connectionId
   * @param {import("net").Socket} sock
   * @param {module:ConnectionMgr.ConnectionMgr} mgr
   */
  constructor(connectionId: string, sock: Socket, mgr: ConnectionManager) {
    this.id = connectionId
    this.appId = 0
    /**
     * @type {ConnectionStatus}
     */
    this.status = 'Inactive'
    this.remoteAddress = sock.remoteAddress
    this.localPort = sock.localPort
    this.sock = sock
    this.msgEvent = null
    this.lastMsg = 0
    this.useEncryption = false
    /** @type {LobbyCiphers} */
    this.encLobby = {
      cipher: undefined,
      decipher: undefined,
    }
    this.enc = new EncryptionManager()
    this.isSetupComplete = false
    this.mgr = mgr
    this.inQueue = true
    this.decryptedCmd = Buffer.alloc(0)
    this.encryptedCmd = Buffer.alloc(0)
  }

  /**
   *
   * @param {Buffer} key
   * @return {void}
   */
  setEncryptionKey(key: Buffer): void {
    this.isSetupComplete = this.enc.setEncryptionKey(key)
  }

  /**
   * SetEncryptionKeyDES
   *
   * @param {string} skey
   * @return {void}
   */
  setEncryptionKeyDES(skey: string): void {
    // Deepcode ignore HardcodedSecret: This uses an empty IV
    const desIV = Buffer.alloc(8)

    try {
      this.encLobby.cipher = createCipheriv(
        'des-cbc',
        Buffer.from(skey, 'hex'),
        desIV,
      )
      this.encLobby.cipher.setAutoPadding(false)
    } catch (error) {
      throw new Error(`Error setting cipher: ${error}`)
    }

    try {
      this.encLobby.decipher = createDecipheriv(
        'des-cbc',
        Buffer.from(skey, 'hex'),
        desIV,
      )
      this.encLobby.decipher.setAutoPadding(false)
    } catch (error) {
      throw new Error(`Error setting decipher: ${error}`)
    }

    this.isSetupComplete = true
  }

  /**
   * CipherBufferDES
   *
   * @param {Buffer} messageBuffer
   * @return {Buffer}
   */
  cipherBufferDES(messageBuffer: Buffer): Buffer {
    if (this.encLobby.cipher) {
      return this.encLobby.cipher.update(messageBuffer)
    }

    throw new Error('No DES cipher set on connection')
  }

  /**
   * DecipherBufferDES
   *
   * @param {Buffer} messageBuffer
   * @return {Buffer}
   */
  decipherBufferDES(messageBuffer: Buffer): Buffer {
    if (this.encLobby.decipher) {
      return this.encLobby.decipher.update(messageBuffer)
    }

    throw new Error('No DES decipher set on connection')
  }
}
