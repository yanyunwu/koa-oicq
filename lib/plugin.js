
class Plugin {
  constructor(name, cb, isConstructor = false) {
    this.name = name;
    this.cb = cb;
    this.isConstructor = isConstructor;
  }
}

module.exports = Plugin;