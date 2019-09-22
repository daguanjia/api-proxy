/**
 * 核心
 */
class Engine {
  middleware:Array<Function>;
  constructor() {
    this.middleware = [];
    this.init();
  }

  init() {} // noop 需要继承实现

  use(fn:Function) {
    if (typeof fn !== 'function') {
      throw new TypeError('中间件必须是 async 或返回 Promise 的函数！');
    }
    this.middleware.push(fn);
  }
}

module.exports = Engine;