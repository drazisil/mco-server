// Mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { expect, it, jest, beforeEach, describe } from '@jest/globals'
import { PersonaServer } from '../src/services/PersonaServer/persona-server'
import { NPSMessage } from '../src/services/MCOTS/nps-msg'
import { EMessageDirection } from '../src/services/MCOTS/message-node'
import { Socket as fakeSocket } from 'net'

jest.mock('net')
let personaServer: PersonaServer

describe('Persona Server', () => {
  beforeEach(() => {
    personaServer = PersonaServer.getInstance()
  })

  it('PersonaServer Methods', async () => {
    const results = await personaServer.getPersonasByCustomerId(5_551_212)
    expect(results.length).toEqual(2)
    const name = results[0].name.toString('utf8')
    expect(name).toContain('Dr Brown')

    const personas = await personaServer.getPersonaMapsByCustomerId(5_551_212)
    const id1 = personas[0].id
    const name1 = personas[0].name
    expect(id1.readInt32BE(0)).toEqual(8_675_309)
    expect(name1.toString('utf8').length).toEqual(30)

    await expect(
      personaServer.getPersonasByCustomerId(123_654),
    ).rejects.toThrowError(/Unable to locate a persona/)
  })

  it('PersonaServer _npsSelectGamePersona()', async () => {
    const data = new NPSMessage(EMessageDirection.SENT).serialize()
    const results = await personaServer.handleSelectGamePersona(data)
    expect(results.direction).toEqual(EMessageDirection.SENT)
  })

  it('PersonaServer _npsNewGameAccount()', async () => {
    const data = new NPSMessage(EMessageDirection.SENT).serialize()
    const results = await personaServer.createNewGameAccount(data)
    expect(results.direction).toEqual(EMessageDirection.SENT)
  })

  it('PersonaServer _npsLogoutGameUser()', async () => {
    const data = new NPSMessage(EMessageDirection.SENT).serialize()
    const results = await personaServer.logoutGameUser(data)
    expect(results.direction).toEqual(EMessageDirection.SENT)
  })

  it('PersonaServer _npsCheckToken()', async () => {
    const data = new NPSMessage(EMessageDirection.SENT).serialize()
    const results = await personaServer.validateLicencePlate(data)
    expect(results.direction).toEqual(EMessageDirection.SENT)
  })

  it('PersonaServer _npsValidatePersonaName()', async () => {
    const data = new NPSMessage(EMessageDirection.SENT).serialize()
    const results = await personaServer.validatePersonaName(data)
    expect(results.direction).toEqual(EMessageDirection.SENT)
  })

  it('PersonaServer _send()', () => {
    const personaServer = PersonaServer.getInstance()
    const data = new NPSMessage(EMessageDirection.SENT)
    expect(() => {
      personaServer.sendPacket(new fakeSocket(), data)
    }).not.toThrow()
  })

  it('PersonaServer _npsGetPersonaMapsByCustomerId()', async () => {
    const personaServer = PersonaServer.getInstance()

    const personas1 = await personaServer.getPersonaMapsByCustomerId(
      2_868_969_472,
    )

    expect(personas1.length).toEqual(1)
    expect(personas1[0].name.toString('utf8')).toContain('Doc Joe')

    const personas2 = await personaServer.getPersonaMapsByCustomerId(4)

    expect(personas2.length).toEqual(0)
  })
})
