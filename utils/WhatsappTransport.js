const TransportBase = require("winston-transport");

class WhatsappTransport extends TransportBase {
  constructor(opts) {
    super(opts);
    this.client = opts.client;
    this.chatId = opts.chatId;
  }

  async log(info, callback) {
    try {
      if (!this.client) return callback();
      const { message, userId } = info;

      await this.client.sendMessage(
        this.chatId,
        `🚨 _Bot Error_\n*Message*: \`${message}\` \n*User*: ${userId || "-"}`,
      );
      callback();
    } catch (err) {
      console.error(`Error in WhatsappTransport: ${err}`);
      callback();
    }
  }
}

module.exports = WhatsappTransport;
