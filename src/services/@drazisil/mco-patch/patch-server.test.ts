// Mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { expect, describe, it, beforeEach } from '@jest/globals'
import request from 'supertest'
import { CastanetResponse, PatchServer } from '.'

let patchServer: PatchServer

describe('PatchServer', () => {
  beforeEach(() => {
    patchServer = PatchServer.getInstance()
  })

  it('PatchServer', () => {
    expect(CastanetResponse.body.toString('hex')).toStrictEqual(
      'cafebeef00000000000003',
    )
    // expect(patchServer._patchUpdateInfo().body.toString('hex')).toStrictEqual(
    //   'cafebeef00000000000003',
    // )
    // expect(patchServer._patchNPS().body.toString('hex')).toStrictEqual(
    //   'cafebeef00000000000003',
    // )
    // expect(patchServer._patchMCO().body.toString('hex')).toStrictEqual(
    //   'cafebeef00000000000003',
    // )
    // expect(patchServer._generateShardList()).toContain('The Clocktower')
    // expect(patchServer._getBans()).toStrictEqual([])
  })

  // it('PatchServer - Shardlist', () => {
  //   request(patchServer._server)
  //     .get('/ShardList/')
  //     .then(
  //       response => {
  //         expect(response.text).toContain('[The Clocktower]')
  //       },
  //       error => {
  //         console.error(`Error: ${error}`)
  //       },
  //     )
  // })

  it('PatchServer - UpdateInfo', () => {
    request(patchServer._server)
      .get('/games/EA_Seattle/MotorCity/UpdateInfo')
      .then(response => {
        expect(response.body).toStrictEqual(CastanetResponse.body)
      })
      .catch(error => {
        console.error(error)
      })
  })

  it('PatchServer - NPS', () => {
    request(patchServer._server)
      .get('/games/EA_Seattle/MotorCity/NPS')
      .then(response => {
        expect(response.body).toStrictEqual(CastanetResponse.body)
      })
      .catch(error => {
        console.error(error)
      })
  })

  it('PatchServer - MCO', done => {
    request(patchServer._server)
      .get('/games/EA_Seattle/MotorCity/MCO')
      .then(response => {
        expect(response.body).toStrictEqual(CastanetResponse.body)
        done()
      })
      .catch(error => {
        console.error(error)
      })
  })
})
