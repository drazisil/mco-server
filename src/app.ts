/*
 Mco-server is a game server, written from scratch, for an old game
 Copyright (C) <2017-2018>  <Joseph W Becher>
 This Source Code Form is subject to the terms of the Mozilla Public
 License, v. 2.0. If a copy of the MPL was not distributed with this
 file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

import logger from '@drazisil/mco-logger'
import { MCOServer } from './MCOServer'
import { AuthLogin } from './services/@drazisil/mco-auth'
import { PatchServer } from './services/@drazisil/mco-patch'
import { RoutingServer } from './services/@drazisil/mco-route'
import { ShardServer } from './services/@drazisil/mco-shard'
import { PersonaServer } from './services/PersonaServer/persona-server'
import { DatabaseManager } from './services/shared/database-manager'

// What servers do we need?
// * Routing Server
RoutingServer.getInstance().start()
// * Patch Server
// PatchServer.getInstance().start()
// * AuthLogin
AuthLogin.getInstance().start()
// * Shard
// ShardServer.getInstance().start()
// * Persona
//   Persona needs connections to
//   *
// * Lobby Login
// * Lobby
// * MCOTS

// // Database manager
// const databaseManager = DatabaseManager.getInstance()

// // MCOS Monolith
// const server = new MCOServer()

// // MCOS PatchAndShard
// const patchAndShardServer = PatchAndShardServer.getInstance()

// // MCOS AuthLogin and Shard
// const authLogin = new AuthLogin()

// Promise.all([server.start(), patchAndShardServer.start(), authLogin.start()])
//   .then(() => {
//     logger.log('All servers started successfully')
//   })
//   .catch(error => {
//     process.exitCode = -1
//     throw new Error(`There was an error starting the server: ${error}`)
//   })
