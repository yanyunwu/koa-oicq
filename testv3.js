const KoaOicq = require('.');

const app = new KoaOicq(2770315275, {
  log_level: 'off'
});
async function aaa(ctx, next) {
  ctx.reply("你好");
  console.log('测试');
  await next();
  console.log("测试2");
  ctx.bot.unuse('test')
}

class bbb {
  install(add) {
    add(async function (ctx, next) {
      ctx.reply("你好");
      console.log('测试');
      await next();
      console.log("测试2");
      ctx.bot.unuse('test2')
    })
  }
}
app.plugin('test2', bbb)

app.use({
  install(add) {
    add(function (ctx, next) {
      ctx.reply('测试')
      next();
    })
  }
})


app.plugin('test', () => aaa);


app.use(async (ctx, next) => {
  console.log(111);
  await next();
  console.log(333);

})

app.use(async (ctx, next) => {
  console.log(222);
  await next();
  console.log(444);
})

app.use('test');
app.use('test2')



app.listen();