const KoaOicq = require('.');
const path = require('path')

const app = new KoaOicq(2770315275, {
  log_level: 'off'
});
// app.source('./plugins');
app.source(path.resolve(__dirname, './plugins'));
app.use('a');
app.use('test', 'hhhh');
app.use('kocq-console');

app.listen();