// @ts-check
// Mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { readFile } from 'fs'
import { promisify } from 'util'
import logger from '@drazisil/mco-logger'
import { IAppConfiguration } from '../../../config'
import { ISslOptions } from '../../types'

const readFilePromise = promisify(readFile)

/**
 *
 * @typedef {Object} sslOptionsObj
 * @property {string} cert
 * @property {boolean} honorCipherOrder
 * @property {string} key
 * @property {boolean} rejectUnauthorized
 */

/**
   *
 * @param {Object} certificateSettings
 * @param {string} certificateSettings.privateKeyFilename
 * @param {string} certificateSettings.publicKeyFilename
 * @param {string} certificateSettings.certFilename
 * @param {string} serviceName

   * @return {Promise<sslOptionsObj>}
   */
export async function _sslOptions(
  certificateSettings: IAppConfiguration['certificate'],
  serviceName: string,
): Promise<ISslOptions> {
  logger.debug(`Reading ${certificateSettings.certFilename}`, {
    service: serviceName,
  })

  let cert
  let key

  try {
    cert = await readFilePromise(certificateSettings.certFilename, {
      encoding: 'utf-8',
    })
  } catch (error) {
    throw new Error(
      `Error loading ${certificateSettings.certFilename}: (${error}), server must quit!`,
    )
  }

  try {
    key = await readFilePromise(certificateSettings.privateKeyFilename, {
      encoding: 'utf-8',
    })
  } catch (error) {
    throw new Error(
      `Error loading ${certificateSettings.privateKeyFilename}: (${error}), server must quit!`,
    )
  }

  return {
    cert,
    honorCipherOrder: true,
    key,
    rejectUnauthorized: false,
  }
}
