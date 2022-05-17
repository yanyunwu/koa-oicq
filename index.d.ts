/// <reference types="node" />

import * as oicq from 'oicq'

export interface MessageContext extends Context {
  postType: "message",
  event: oicq.GroupMessageEvent | oicq.PrivateMessageEvent | oicq.DiscussMessageEvent,

  msgId: string,
  rawMsg: string,
  message: oicq.MessageElem[],

  userId: number,
  groupId: number,
  groupName: string,
}

export interface RequestContext extends Context {
  postType: "request",
  event: oicq.GroupRequestEvent | oicq.FriendRequestEvent,
}

export interface NoticeContext extends Context {
  postType: "notice",
  event: oicq.GroupNoticeEvent | oicq.FriendNoticeEvent,
}

export interface Context {
  bot: Kocq,
  botId: number,
  reply: (this: Event, message: string) => void,
}

export type MidFunction = (ctx: MessageContext | RequestContext | NoticeContext, next?: Promise<any>) => void
export interface MidConstructor {
  install(add: (mid: MidFunction) => void): void
}

export class Kocq extends oicq.Client {

  constructor(uin: number, conf?: oicq.Config)

  use(middleware: MidFunction): this
  use(middleware: MidConstructor): this
  use(middleware: string, ...args: any[]): this

  unuse(plugin: MidFunction): void
  unuse(plugin: string): void

  plugin(name: string, plugin: (...args: any[]) => MidFunction | (new (...args: any[]) => MidConstructor)): this
  source(path: string): void

  callback(): Function
  listen(): void

}

export = Kocq