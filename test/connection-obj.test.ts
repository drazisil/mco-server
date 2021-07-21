// Mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { Socket as fakeSocket } from 'net'
import { ConnectionManager as fakeConnectionManager } from '../src/services/MCServer/connection-mgr'
import { TCPConnection } from '../src/services/MCServer/tcpConnection'

jest.mock('../src/services/MCServer/connection-mgr')
jest.mock('net')

it('ConnectionObj', () => {
  const testConnection = new TCPConnection(
    'abc',
    new fakeSocket(),
    fakeConnectionManager.getInstance(),
  )

  expect(testConnection.status).toEqual('Inactive')
  expect(testConnection.isSetupComplete).toBeFalsy()
  testConnection.setEncryptionKey(Buffer.from('abc123', 'hex'))
  expect(testConnection.isSetupComplete).toBeTruthy()
})

describe('ConnectionObj cross-comms', () => {
  /** @type {ConnectionObj} */
  let testConn1: TCPConnection
  /** @type {ConnectionObj} */
  let testConn2: TCPConnection

  beforeEach(() => {
    testConn1 = new TCPConnection(
      'def',
      new fakeSocket(),
      fakeConnectionManager.getInstance(),
    )
    testConn2 = new TCPConnection(
      'ghi',
      new fakeSocket(),
      fakeConnectionManager.getInstance(),
    )
    testConn1.setEncryptionKey(Buffer.from('abc123', 'hex'))
    testConn2.setEncryptionKey(Buffer.from('abc123', 'hex'))
  })

  const plainText1 = Buffer.from(
    "I'm a very a secret message. Please don't decode me!",
  )
  const cipherText1 = Buffer.from([
    0x71, 0xf2, 0xae, 0x29, 0x91, 0x8d, 0xba, 0x3d, 0x5e, 0x6c, 0x31, 0xb0,
    0x3a, 0x58, 0x82, 0xa3, 0xdd, 0xb9, 0xec, 0x5d, 0x3e, 0x82, 0xd4, 0x4f,
    0xc0, 0xe5, 0xe5, 0x39, 0x03, 0xba, 0x1c, 0x19, 0xc4, 0x16, 0x03, 0x68,
    0xff, 0xc9, 0x6f, 0x72, 0xe4, 0x94, 0x27, 0x40, 0x46, 0x47, 0x56, 0xf0,
    0x79, 0x70, 0xbf, 0x45,
  ])

  it('Connection one is not the same id as connection two', () => {
    console.log(1, testConn1.enc.getId())
    console.log(2, testConn2.enc.getId())
    expect(testConn1.enc.getId()).not.toStrictEqual(testConn2.enc.getId())
  })

  it('Connection Two can decipher Connection One', () => {
    expect(testConn1.enc).not.toBeNull()
    const encipheredBuffer = testConn1.enc.encrypt(plainText1)
    expect(encipheredBuffer).toStrictEqual(cipherText1)
    expect(testConn2.enc).not.toBeNull()
    expect(testConn1.enc.decrypt(encipheredBuffer)).toStrictEqual(plainText1)
    expect(testConn2.enc.decrypt(encipheredBuffer)).toStrictEqual(plainText1)

    // Try again
    const encipheredBuffer2 = testConn1.enc.encrypt(plainText1)
    expect(testConn1.enc.decrypt(encipheredBuffer2)).toStrictEqual(plainText1)
    expect(testConn2.enc.decrypt(encipheredBuffer2)).toStrictEqual(plainText1)

    // And again
    const encipheredBuffer3 = testConn1.enc.encrypt(plainText1)
    expect(testConn1.enc.decrypt(encipheredBuffer3)).toStrictEqual(plainText1)
    expect(testConn2.enc.decrypt(encipheredBuffer3)).toStrictEqual(plainText1)
  })
})
