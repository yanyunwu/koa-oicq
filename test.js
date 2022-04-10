const KoaOicq = require('.');
const { segment } = require('oicq')

const app = new KoaOicq();

app.use((ctx) => {
    const r = ctx.rowMsg;
    ctx.bot.makeForwardMsg([])
    if (r === 'cs') {
        // let msg = ['有毒', segment.face(104)];
        // let msg = segment.dice(5)
        // let msg = segment.
        ctx.reply(msg, true)
    }
});

app.onin('message.private', (event, bot) => {
    console.log(bot);
    event.reply('123123')
})


app.listen(2770315275);