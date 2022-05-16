module.exports = function (log) {
  return function (ctx, next) {
    if (ctx.rowMsg === '2') {
      ctx.reply(log);
    }

    next();

  }
}