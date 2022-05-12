
class MiddlewareTypeError extends Error {
  defaultMessage = "需要传入( 一个函数 | 一个带有install方法的对象 | 一个带有apply方法的对象 )!"
  constructor(message) {
    if (message) super(message);
    else super(this.defaultMessage);
  }
}

module.exports = {
  MiddlewareTypeError
}