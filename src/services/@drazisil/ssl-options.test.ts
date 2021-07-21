// Mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import {
  expect,
  describe,
  it,
  jest,
  beforeEach,
  afterEach,
} from '@jest/globals'
import { _sslOptions } from './ssl-options'
import { Module } from 'module'

const fakeConfig = {
  certificate: {
    certFilename: '/cert/cert.pem',
    privateKeyFilename: '/cert/private.key',
    publicKeyFilename: '',
  },
  serverSettings: {
    ipServer: '',
  },
  serviceConnections: {
    databaseURL: '',
  },
  defaultLogLevel: 'warn',
}

describe('sslOptions()', () => {
  beforeEach(() => {
    // https://bensmithgall.com/blog/jest-mock-trick if this works!
    const mockStatSync = jest.fn()
    function mockFs() {
      const original = Module.createRequire('fs')
      return { ...original, statSync: mockStatSync }
    }

    jest.mock('fs', () => mockFs())
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('will throw an error when unable to locate the certificate', async () => {
    //  Deepcode ignore WrongNumberOfArgs/test: false positive
    await expect(
      _sslOptions(fakeConfig.certificate, 'testingSSLOptions'),
    ).rejects.toThrowError(/cert.pem/)
  })
})
