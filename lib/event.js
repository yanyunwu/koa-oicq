const { EventEmitter } = require('events')

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
    return function (ctx) {
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
}


class MessageClientEvent extends ClientEvent {
  constructor() {
    super();
  }
}

class RequestClientEvent extends ClientEvent {
  constructor() {
    super();
  }
}

/* class SystemClientEvent extends ClientEvent {
 
} */

class NoticeClientEvent extends ClientEvent {
  constructor() {
    super();
  }
}


module.exports = {
  ClientEvent,
  MessageClientEvent,
  RequestClientEvent,
  // SystemClientEvent,
  NoticeClientEvent
}