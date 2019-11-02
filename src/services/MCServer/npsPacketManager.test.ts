// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { NPSPacketManager } from "./npsPacketManager";

describe("NPSPacketManger", () => {
  test("can find name for 0x229", () => {
    const npsPacketManager = new NPSPacketManager();
    expect(npsPacketManager.msgCodetoName(0x229)).toEqual("NPS_MINI_USER_LIST");
  });
});
