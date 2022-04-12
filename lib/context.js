
/**
 * 事件上下文对象
 * 
 * @class EventContext
 */

class EventContext {

  /**
   * 用于为每一个事件提供一个事件上下文对象 
   */

  /**
   * 通过该对象创建封装oicq原生事件对象
   * 
   * @param { Client } bot oicq客户端对象
   * @param { object } event oicq原生事件对象
   */

  constructor(bot, event) {
    this.bot = bot;
    this.event = event;
    this.primaryType = undefined;
  }

  /**
   * 设置一级事件类型
   * 
   * @param { string } type 设置事件类型
   */

  setPrimaryType(type) {
    this.primaryType = type;
  }

  get sender() {
    return this.event.sender;
  }

  get msg() {
    return this.event.message;
  }

  get rowMsg() {
    return this.event.raw_message;
  }

  /**
   * 代理event对象的方法reply
   * 
   * @returns { Function }
   * @public
   */

  get reply() {
    return this.event.reply.bind(this.event);
  }

  get groupId() {
    return this.event.group_id
  }

  get groupName() {
    return this.event.group_name;
  }

  get userId() {
    return this.event.user_id;
  }

  get msgId() {
    return this.event.message_id;
  }

  get botId() {
    return this.event.self_id;
  }

}

/**
 * 直接导出本类
 */

module.exports = EventContext;