const KoaOicq = require('.');

const app = new KoaOicq();
const { createEvent } = KoaOicq;
const msg = createEvent('message')

msg.use(async (a, next) => {
    console.log(11);
    await next();

    console.log(22);
})

msg.use(async (a, next) => {
    console.log(33);
    await next();
    console.log(44);
})

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

app.use(async (a, next) => {
    aa
    console.log(3);
    await next();
    console.log(4);
})

app.listen();