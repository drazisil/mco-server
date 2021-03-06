// Mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { expect, it } from '@jest/globals'
import { premadeLogin } from '../src/services/LoginServer/packet'

it('LoginServer - Packet', () => {
  const packet = premadeLogin()
  expect(Buffer.isBuffer(packet)).toBeTruthy()
})
