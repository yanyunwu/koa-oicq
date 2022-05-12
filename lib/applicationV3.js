const { Client } = require('oicq');
const { MiddlewareTypeError } = require('./error');
const EventContext = require('./context');
const Plugin = require('./plugin');


class Application extends Client {

  constructor(uid, conf = {}) {
    super(uid, conf);
    this.$plugins = new Map();
    this.$middlewares = [];
  }

  use(middleware) {
    if (typeof middleware === "function") this.$middlewares.push(middleware);
    else if (typeof middleware === "string") addMidFromPlugin.call(this, middleware);
    else if (typeof middleware === "object" && typeof middleware.install === "function") middleware.install(addMiddleware.bind(this));
    /** 兼容v1版本 */
    else if (typeof middleware === "object" && typeof middleware.apply === "function") this.$middlewares.push(middleware.apply());
    else throw new MiddlewareTypeError();
  }

  unuse(name) {
    if (this.$plugins.has(name)) {
      let plugin = this.$plugins.get(name);
      let index = this.$middlewares.indexOf(plugin);
      this.$middlewares.splice(index, 1);
    }
  }

  callback() {
    const fnMiddleware = this.$compose(this.$middlewares);
    const handleMessage = async (ctx) => {
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

  plugin(name, plugin, isConstructor = false) {
    if (this.$plugins.has(name)) return;

    if (isConstructor) {
      if (typeof plugin === "object") {
        let thePlugin = new Plugin(name, plugin, isConstructor);
        this.$plugins.set(name, thePlugin);
      }
      else throw new TypeError("构造函数模式需要一个可实例化的对象!");
      return;
    }

    if (typeof plugin === "function") {
      let thePlugin = new Plugin(name, plugin);
      this.$plugins.set(name, thePlugin);
    }
    else if (typeof plugin === "string") addPluginFromModule.call(this, name, plugin, isConstructor);
    else if (typeof plugin === "boolean") addPluginFromModule.call(this, name, name, plugin);
    else if (arguments.length === 1) addPluginFromModule.call(this, name, name, false);
    else if (typeof plugin === "object" && typeof plugin.install === "function") {
      plugin.install((plugin) => addPlugin.call(this, name, plugin));
    }
    else throw new TypeError("需要传入 一个函数对象 | 一个带有install方法的对象 !");
  }

}

/** 用作install方法给用户自定义添加插件 */
function addMiddleware(middleware) {
  if (typeof middleware === "function") this.$middlewares.push(middleware);
  else throw new TypeError("addMiddleware方法需要一个函数对象作为参数！");
}

function addPlugin(name, plugin) {
  if (typeof plugin === "function") this.$plugins.set(name, new Plugin(name, plugin));
  else throw new TypeError("addPlugin方法需要一个函数对象作为参数！");
}

function addPluginFromModule(name, plugin, isConstructor) {
  try {
    let thePlugin = require(plugin);
    this.$plugins.set(name, new Plugin(name, plugin, isConstructor));
  } catch (err) {
    console.log('插件不存在！');
  }
}

// 从插件中寻找
function addMidFromPlugin(name) {
  if (this.$plugins.has(name)) {
    let plugin = this.$plugins.get(name);
    this.$middlewares.push(plugin.isConstructor ? new plugin.cb() : plugin.cb);
    return;
  }
}

module.exports = Application;
