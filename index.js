const client = require("./client.js");
const { isValidUrl } = require("./utils/isValidUrl.js");
const qrcode = require("qrcode-terminal");
const { makeSticker } = require("./commands/makeSticker.js");
const { yt } = require("./commands/aud.js");
const { yts } = require("./commands/auds.js");
const fs = require("fs");
const { dlVideo } = require("./commands/dlVideo.js");
const { logger, setClient } = require("./logger.js");

const PROCESSING_EMOJIS = ["🍳", "🧙", "🕵️", "🪄", "⏳", "🫡", "👍", "🧃"];
const HASBI = "238959733043272@lid";

client.on("ready", () => {
  logger.info("Client is ready!");
  setClient(client);
  logger.debug("Sending bot status onto the group chat.");
  client.sendMessage("120363407521951578@g.us", "Bot is online");
});

client.on("qr", (qr) => {
  logger.warn("User is logged out.");
  qrcode.generate(qr, { small: true });
});

logger.info("Initializing client...");
client.initialize();

client.on("message_create", async (message) => {
  if (message.fromMe) return;
  logger.info("Message received", { userId: message.from });
  logger.info(`Content: ${message.body}`, { userId: message.from });

  try {
    const randomEmoji =
      PROCESSING_EMOJIS[Math.floor(Math.random() * PROCESSING_EMOJIS.length)];
    await message.react(randomEmoji);

    const hasMedia = message.hasMedia;
    const isCommand = message.body.startsWith("!");
    const isUrl = isValidUrl(message.body);

    // if the command has a media, it will not check any other commands
    // sticker making
    if (hasMedia) {
      logger.debug("Message has media.")
      return await makeSticker(message, client);
    }

    // ! as the command prefix
    if (isCommand) {
      logger.debug("Message is a command.")
      // tokenizing
      const [command, ...rest] = message.body.slice(1).split(" ");
      const args = rest.join(" ");

      switch (command) {
        case "help":
          const data = await fs.promises.readFile("./help.txt", "utf-8");
           await client.sendMessage(message.from, data.trim());
           return
        case "owner":
          contact = await client.getContactById(HASBI);
           await client.sendMessage(message.from, contact);
           return
        case "ping":
           await client.sendMessage(message.from, "pong!");
           return
        case "aud":
           await yt(message, client, args);
           return
        case "auds":
           await yts(message, client, args);
           return
      }
    }

    if (isUrl) {
      dlVideo(message, client, message.body);
    }
  } catch (err) {
      logger.error(err.message, { userId: message.from, stack: err.stack });
  } finally {
    await message.react("");
  }
});

client.on("disconnected", async () => {
  logger.info("Client is disconnected.");
  client.sendMessage("120363407521951578@g.us", "Bot is offline");
})

process.on("uncaughtException", (err) => {
  logger.error(`FATAL - uncaughtException: ${err.message}`, { stack: err.stack })
})

process.on("unhandledRejection", (err) => {
  logger.error(`FATAL - unhandledRejection: ${err.message}`, { stack: err.stack })
})
