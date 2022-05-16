module.exports = function () {
  return function (ctx, next) {
    if (ctx.rowMsg === '2') {
      ctx.reply('success');
    }

    next();

  }
}