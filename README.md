# koa-oicq/kocq开发文档



前言：koa-oicq是基于[takayama-lily/oicq](https://github.com/takayama-lily/oicq)所开发用于方便开发者的框架。正如项目名称一样，本框架是模仿koa所开发的。



使用：`npm install koa-oicq` or `yarn add koa-oicq`



快速使用例子：

```js
const kocq = require('koa-oicq');

const app = new kocq(10001); // qq号

// 必须调用next才会调转到下一个中间件，原理同koa
app.use(async (ctx, next) => {
  ctx.reply('hello world!')
  await next()
});

app.use(async (ctx, next) => {
  if (ctx.postType === 'message') {
    console.log(ctx.event) // messageEvent
    // ......
  }

  if (ctx.postType === 'request') {
    console.log(ctx.event) // requestEvent
    // ......
  }

  if (ctx.postType === 'notice') {
    console.log(ctx.event) // noticeEvent
    // ......
  }
  await next()

});

app.use(async (ctx, next) => {
  await next()
});

// on支持监听原生oicq所有事件
app.on('message.private', function (event) {
  console.log(this); // this指向当前登录bot
  event.reply('私聊消息')
})

// 调用后会在data目录下生成二维码，登录QQ扫码，控制台回车即可登录
app.listen();
```



## ctx（当前消息的上下文对象）

`ctx.event`原生oicq事件对象

`ctx.bot`当前客户端机器人对象（用有原生bot的所有api）

 `ctx.message`消息构成对象（数组），同`ctx.event`

 `ctx.rawMsg`原生消息（字符串），同`ctx.event`

 ` ctx.reply`当前事件对象回复函数，同`ctx.event`

  `ctx.groupId`如果为群消息则为群id，同`ctx.event`

  `ctx.groupName`如果为群消息则为群id，同`ctx.event`

  `ctx.userId`发送者id，同`ctx.event`

  `ctx.msgId`消息id（可用于撤回消息等）,同`ctx.event`

  `ctx.botId`当前bot的id，同`ctx.event`



## 原生监听事件on（新增error | end 事件）

就相当于原生的on，只不过回调多了一个bot对象



## 中间件支持

### 中间件开发（2.0取消自带中间件可以使用koa-oicq-message）

中间件支持同步和异步模式，传入一个函数，会传参ctx，next

中间件支持传入一个函数, 或者一个带有`install`函数的对象（注意：该install函数提供一个参数函数，调用该参数函数并传入函数对象）

它可以这样使用

```js
class Mid {
    
    callback(){
        return async function(ctx, next) {
            await next();
        }
    }
    
    install(add) {
        add(this.callback());
    }
    
    
}
let mid = new Mid()
app.use(mid);
```



### 自带中间件 （message、request、notice）(已废弃)

system事件，我们推荐使用原生oicq监测

```js
const KoaOicq = require('koa-oicq');
const { createEvent } = require('koa-oicq');

const client = new KoaOicq();
// 创建专门监听notice的子中间件
const not = createEvent('notice');
not.use(async (ctx, next) => {
  console.log('notice');
  await next();
})

client.use(not);

client.listen('qq')

// request同理
```



### 当然你可以自定义条件性子中间件（满足一定条件才会走该子中间件的所有中间件）(已废弃)

```js
const KoaOicq = require('koa-oicq');

const app = new KoaOicq();
const { customEvent } = KoaOicq;

const custom = customEvent((ctx) => {
  // 如果消息为ctx才会调用下面的中间件
  if (ctx.rowMsg === 'ts') return true;
  else return false;
});

custom.use(async (ctx, next) => {
  console.log('我被调用了~~~');
  await next();
})

client.use(custom);

client.listen('qq')
```



## 插件支持

### 插件定义

必须传入一个返回中间件函数的函数（这样你可以在第一层函数中传入你想要自定义的参数）

或者传入一个构造函数（带有install方法）

```js

function funmid(){
    return function(ctx, next){
        next()
    }
}
// 传入函数
app.plugin('name', funmid);

class Mid {
    
    callback(){
        return async function(ctx, next) {
            await next();
        }
    }
    
    install(add) {
        add(this.callback());
    }
    
}
// 传入构造函数
app.plugin('name', Mid);
```



### 当然，并不是注册了插件就能使用，必须使用app.use去安装插件



```js
// 传入插件名称，和若干参数(插件调用时需要传入的参数)
app.use('name', arg1, args2);
```



### 插件卸载

安装插件后同时还支持卸载插件

```js
app.unuse('name')
app.unuse(mid)
```



### 插件库支持（目前支持本地插件库和node_modules）

plugins/test.js

```js
// ./plugins/test.js
module.exports = function (log) {
  return function (ctx, next) {
    if (ctx.rawMsg === '1') {
      ctx.reply(log);
    }
    next();
  }
}
```



```js
app.source(path.resolve(__dirname, './plugins')); //app.source('./plugins');
// 首先去定义的source插件库寻找
app.use('test', 'success');
// 其次去node_modules寻找
app.use('kocq-console'); // kocq-console是已经开发的插件
```



## 错误捕获

koa-oicq不仅支持全局错误捕获，同时也支持子中间件（废弃）的错误捕获

```js

// 中间件错误监听
app.on('error', (err, ctx)=>{
    
});
```



## 生命周期

目前只支持每个事件对象完成所有中间件轮询后的生命周期回调

```js
app.on('end', (ctx)=>{
    console.log('结束了')
})
```



后序：如果涉及到不懂的api请去oicq查看文档，欢迎大家给一些建议，本人在校大二彩笔一枚，哈哈哈