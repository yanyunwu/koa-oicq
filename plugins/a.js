module.exports = function () {
  return function (ctx, next) {
    if (ctx.rowMsg === '1') {
      ctx.reply('success');
    }
    next();

  }
}