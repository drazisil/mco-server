// Mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import logger from '@drazisil/mco-logger'
import { Socket } from 'net'
import { NPS_COMMANDS } from '../../structures'
import { IRawPacket } from '../../types'
import { EMessageDirection, MessageNode } from '../MCOTS/message-node'
import { defaultHandler } from '../MCOTS/tcp-manager'
import { DatabaseManager } from '../shared/database-manager'
import { NPSPacketManager } from './nps-packet-manager'
import { TCPConnection } from './tcpConnection'

export class ConnectionManager {
  static _instance: ConnectionManager
  databaseMgr = DatabaseManager.getInstance()
  connections: TCPConnection[]
  newConnectionId: number
  banList: string[]
  serviceName: string

  public static getInstance(): ConnectionManager {
    if (!ConnectionManager._instance) {
      ConnectionManager._instance = new ConnectionManager()
    }
    return ConnectionManager._instance
  }

  private constructor() {
    this.databaseMgr = DatabaseManager.getInstance()
    /**
     * @type {module:ConnectionObj[]}
     */
    this.connections = []
    this.newConnectionId = 1
    /**
     * @type {string[]}
     */
    this.banList = []
    this.serviceName = 'mcoserver:ConnectionMgr'
  }

  newConnection(connectionId: string, socket: Socket): TCPConnection {
    return new TCPConnection(connectionId, socket, this)
  }

  /**
   * Check incoming data and route it to the correct handler based on localPort
   * @param {IRawPacket} rawPacket
   * @return {Promise} {@link module:ConnectionObj~ConnectionObj}
   */
  async processData(rawPacket: IRawPacket): Promise<TCPConnection> {
    const npsPacketManager = new NPSPacketManager()

    const { remoteAddress, localPort, data } = rawPacket

    // Log the packet as debug
    logger.debug(
      `logging raw packet,
      ${JSON.stringify({
        remoteAddress,
        localPort,
        data: data.toString('hex'),
      })}`,
      { service: this.serviceName },
    )

    switch (localPort) {
      case 8226:
      case 8228:
      case 7003: {
        logger.debug(
          `Recieved NPS packet,
          ${JSON.stringify({
            opCode: rawPacket.data.readInt16BE(0),
            msgName1: npsPacketManager.msgCodetoName(
              rawPacket.data.readInt16BE(0),
            ),
            msgName2: this.getNameFromOpCode(rawPacket.data.readInt16BE(0)),
            localPort,
          })}`,
          { service: this.serviceName },
        )
        try {
          return await npsPacketManager.processNPSPacket(rawPacket)
        } catch (error) {
          throw new Error(`Error in connectionMgr::processData ${error}`)
        }
      }

      case 43_300: {
        logger.debug(
          'Recieved MCOTS packet',
          { service: this.serviceName },
          // {
          //   opCode: rawPacket.data.readInt16BE(0),
          //   msgName: `${npsPacketManager.msgCodetoName(
          //     rawPacket.data.readInt16BE(0)
          //   )} / ${this.getNameFromOpCode(rawPacket.data.readInt16BE(0))}`,
          //   localPort
          // }
        )
        const newNode = new MessageNode(EMessageDirection.RECEIVED)
        newNode.deserialize(rawPacket.data)
        logger.debug(JSON.stringify(newNode), { service: this.serviceName })

        return defaultHandler(rawPacket)
      }

      default:
        logger.debug(JSON.stringify(rawPacket), { service: this.serviceName })
        throw new Error(
          `We received a packet on port ${localPort}. We don't what to do yet, going to throw so the message isn't lost.`,
        )
    }
  }

  /**
   * Get the name connected to the NPS opcode
   * @param {number} opCode
   * @return {string}
   */
  getNameFromOpCode(opCode: number): string {
    const opCodeName = NPS_COMMANDS.find(code => code.value === opCode)
    if (opCodeName === undefined) {
      throw new Error(`Unable to locate name for opCode ${opCode}`)
    }

    return opCodeName.name
  }

  /**
   * Get the name connected to the NPS opcode
   * @param {string} name
   * @return {number}
   */
  getOpcodeFromName(name: string): number {
    const opCode = NPS_COMMANDS.find(code => code.name === name)
    if (opCode === undefined) {
      throw new Error(`Unable to locate opcode for name ${name}`)
    }

    return opCode.value
  }

  /**
   *
   * @return {string[]}
   */
  getBans(): string[] {
    return this.banList
  }

  /**
   * Locate connection by remoteAddress and localPort in the connections array
   * @param {string} remoteAddress
   * @param {number} localPort
   * @memberof ConnectionMgr
   * @return {module:ConnectionObj}
   */
  findConnectionByAddressAndPort(
    remoteAddress: string,
    localPort: number,
  ): TCPConnection | undefined {
    return this.connections.find(connection => {
      const match =
        remoteAddress === connection.remoteAddress &&
        localPort === connection.localPort
      return match
    })
  }

  /**
   * Locate connection by id in the connections array
   * @param {string} connectionId
   * @return {module:ConnectionObj}
   */
  findConnectionById(connectionId: string): TCPConnection {
    const results = this.connections.find(
      connection => connectionId === connection.id,
    )
    if (results === undefined) {
      throw new Error(`Unable to locate connection for id ${connectionId}`)
    }

    return results
  }

  /**
   *
   * @param {string} address
   * @param {number} port
   * @param {module:ConnectionObj} newConnection
   * @return {Promise<void>}
   */
  async _updateConnectionByAddressAndPort(
    address: string,
    port: number,
    newConnection: TCPConnection,
  ): Promise<void> {
    if (newConnection === undefined) {
      throw new Error(
        `Undefined connection: ${JSON.stringify({
          remoteAddress: address,
          localPort: port,
        })}`,
      )
    }

    try {
      const index = this.connections.findIndex(
        connection =>
          connection.remoteAddress === address && connection.localPort === port,
      )
      this.connections.splice(index, 1)
      this.connections.push(newConnection)
    } catch (error) {
      process.exitCode = -1
      throw new Error(
        `Error updating connection, ${JSON.stringify({
          error,
          connections: this.connections,
        })}`,
      )
    }
  }

  /**
   * Return an existing connection, or a new one
   *
   * @param {module:net.Socket} socket
   * @return {module:ConnectionObj}
   */
  findOrNewConnection(socket: Socket): TCPConnection {
    const { remoteAddress, localPort } = socket
    if (!remoteAddress) {
      throw new Error(
        `No address in socket: ${JSON.stringify({
          remoteAddress,
          localPort,
        })}`,
      )
    }

    const con = this.findConnectionByAddressAndPort(remoteAddress, localPort)
    if (con !== undefined) {
      logger.log(
        `[connectionMgr] I have seen connections from ${remoteAddress} on ${localPort} before`,
        { service: this.serviceName },
      )
      con.sock = socket
      return con
    }

    const newConnection = this.newConnection(
      `${Date.now().toString()}_${this.newConnectionId}`,
      socket,
    )
    logger.log(
      `[connectionMgr] I have not seen connections from ${remoteAddress} on ${localPort} before, adding it.`,
      { service: this.serviceName },
    )
    this.connections.push(newConnection)
    return newConnection
  }

  /**
   *
   * @return {void}
   */
  resetAllQueueState(): void {
    this.connections = this.connections.map(connection => {
      connection.inQueue = true
      return connection
    })
  }

  /**
   * Dump all connections for debugging
   *
   * @return {module:ConnectionObj[]}
   */
  dumpConnections(): TCPConnection[] {
    return this.connections
  }
}
