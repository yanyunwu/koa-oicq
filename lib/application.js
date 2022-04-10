const { createClient } = require('oicq');
const { EventEmitter } = require('events');
const Context = require('./context');

class Application extends EventEmitter {
    middlewareList = [];
    oninList = [];
    constructor() {
        super();
    }

    use(fn) {
        if (typeof fn !== 'function' && typeof fn !== 'object') throw new TypeError('middleware(中间件)需要传入一个函数对象或者一个人有apply方法的对象');
        if (typeof fn === 'function') {
            this.middlewareList.push(fn);
        } else if (typeof fn.apply === 'function') {
            this.middlewareList.push(fn.apply);
        } else {
            throw new TypeError('middleware(中间件)需要传入一个函数对象或者一个人有apply方法的对象');
        }
    }

    listen(...args) {
        const bot = createClient(...args);
        this.onMessage(bot);
        this.onAll(bot);
        this.onSystem(bot);
    }

    /** 返回调用的函数对象 */
    callback() {
        const fnMiddleware = this.compose(this.middlewareList);
        const handleMessage = (ctx) => {
            fnMiddleware(ctx).then(value => {
                // console.log('END');
            }).catch(err => {
                this.emit('error', err);
            })
        }

        return handleMessage;
    }

    compose(middlewareList) {
        return function (ctx) {
            // 触犯中间件的函数（递归调用）
            const dispach = index => {
                if (index >= middlewareList.length) return Promise.resolve();
                const fn = middlewareList[index];
                return Promise.resolve(
                    fn(ctx, () => dispach(index + 1))
                );
            }


            return dispach(0);
        }
    }

    onMessage(bot) {
        const callback = this.callback();
        bot.on("message", e => {
            const ctx = new Context(bot, e);
            callback(ctx);
        });
    }

    onSystem(bot) {
        bot.on('system.online', () => console.log('已登录'));
        bot.on('system.login.qrcode', () => {
            process.stdin.once('data', () => {
                bot.login();
            })
        }).login();
    }

    onAll(bot) {
        this.oninList.forEach((item) => {
            bot.on(item.event, (event) => {
                item.cb.call(bot, event, bot);
            })
        })
    }

    onin(event, cb) {
        this.oninList.push({
            event: event,
            cb: cb
        })
    }
}

module.exports = Application;
