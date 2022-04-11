const KoaOicq = require('.');

const app = new KoaOicq();
// const msg = 

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
app.onin('dasda',)

// 调用后会在data目录下生成二维码，登录QQ扫码，控制台回车即可登录
app.listen(2770315275);