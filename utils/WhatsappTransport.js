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
      const { message, messageId } = info;

      await this.client.sendMessage(
        this.chatId,
        `🚨 _Bot Error_\n*Message*: \`${message}\` \n*User*: ${messageId.from || "-"}`,
      );

      if (messageId) {
        await this.client.sendMessage(
          this.chatId,
          await messageId.getContact()
        )
      }
      callback();
    } catch (err) {
      console.error(`Error in WhatsappTransport: ${err}`);
      callback();
    }
  }
}

module.exports = WhatsappTransport;
