/// <reference types="node" />

import { Config, Client } from 'oicq'
import { PrivateMessageEvent, GroupMessageEvent, DiscussMessageEvent, EventMap } from 'oicq';
import { MessageElem } from 'oicq';
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

export class Application extends EventEmitter {
    use(fn: Middleware): void
    listen(num: number, config: Config): void;
}

export interface Application {
    onin<T extends keyof EventMap>(event: T, listener: EventMap<this>[T]): this;
    onin<S extends string | symbol>(event: S & Exclude<S, keyof EventMap>, listener: (this: this, ...args: any[]) => void): this;
}

// declare const KoaOicq: Application;
export = Application;