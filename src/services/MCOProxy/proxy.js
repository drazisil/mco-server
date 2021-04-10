// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

const { Server: HTTPServer } = require("http");
const { Server: SSLServer } = require("https");
const { Server: TCPServer } = require("net");

/**
 * @module MCOProxy
 */

/**
 * @typedef {'ssl' | 'http' | 'tcp'} ProtocolType
 */

/**
 * @typedef {HTTPServer | SSLServer | TCPServer} SubServer
 */

/**
 * @typedef IProxyListenerRequest
 * @property {number} port
 * @property {ProtocolType} protocol
 */

/**
 * @typedef IProxyListenerRecord
 * @property {number} port
 * @property {SubServer} server
 * @property {ProtocolType} protocol
 */

/** @type {IProxyListenerRequest[]} */
const serverRequests = [
    {
        port: 80,
        protocol: 'http'
    },
    {
        port: 443,
        protocol: 'ssl'
    },
    {
        port: 8228,
        protocol: 'tcp'
    }
]

/**
 * @class
 * @property {IProxyListenerRecord[]} activeListeners
 */
class MCOProxy {
    /** @type {IProxyListenerRecord[]} */
    activeListeners = []

    /**
     * 
     * @param {IProxyListenerRequest[]} recordRequests 
     */
    static async new(recordRequests) {
        const self = new MCOProxy()

        recordRequests.forEach((request) => {
            /** @type {SubServer} */
            let serverType
            switch (request.protocol) {
                case 'http':
                    serverType = new HTTPServer()
                    break;
                case 'ssl':
                    serverType = new SSLServer()
                    break;
                case 'tcp':
                    serverType = new TCPServer()
                    break;
                default:
                    throw new Error(`Unsupported server type: ${request.protocol}`)
            }
            self.activeListeners.push({
                port: request.port,
                protocol: request.protocol,
                server: serverType
            })
        })
        return self
    }
}
module.exports.MCOProxy = MCOProxy
