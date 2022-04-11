const { EventEmitter } = require('events')


/**
 * 继承events.EventEmitter 
 * @extends events.EventEmitter
 * @class ClientEvent
 */

class ClientEvent extends EventEmitter {
  constructor() {
    super();
    /** 中间件存放数组 */
    this.middlewares = [];
  }

  /** 用来收集中间件 */
  use(fn) {
    if (typeof fn !== 'function' && typeof fn !== 'object') throw new TypeError('middleware(中间件)需要传入一个函数对象或者一个人有apply方法的对象');
    if (typeof fn === 'function') {
      this.middlewares.push(fn);
    } else if (typeof fn.apply === 'function') {
      this.middlewares.push(fn.apply);
    } else {
      throw new TypeError('middleware(中间件)需要传入一个函数对象或者一个人有apply方法的对象');
    }
  }

  /** 返回中间件函数 */
  callback() {
    const fnMiddleware = this.compose(this.middlewares);
    const handleMessage = async (ctx, next) => {

      if (next) {
        try {
          await fnMiddleware(ctx);
        } catch (err) {
          let isSuccess = this.emit('error', err, ctx);   /** 子中间件捕获错误 */
          if (!isSuccess) throw err;  /** 错误上报 */
        }

        await next();
      } else {
        fnMiddleware(ctx).then(v => {
          this.emit('end', ctx);
        }).catch(err => {
          this.emit('error', err, ctx);
        })
      }

    }

    return handleMessage;
  }

  /** 遍历中间件 */
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

  filter(ctx) {
    const result = this.filterFun(ctx);
    if (result === undefined || result === true) return true;
    return false;
  }

  filterFun() { }

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

/* class SystemClientEvent extends ClientEvent {
 
} */

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


module.exports = {
  ClientEvent,
  MessageClientEvent,
  RequestClientEvent,
  // SystemClientEvent,
  NoticeClientEvent,
  CustomClientEvent
}