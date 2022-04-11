
/**
 * 模块依赖引入
 */

const { ClientEvent, MessageClientEvent, RequestClientEvent, NoticeClientEvent } = require('./event');
const { createClient } = require('oicq');
const { EventEmitter } = require('events');
const EventContext = require('./context');

/**
 * 继承events.EventEmitter
 * 
 * @extends events.EventEmitter
 * @class Application
 */

class Application extends EventEmitter {

  /**
   * 启动函数, 返回一个 `Application` 实例
   */

  /**
   * 构造函数
   * 
   * noparam so far
   */

  constructor() {
    super();
    this.register();
    /** 数据触发者 */
    this.dispatcher = new ClientEvent();
  }

  /**
   * 用于收集中间件的方法
   * 
   * @param { Function }  fn
   */

  use(fn) {
    this.dispatcher.use(fn)
  }

  on(...args) {
    this.dispatcher.on(...args);
  }

  /**
   * 创建client并下发事件
   * 
   * @param { number } uid 用户的QQ号码
   */

  listen(uid) {
    // const client = createClient(uid);
    // this.onEvent(client);
    const cb = this.dispatcher.callback();
    cb(1);
  }

  /**
   * 事件监听
   * 
   * @param { object } client oicq的客户端对象
   * @param { Function } client.on 监听事件的方法
   */

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

  /**
  * 用于注册自定义事件
  */

  register() {
    Application.registerEvent('message', MessageClientEvent);
    Application.registerEvent('request', RequestClientEvent);
    Application.registerEvent('notice', NoticeClientEvent);
  }


  /**
   * 静态成员属性和方法
   */

  /**
   * @memberof Application
   * @static
   */
  static eventTypes = {};

  /**
   * 创建自定义事件
   * 
   * @param { string } eventType
   */

  static createEvent(eventType) {
    const Constructor = Application.eventTypes[eventType];

    if (Constructor) return new Constructor();
    else return null;
  }

  /**
   * 子事件注册中心 
   * 
   * @param { string } eventType
   * @param { Function } constructor
   */

  static registerEvent(eventType, constructor) {
    this.eventTypes[eventType] = constructor;
  }

}

/**
 * 文档末尾说明 
 */

module.exports = Application;
