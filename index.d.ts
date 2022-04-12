/// <reference types="node" />

import { Config, Client } from 'oicq'
import { PrivateMessageEvent, GroupMessageEvent, DiscussMessageEvent, EventMap } from 'oicq';
import { MessageElem } from 'oicq';
import { Gender, GroupRole } from 'oicq';
import { RequestEvent, Message, GroupNoticeEvent, FriendNoticeEvent } from 'oicq'
import { EventEmitter } from 'events';

type NoticeEvent = GroupNoticeEvent | FriendNoticeEvent;

export type Context<T> = {
  /** 原生oicq event对象 */
  event: T,
  bot: Client,
  sender?: {
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
  msg?: MessageElem,
  rowMsg?: string,
  reply?: Function,
  groupId?: number,
  groupName?: string,
  userId: number,
  msgId?: string,
  botId: number,
  primaryType: string
};

export interface MiddlewareObject<T> {
  apply(ctx: Context<T>, next: Function): void
}

export type Middleware<T> = (ctx: Context<T>, next: Function) => void;

export interface PEventMap<T = any> extends EventMap {
  'error': (this: T, err: Error, ctx: Context<RequestEvent | Message | NoticeEvent>, next: Function) => void;
  'end': (this: T, ctx: Context<RequestEvent | Message | NoticeEvent>) => void;
}

export interface EventType {
  'message': MessageClientEvent,
  'request': RequestClientEvent,
  'notice': NoticeClientEvent,
}

type EventMaptype<T> = T extends (event: infer U) => void ? U : never;

export class Application {
  use(fn: Middleware<RequestEvent | Message | NoticeEvent>): void;
  use(fn: MiddlewareObject<RequestEvent | Message | NoticeEvent>): void;
  listen(num: number, config: Config): void;
  static createEvent<T extends keyof EventType>(event: T): EventType[T];
  static createEvent<T extends string>(event: Exclude<T, keyof EventType>): void;
  static customEvent(filter: (ctx: Context) => void): CustomClientEvent;
  on<T extends keyof PEventMap>(event: T, listener: (this: Client, event: EventMaptype<PEventMap<Client>[T]>, bot: Client) => void): void;
  on<S extends string | symbol>(event: S & Exclude<S, keyof PEventMap>, listener: (this: Client, ...args: any[]) => void): void;
}

export interface ClientEvent extends EventEmitter {
  use(this: MessageClientEvent, fn: Middleware<Message>): void;
  use(this: NoticeClientEvent, fn: Middleware<NoticeEvent>): void;
  use(this: RequestClientEvent, fn: Middleware<RequestEvent>): void;
  use(this: CustomClientEvent, fn: Middleware<RequestEvent & Message & NoticeEvent>): void;
  use(this: MessageClientEvent, fn: MiddlewareObject<Message>): void;
  use(this: NoticeClientEvent, fn: MiddlewareObject<NoticeEvent>): void;
  use(this: RequestClientEvent, fn: MiddlewareObject<RequestEvent>): void;
  use(this: CustomClientEvent, fn: MiddlewareObject<RequestEvent & Message & NoticeEvent>): void;
}

export interface MessageClientEvent extends ClientEvent { }
export interface RequestClientEvent extends ClientEvent { }
export interface NoticeClientEvent extends ClientEvent { }
export interface CustomClientEvent extends ClientEvent { }

export = Application;