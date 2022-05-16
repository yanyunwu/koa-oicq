
/**
 * 模块依赖引入
 */

const { Client } = require('oicq');
const EventContext = require('./context');

/**
 * @class Application
 */

class Application extends Client {

  /**
   * 启动函数, 返回一个 `Application` 实例
   */

  /**
   * 构造函数
   * 
   * noparam so far
   */

  constructor(uid, conf = {}) {
    super(uid, conf);
    this.$plugins = new Map();
    this.$middlewares = [];
  }

  use(middleware, ...args) {
    if (typeof middleware === "function") this.$middlewares.push(middleware);
    else if (typeof middleware === "object" && typeof middleware.install === "function") middleware.install(addMiddleware.bind(this));
    else if (typeof middleware === "string") addMidFromPlugin.call(this, middleware, ...args);
    /** 兼容v1版本 */
    else if (typeof middleware === "object" && typeof middleware.apply === "function") this.$middlewares.push(middleware.apply());
    else throw new TypeError('需要传入( 一个函数 | 一个带有install方法的对象 | 一个带有apply方法的对象 )!');
    return this;
  }

  /**
   * 目前只能卸载带有name的插件
   * 或者直接使用use的函数式插件
   * 暂时不能卸载对象形式的插件
   * 
   */

  unuse(plugin) {

    if (typeof plugin === "function") {
      let index = this.$middlewares.indexOf(plugin);
      this.$middlewares.splice(index, 1);
      return;
    }

    if (typeof plugin === "string" && this.$plugins.has(plugin)) {
      let thePlugin = this.$plugins.get(plugin);
      let index = this.$middlewares.indexOf(thePlugin);
      this.$middlewares.splice(index, 1);
      return;
    }

  }

  callback() {
    const fnMiddleware = this.$compose(this.$middlewares);
    const handleMessage = (ctx) => {
      fnMiddleware(ctx).then(v => {
        this.emit('end', ctx);
      }).catch(err => {
        this.emit('error', err, ctx);
      });
    }
    return handleMessage;
  }

  $compose(middlewares) {
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

  listen() {
    this.$onEvent();
    this.$onLogin();
  }

  $onEvent() {
    this.on("message", this.$handleEvent);
    this.on("notice", this.$handleEvent);
    this.on("request", this.$handleEvent);
  }

  $handleEvent(event) {
    const callback = this.callback();
    const ctx = new EventContext(this, event);
    callback(ctx);
  }

  $onLogin() {
    this.on('system.online', () => console.log('已登录!'));
    this.on('system.login.qrcode', () => {
      process.stdin.once('data', () => {
        this.login();
      })
    }).login();
  }

  plugin(name, plugin) {
    if (this.$plugins.has(name)) return this;
    if (typeof plugin === 'function') this.$plugins.set(name, plugin);
    else throw new TypeError('目前只能定义函数或构造函数类型的插件');
    return this;
  }

  pluginSource() {

  }

}

/** 用作install方法给用户自定义添加插件 */
function addMiddleware(middleware) {
  if (typeof middleware === "function") this.$middlewares.push(middleware);
  else throw new TypeError("addMiddleware方法需要一个函数对象作为参数！");
}

// 从插件中寻找
function addMidFromPlugin(name, ...args) {
  /** 首先从plugin定义的插件寻找 */
  if (this.$plugins.has(name)) {
    let plugin = this.$plugins.get(name);
    if (plugin.prototype && typeof plugin.prototype.install === "function")
      this.use(new plugin(...args));
    else this.use(plugin(...args));
    return;
  }
  /** 从本地插件source库中寻找 */

  /** 从npm包中寻找 */

  /** 从远程插件资源库中寻找 */
}

/**
 * 文档末尾说明 
 */

module.exports = Application;
