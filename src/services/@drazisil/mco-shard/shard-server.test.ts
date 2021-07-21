// Mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { expect, describe, it, beforeEach } from '@jest/globals'
import request from 'supertest'
import { ShardServer } from '.'

let shardServer: ShardServer

describe('ShardServer', () => {
  beforeEach(() => {
    shardServer = ShardServer.getInstance()
  })

  it('should return a shard list', () => {
    request(shardServer._server)
      .get('/ShardList/')
      .then(
        response => {
          expect(response.text).toContain('[The Clocktower]')
        },
        error => {
          console.error(`Error: ${error}`)
        },
      )
  })
})
