const KoaOicq = require('.');
const { createEvent } = require('.');

const client = new KoaOicq({
  platform: 5
});

// 监听包括message | request | notice所有消息 systen推荐使用on监听
client.use(async (ctx, next) => {
  await next();
});

// 创建专门监听message的子中间件
const app = createEvent('message');

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


// 子中间件错误监听
app.on('error', (err, ctx, next) => {
  console.log(err);
});

// 中间件遍历结束事件
app.on('end', (ctx) => {
  console.log('结束了');
})

client.use(app);

// on支持监听原生oicq所有事件
client.on('message.private', (event, bot) => {
  console.log(bot); // 当前登录qqbot对象，可调用所有api
  event.reply('私聊消息')
})
client.on('system.login.error', (event, bot) => {
  console.log('登录失败');
  bot.login();
})

// 全局中间件错误监听
client.on('error', (err) => {

})


// 创建专门监听notice的子中间件
const not = createEvent('notice');
not.use(async (ctx, next) => {
  console.log('notice');
})

client.use(not);

// request同理



// 调用后会在data目录下生成二维码，登录QQ扫码，控制台回车即可登录
client.listen(2770315275);