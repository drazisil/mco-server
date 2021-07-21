// Mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { expect, it } from '@jest/globals'
import { Socket } from 'net'
import { ConnectionManager } from '../src/services/MCServer/connection-mgr'
import { ListenerThread } from '../src/services/MCServer/listener-thread'

class FakeSocket extends Socket {
  localPort: number
  remoteAddress: string | undefined

  constructor() {
    super()
    this.localPort = 7003
    delete this.remoteAddress
  }
}

const fakeSocket = new FakeSocket()

it('ListenerThread - _onData', async () => {
  const listenerThread = new ListenerThread()

  const fakeConnection1 = ConnectionManager.getInstance().newConnection(
    'test_connction_1',
    fakeSocket,
  )
  fakeConnection1.remoteAddress = '0.0.0.0'

  expect(fakeConnection1.remoteAddress).toEqual('0.0.0.0')

  try {
    await listenerThread._onData(Buffer.alloc(5), fakeConnection1)
  } catch (error) {
    expect(error.message).not.toEqual('Remote address is empty')
  }

  const fakeConnection3 = ConnectionManager.getInstance().newConnection(
    'test_connction_3',
    fakeSocket,
  )
  fakeConnection3.sock = fakeSocket
  fakeConnection3.mgr = ConnectionManager.getInstance()
  fakeConnection3.remoteAddress = undefined

  expect(fakeConnection3.remoteAddress).toEqual(undefined)

  try {
    await listenerThread._onData(Buffer.alloc(5), fakeConnection3)
  } catch (error) {
    expect(error.message).toContain('Unable to locate name for opCode 0')
  }
})
