const { ClientEvent, MessageClientEvent, RequestClientEvent, NoticeClientEvent } = require('./event');
const { createClient } = require('oicq');
const { EventEmitter } = require('events');
const EventContext = require('./context');

class Application extends EventEmitter {
    static eventTypes = {};

    constructor() {
        super();
        this.register();
        /** 数据触发者 */
        this.dispatcher = new ClientEvent();
    }

    use(fn) {
        this.dispatcher.use(fn)
    }

    /** 创建client并下发事件 */
    listen(uid) {
        // const client = createClient(uid);
        // this.onEvent(client);
        const cb = this.dispatcher.callback();
        cb(1)

    }

    /** 事件监听 */
    onEvent(client) {
        const cb = this.dispatcher.callback();
        client.on('message', (event) => {
            const ctx = new EventContext(client, event);
            cb(ctx);
        });

        client.on('request', (event) => {
            const ctx = new EventContext(client, event);
            cb(ctx);
        });

        client.on('notice', (event) => {
            const ctx = new EventContext(client, event);
            cb(ctx);
        });

        // 有待添加
    }

    static createEvent(eventType) {
        const Constructor = Application.eventTypes[eventType];
        if (Constructor) {
            return new Constructor();
        } else {
            return null;
        }
    }

    /** 子事件注册中心 */
    static registerEvent(eventType, constructor) {
        this.eventTypes[eventType] = constructor;
    }

    register() {
        Application.registerEvent('message', MessageClientEvent);
        Application.registerEvent('request', RequestClientEvent);
        Application.registerEvent('notice', NoticeClientEvent);
    }
}

module.exports = Application;

