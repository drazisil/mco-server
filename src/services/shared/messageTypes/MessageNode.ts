// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { Logger } from "../logger";

const logger = new Logger().getLogger();

export class MessageNode {
  public appId: number;
  public msgNo: number;
  public seq: number;
  public flags: number;
  public data: Buffer;
  public toFrom: number;
  private dataLength: number;
  private mcoSig: string;

  constructor() {
    this.msgNo = 0;
    this.seq = 999;
    this.flags = 0;
    this.data = Buffer.alloc(0);
    this.dataLength = 0;
    this.mcoSig = "NotAValue";

    this.toFrom = 0;
    this.appId = 0;
  }

  public deserialize(packet: Buffer) {
    this.dataLength = packet.readInt16LE(0);
    this.mcoSig = packet.slice(2, 6).toString();
    this.seq = packet.readInt16LE(6);
    this.flags = packet.readInt8(10);

    // data starts at offset 11
    this.data = packet.slice(11);

    // set message number
    try {
      this.msgNo = this.data.readInt16LE(0);
    } catch (error) {
      if (error instanceof RangeError) {
        // This is likeley not an MCOTS packet, ignore
      } else {
        throw new Error(
          `[MessageNode] Unable to read msgNo from ${packet.toString(
            "hex"
          )}: ${error}`
        );
      }
    }
  }

  public serialize() {
    const packet = Buffer.alloc(this.dataLength + 2);
    packet.writeInt16LE(this.dataLength, 0);
    packet.write(this.mcoSig, 2);
    packet.writeInt16LE(this.seq, 6);
    packet.writeInt8(this.flags, 10);
    this.data.copy(packet, 11);
    return packet;
  }

  public setAppId(appId: number) {
    this.appId = appId;
  }

  public setMsgNo(newMsgNo: number) {
    this.msgNo = newMsgNo;
    this.data.writeInt16LE(this.msgNo, 0);
  }

  public setSeq(newSeq: number) {
    this.seq = newSeq;
  }

  public setMsgHeader(packet: Buffer) {
    const header = Buffer.alloc(6);
    packet.copy(header, 0, 0, 6);
    // this.header = new MsgHead(header);
  }

  public updateBuffer(buffer: Buffer) {
    this.data = Buffer.from(buffer);
    this.dataLength = 10 + buffer.length;
    this.msgNo = this.data.readInt16LE(0);
  }

  public getBaseMsgHeader(packet: Buffer) {
    return this.BaseMsgHeader(packet);
  }

  public isMCOTS() {
    return this.mcoSig === "TOMC";
  }

  public dumpPacket() {
    logger.debug("= MessageNode ===============================");
    logger.debug("Packet has a valid MCOTS header signature");
    logger.debug("=============================================");
    logger.debug(`Header Length: ${this.dataLength}`);
    logger.debug(`Header MCOSIG: ${this.isMCOTS()}`);
    logger.debug(`MsgNo:         ${this.msgNo}`);
    logger.debug(`Sequence:      ${this.seq}`);
    logger.debug(`Flags:         ${this.flags}`);
    logger.debug(`ToFrom:        ${this.toFrom}`);
    logger.debug(`AppId:         ${this.appId}`);
    logger.debug("------------------------------------------------");
    const packetContents = this.serialize()
      .toString("hex")
      .match(/../g);
    if (packetContents) {
      logger.debug(`packet as string: ${packetContents.join(" ")}`);
    }
    logger.debug("= MessageNode ==================================");
  }

  public getLength() {
    return this.dataLength;
  }

  private BaseMsgHeader(packet: Buffer) {
    // WORD msgNo;
    this.msgNo = packet.readInt16LE(0);
  }
}
module.exports = { MessageNode };
