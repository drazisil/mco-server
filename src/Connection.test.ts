// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { Socket } from "net";
import { Connection } from "./Connection";
import ConnectionMgr from "./connectionMgr";

let testConnection1: Connection;
let testConnection2: Connection;

describe("Connection class", () => {
  beforeEach(() => {
    testConnection1 = new Connection(1, new Socket(), new ConnectionMgr());
  });

  test('status == "inactive"', () => {
    expect(testConnection1.status).toEqual("INACTIVE");
  });

  test("has no default encryption object", () => {
    expect(testConnection1.enc.in).toEqual(null);
    expect(testConnection1.enc.out).toEqual(null);
  });

  test("changes to setupComplete after setting key", () => {
    expect(testConnection1.isSetupComplete).toBeFalsy();
    testConnection1.setEncryptionKey(
      Buffer.from("abc123", "hex").toString("hex")
    );
    expect(testConnection1.isSetupComplete).toBeTruthy();
  });
  describe("Two connections can communicate", () => {
    beforeEach(() => {
      testConnection1 = new Connection(1, new Socket(), new ConnectionMgr());
      testConnection2 = new Connection(2, new Socket(), new ConnectionMgr());
    });

    test("Connection one can talk to Connection two", () => {
      testConnection1.setEncryptionKey(
        Buffer.from("abc123", "hex").toString("hex")
      );
      testConnection2.setEncryptionKey(
        Buffer.from("abc123", "hex").toString("hex")
      );
      const testString = "I'm a very a secret message. Please don't decode me!";
      if (!testConnection1.enc.in) {
        throw new Error("error in testing!");
      }
      const encipheredBuffer = testConnection1.enc.in.processString(
        Buffer.from(testString).toString("hex")
      );
      if (!testConnection2.enc.out) {
        throw new Error("error in testing!");
      }
      expect(
        testConnection2.enc.out
          .processString(encipheredBuffer.toString("hex"))
          .toString()
      ).toEqual(testString);
    });
  });
});
