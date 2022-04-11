
/**
 * 模块依赖引入
 */

const { ClientEvent } = require('./event');
const { MessageClientEvent, RequestClientEvent, NoticeClientEvent } = require('./event');
const { CustomClientEvent } = require('./event');
const { createClient } = require('oicq');
const EventContext = require('./context');

/**
 * @class Application
 */

class Application {

  /**
   * 启动函数, 返回一个 `Application` 实例
   */

  /**
   * 构造函数
   * 
   * noparam so far
   */

  constructor() {
    this.register();
    /** 数据触发者 */
    this.dispatcher = new ClientEvent();
    this.onList = [];
  }

  /**
   * 用于收集中间件的方法
   * 
   * @param { Function }  fn
   */

  use(fn) {
    this.dispatcher.use(fn)
  }

  on(event, listener) {
    let includeType = ['error', 'end'];
    if (includeType.includes(event)) {
      this.dispatcher.on(event, listener);
    } else {
      this.onList.push({ event, cb: listener })
    }
  }

  /**
   * 创建client并下发事件
   * 
   * @param { number } uid 用户的QQ号码
   */

  listen(uid) {
    const client = createClient(uid);
    this.onEvent(client);
    this.onOicq(client);
    this.onLogin(client);
    // const callback = this.dispatcher.callback();
    // callback(2);
  }

  /**
   * 事件监听
   * 
   * @param { object } client oicq的客户端对象
   * @param { Function } client.on 监听事件的方法
   */

  onEvent(client) {
    const callback = this.dispatcher.callback();
    client.on('message', (event) => {
      const ctx = new EventContext(client, event);
      ctx.setPrimaryType('message')
      callback(ctx);
    });

    client.on('request', (event) => {
      const ctx = new EventContext(client, event);
      ctx.setPrimaryType('request')
      callback(ctx);
    });

    client.on('notice', (event) => {
      const ctx = new EventContext(client, event);
      ctx.setPrimaryType('notice')
      callback(ctx);
    });

    // 有待添加

  }

  onLogin(client) {
    client.on('system.online', () => console.log('已登录'));
    client.on('system.login.qrcode', () => {
      process.stdin.once('data', () => {
        client.login();
      })
    }).login();
  }

  onOicq(client) {
    this.onList.forEach((item) => {
      client.on(item.event, (event) => {
        item.cb.call(client, event, client);
      })
    })
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

  /**
   * 自定义事件注册中心 
   * 
   * @param { Function } fn 用来进行过滤的函数
   */

  static customEvent(fn) {
    return new CustomClientEvent(fn);
  }

}

/**
 * 文档末尾说明 
 */

module.exports = Application;
