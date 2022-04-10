### koa-oicq开发文档



前言：koa-oicq是基于

[takayama-lily]: https://github.com/takayama-lily/oicq

所开发用于方便开发者的框架。正如项目名称一样，本框架是模仿koa所开发的。



使用：`npm install koa-oicq` or `yarn add koa-oicq`



快速使用例子：

```js
const KoaOicq = require('koa-oicq');

const app = new KoaOicq();

// 必须调用next才会调转到下一个中间件，原理同koa
app.use(async (ctx, next) => {
    console.log(1);
    await ctx.reply('1')

    await next()

    console.log(2);
    await ctx.reply('2')
});

app.use(async (ctx, next) => {
    console.log(3);
    await ctx.reply('3')

    await next()
    console.log(4);

    await ctx.reply('4')
});

app.use(async (ctx, next) => {
    console.log(5);
    await ctx.reply('5')

    await next()

    console.log(6);
    await ctx.reply('6')
});
// 打印顺序 135642

// onin支持监听原生oicq所有事件
app.onin('message.private', (event, bot) => {
    console.log(bot); // 当前登录qqbot对象，可调用所有api
    event.reply('私聊消息')
})

// 调用后会在data目录下生成二维码，登录QQ扫码，控制台回车即可登录
app.listen(2770315275);
```



#### ctx（当前消息的上下文对象）

`ctx.event`原生oicq事件对象

`ctx.bot`当前客户端机器人对象（用有原生bot的所有api）

`ctx.sender`消息发送者，同`ctx.event.sender`

 `ctx.msg`: 消息构成对象（数组），同`ctx.event`

 `ctx.rowMsg`: 原生消息（字符串），同`ctx.event`

 ` ctx.reply`: 当前事件对象回复函数，同`ctx.event`

  `ctx.groupId`: 如果为群消息则为群id，同`ctx.event`

  `ctx.groupName`: 如果为群消息则为群id，同`ctx.event`

  `ctx.userId`: 发送者id，同`ctx.event`

  `ctx.msgId`: 消息id（可用于撤回消息等）,同`ctx.event`

  `ctx.botId`: 当前bot的id，同`ctx.event`



#### 原生监听事件onin

就相当于原生的on，只不过回调多了一个bot对象



#### 中间件开发

中间件支持同步和异步模式，传入一个函数，会传参ctx，next



后序：如果设计到不懂的api请去oicq查看文档，欢迎大家给一些建议，本人在校大二彩笔一枚，哈哈哈