const KoaOicq = require('.');

const app = new KoaOicq();
const { createEvent, customEvent } = KoaOicq;
const msg = createEvent('message');
const custom = customEvent((ctx) => {
  if (ctx.rowMsg === 'ts') return true;
  else return false;
});

custom.use(() => {
  console.log('ccccc');
})

msg.use(async (a, next) => {
  console.log(a.primaryType);
  console.log(11);
  await next();

  console.log(22);
})

msg.use(async (a, next) => {
  console.log(33);
  await next();
  console.log(44);
})

// msg.on('error', () => {
//   console.log('子中间件有错误');
// })

app.use(async (a, next) => {
  console.log(1);
  // try {
  await next();
  // } catch (err) {
  //     console.log(222);
  // }
  console.log(2);
})

app.use(msg.callback())
app.use(custom.callback());

app.use(async (a, next) => {
  // aa
  console.log(3);
  await next();
  console.log(4);
})

app.on('error', () => {
  console.log('有错误');
})

app.on('message.group', () => {
  console.log(12371983182);
})

app.listen(2770315275);