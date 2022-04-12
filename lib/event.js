
/**
 * 模块引入
 */

const { EventEmitter } = require('events')

/**
 * 继承events.EventEmitter 
 * @extends events.EventEmitter
 * @class ClientEvent
 */

class ClientEvent extends EventEmitter {

  /**
   * 该类用于收集所有客户端中间件
   */

  /**
   * no params so far
   */

  constructor() {
    super();
    /** 中间件存放数组 */
    this.middlewares = [];
  }

  /**
   * 收集中间件的函数
   * 
   * @param { Function } fn 传入一个回调函数
   */

  use(fn) {
    if (typeof fn !== 'function' && typeof fn !== 'object') throw new TypeError('middleware(中间件)需要传入一个函数对象或者一个人有apply方法的对象');
    if (typeof fn === 'function') {
      this.middlewares.push(fn);
    } else if (typeof fn.apply === 'function') {
      this.middlewares.push(fn.apply());
    } else {
      throw new TypeError('middleware(中间件)需要传入一个函数对象或者一个人有apply方法的对象');
    }
  }

  /**
   * 返回一个可以插入中间件的回调函数
   * 通常作为子类使用
   */

  callback() {
    const fnMiddleware = this.compose(this.middlewares);
    const handleMessage = async (ctx, next) => {
      if (next) {
        try {
          await fnMiddleware(ctx);
        } catch (err) {
          /** 子中间件捕获错误 */
          let isSuccess = this.emit('error', err, ctx);
          /** 错误上报 */
          if (!isSuccess) throw err;
        }
        await next();
      } else {
        fnMiddleware(ctx).then(v => {
          this.emit('end', ctx);
        }).catch(err => {
          this.emit('error', err, ctx);
        });
      }
    }
    return handleMessage;
  }

  /**
   * 遍历中间件的函数
   * 返回一个遍历所有中间件的回调函数
   * 
   * @param { object[] } middlewares
   */

  compose(middlewares) {
    const that = this;
    return function (ctx) {

      if (!that.filter(ctx)) return;

      // 触犯中间件的函数（递归调用）
      const dispach = index => {
        if (index >= middlewares.length) return Promise.resolve();
        const fn = middlewares[index];
        return Promise.resolve(
          fn(ctx, () => dispach(index + 1))
        );
      }
      return dispach(0);
    }
  }

  /**
   * 中间件回调过滤函数
   * 通常为子类使用
   * 可以通过条件过滤某些事件对象不走该子中间件的所有中间件
   * 
   * @param { object } ctx
   */

  filter(ctx) {
    const result = this.filterFun(ctx);
    if (result === undefined || result === true) return true;
    return false;
  }

  /**
   * 中间件回调过滤函数
   * 通常为子类实现, 抽象于父类
   * 可以通过条件过滤某些事件对象不走该子中间件的所有中间件
   * 
   * @param { object } ctx
   */

  filterFun(ctx) { }

  apply() {
    return this.callback();
  }

}

/**
 * 继承events.EventEmitter 
 * @extends ClientEvent
 * @class MessageClientEvent
 */

class MessageClientEvent extends ClientEvent {

  constructor() {
    super();
  }

  filterFun(ctx) {
    if (ctx.primaryType === 'message') return true;
    else return false;
  }

}

/**
 * 继承events.EventEmitter 
 * @extends ClientEvent
 * @class RequestClientEvent
 */

class RequestClientEvent extends ClientEvent {

  constructor() {
    super();
  }

  filterFun(ctx) {
    if (ctx.primaryType === 'request') return true;
    else return false;
  }

}

/**
 * 继承events.EventEmitter 
 * @extends ClientEvent
 * @class NoticeClientEvent
 */

class NoticeClientEvent extends ClientEvent {

  constructor() {
    super();
  }

  filterFun(ctx) {
    if (ctx.primaryType === 'notice') return true;
    else return false;
  }

}

class CustomClientEvent extends ClientEvent {
  constructor(filterFun) {
    super();
    this.filterFun = filterFun;
  }
}

/**
 * 导出所有模块
 */

module.exports = {
  ClientEvent,
  MessageClientEvent,
  RequestClientEvent,
  NoticeClientEvent,
  CustomClientEvent
}