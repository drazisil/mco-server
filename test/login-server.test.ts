// Mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { expect, it } from '@jest/globals'
import { LoginServer } from '../src/services/LoginServer/index'

const loginServer = new LoginServer()

it('LoginServer', async () => {
  const { customerId, userId } = await loginServer._npsGetCustomerIdByContextId(
    'd316cd2dd6bf870893dfbaaf17f965884e',
  )
  expect(customerId).toEqual(5_551_212)
  expect(userId).toEqual(1)
})

it('LoginServer', async () => {
  const { customerId, userId } = await loginServer._npsGetCustomerIdByContextId(
    '5213dee3a6bcdb133373b2d4f3b9962758',
  )
  expect(customerId).toEqual(2_885_746_688)
  expect(userId).toEqual(2)
})
