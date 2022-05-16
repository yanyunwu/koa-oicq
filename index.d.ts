/// <reference types="node" />

import * as oicq from 'oicq'

interface MessageContext extends Context {
  postType: "message",
  event: oicq.GroupMessageEvent | oicq.PrivateMessageEvent | oicq.DiscussMessageEvent,

  msgId: string,
  rawMsg: string,
  message: oicq.MessageElem[],

  userId: number,
  groupId: number,
  groupName: string,
}

interface RequestContext extends Context {
  postType: "request",
  event: oicq.GroupRequestEvent | oicq.FriendRequestEvent,
}

interface NoticeContext extends Context {
  postType: "notice",
  event: oicq.GroupNoticeEvent | oicq.FriendNoticeEvent,
}

interface Context {
  bot: Kocq,
  botId: number
  reply: (this: Event, message: string) => void,
};

type MidFunction = (ctx: MessageContext | RequestContext | NoticeContext, next: Promise<any>) => void;
interface MidConstructor {
  install(add: (mid: MidFunction) => void): void
}

class Kocq extends oicq.Client {

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

export = Kocq;