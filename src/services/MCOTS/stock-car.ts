// Mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import logger from '@drazisil/mco-logger'

/**
 * Container objest for Stock cars
 * @module StockCar
 */

// DWORD   brandedPartID;
// DWORD   retailPrice;
// WORD    bIsDealOfTheDay;

/**
 * @class
 * @property {number} brandedPartId
 * @property {number} retailPrice
 * @property {0 | 1} bIsDealOfTheDay
 */
export class StockCar {
  brandedPartId: number
  retailPrice: number
  bIsDealOfTheDay: number
  serviceName: string
  /**
   * @param {number} brandedPartId
   * @param {number} retailPrice
   * @param {0|1} bIsDealOfTheDay
   */
  constructor(
    brandedPartId: number,
    retailPrice: number,
    bIsDealOfTheDay: number,
  ) {
    this.brandedPartId = brandedPartId
    this.retailPrice = retailPrice
    this.bIsDealOfTheDay = bIsDealOfTheDay
    this.serviceName = 'mcoserver:StockCar'
  }

  /**
   *
   * @return {Buffer}
   */
  serialize(): Buffer {
    const packet = Buffer.alloc(10)
    packet.writeInt32LE(this.brandedPartId, 0)
    packet.writeInt32LE(this.retailPrice, 4)
    packet.writeInt16LE(this.bIsDealOfTheDay, 8)
    return packet
  }

  /**
   * DumpPacket
   * @return {void}
   */
  dumpPacket(): void {
    logger.log('[StockCar]======================================', {
      service: this.serviceName,
      level: 'debug',
    })
    logger.log(`brandedPartId:     ${this.brandedPartId}`, {
      service: this.serviceName,
      level: 'debug',
    })
    logger.log(`retailPrice        ${this.retailPrice}`, {
      service: this.serviceName,
      level: 'debug',
    })
    logger.log(`isDealOfTheDay:    ${this.bIsDealOfTheDay}`, {
      service: this.serviceName,
      level: 'debug',
    })
    logger.log('[/StockCar]======================================')
  }
}
