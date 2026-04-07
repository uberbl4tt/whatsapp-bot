const { writeUser, users } = require("../utils/users");
const { logger } = require("../logger");

async function registration(message, args) {
  try {
    logger.debug(`Adding user... (${message.from}: ${args})`, {
      userId: message.author,
    });
    await writeUser(message.from, args);

    message.reply("username kamu sudah terdaftar!");
    logger.info("Successfuly adding a user.", { userId: message.author });
  } catch (err) {
          logger.error(err.message, { messageId: message, stack: err.stack })
;
    message.reply("terjadi error :(");
  }
}

module.exports = { registration };
