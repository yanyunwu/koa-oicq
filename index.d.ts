/// <reference types="node" />

import { Config, Client } from 'oicq'
import { PrivateMessageEvent, GroupMessageEvent, DiscussMessageEvent, EventMap } from 'oicq';
import { MessageElem } from 'oicq';
import { Gender, GroupRole } from 'oicq';
import { EventEmitter } from 'events';

export type Context = {
  /** 原生oicq event对象 */
  event: PrivateMessageEvent | GroupMessageEvent | DiscussMessageEvent,
  bot: Client,
  sender: {
    user_id: number;
    nickname: string;
    card: string;
    /** @deprecated */
    sex: Gender;
    /** @deprecated */
    age: number;
    /** @deprecated */
    area: string;
    level: number;
    role: GroupRole;
    title: string;
  },
  msg: MessageElem,
  rowMsg: string,
  reply: Function,
  groupId: number,
  groupName: string,
  userId: number,
  msgId: string,
  botId: number,
};

export type Middleware = (ctx: Context, next: Function) => void;

export class Application {
  use(fn: Middleware): void
  listen(num: number, config: Config): void;
  static createEvent(event: 'message' | 'request' | 'notice'): void;
  static customEvent(filter: (ctx: Context) => void): void;
}

export interface PEventMap<T = any> extends EventMap {
  'error': (this: T, err: Error, ctx: Context, next: Function) => void;
  'end': (this: T, ctx: Context) => void;
}

export interface Application {
  on<T extends keyof PEventMap>(event: T, listener: PEventMap<this>[T]): this;
  on<S extends string | symbol>(event: S & Exclude<S, keyof PEventMap>, listener: (this: this, ...args: any[]) => void): this;
}

// declare const KoaOicq: Application;
// export = Application;
export = Application;