module.exports = class Context {

    constructor(bot, event) {
        this.bot = bot;
        this.event = event;
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
    /** reply别名 */
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