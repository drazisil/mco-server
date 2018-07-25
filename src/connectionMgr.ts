// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

import { Socket } from "net";
import { Connection } from "./Connection";
import { IRawPacket } from "./listenerThread";
import { logger } from "./logger";
import { loginDataHandler } from "./LoginServer";
import { personaDataHandler } from "./PersonaServer";
import { defaultHandler } from "./TCPManager";

export default class ConnectionMgr {
  private connections: Connection[];
  private newConnectionId: number;
  constructor() {
    this.connections = [];
    this.newConnectionId = 1;
    return this;
  }

  /**
   * Locate connection by remoteAddress and localPort in the connections array
   * @param {String} connectionId
   */
  public findConnectionByAddressAndPort(
    remoteAddress: string,
    localPort: number
  ) {
    const results = this.connections.find(connection => {
      const match =
        remoteAddress === connection.remoteAddress &&
        localPort === connection.localPort;
      return match;
    });
    return results;
  }

  /**
   * Locate connection by id in the connections array
   * @param {String} connectionId
   */
  public findConnectionById(connectionId: number) {
    const results = this.connections.find(connection => {
      const match = connectionId === connection.id;
      return match;
    });
    return results;
  }

  /**
   * Deletes the provided connection id from the connections array
   * FIXME: Doesn't actually seem to work
   * @param {String} connectionId
   */
  public deleteConnection(connection: Connection) {
    this.connections = this.connections.filter(
      conn =>
        conn.id !== connection.id && conn.localPort !== connection.localPort
    );
  }
  public updateConnectionByAddressAndPort(remoteAddress: string, localPort: number, newConnection: Connection) {
    if (newConnection === undefined) {
      throw new Error("Undefined connection");
    }
    const index = this.connections.findIndex(
      connection => {
        return (connection.remoteAddress === remoteAddress) && (connection.localPort === localPort)
      }
    );
    this.connections.splice(index, 1);
    this.connections.push(newConnection);
  }

  /**
   * Create new connection if when haven't seen this socket before,
   * or update the socket on the connection object if we have.
   * @param {String} id
   * @param {Socket} socket
   */
  public findOrNewConnection(socket: Socket, localPort: number) {
    const { remoteAddress } = socket;
    const con = this.findConnectionByAddressAndPort(remoteAddress, localPort);
    if (con !== undefined) {
      logger.info(
        `[connectionMgr] I have seen connections from ${remoteAddress} on ${localPort} before`
      );
      con.sock = socket;
      return con;
    }

    const connectionManager = this;
    const newConnection = new Connection(
      this.newConnectionId,
      socket,
      connectionManager
    );
    logger.info(
      `[connectionMgr] I have not seen connections from ${remoteAddress} on ${localPort} before, adding it.`
    );
    this.connections.push(newConnection);

    console.log(this.dumpConnections().map((connection => {
      return {
        id: connection.id,
        localPort: connection.localPort,
        remoteAddress: connection.remoteAddress,
        remotePort: connection.remotePort
      }
    })))

    return newConnection;
  }

  /**
   * Dump all connections for debugging
   */
  public dumpConnections() {
    return this.connections;
  }
}

interface IPortHandler {
  handler: () => void;
  port: number;
}

/**
 * Check incoming data and route it to the correct handler based on localPort
 * @param {String} id
 * @param {Buffer} data
 */
export async function processData(rawPacket: IRawPacket) {
  const { remoteAddress, localPort, data } = rawPacket;

  switch (localPort) {
    case 8226:
      return loginDataHandler(rawPacket);
    case 8228:
      return personaDataHandler(rawPacket);
    case 7003:
      return defaultHandler(rawPacket);
    case 43300:
      return defaultHandler(rawPacket);
    default:
      logger.error(
        `[connectionMgr] No known handler for localPort ${localPort}, unable to handle the request from ${remoteAddress} on localPort ${localPort}, aborting.`
      );
      logger.info("[connectionMgr] Data was: ", data.toString("hex"));
      process.exit(1);
      return null;
  }
}
