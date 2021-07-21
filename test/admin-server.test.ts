// Mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { expect, test, jest } from '@jest/globals'
import { AdminServer } from '../src/services/AdminServer/index'
import { MCServer as fakeMCServer } from '../src/services/MCServer/index'
jest.mock('../src/services/MCServer/index')

test('AdminServer', () => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _ = new AdminServer(fakeMCServer.getInstance())
    expect(true).toBeTruthy()
  } catch (error) {
    expect(error).toBeFalsy()
  }
})
