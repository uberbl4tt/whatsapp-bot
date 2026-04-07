require("dotenv").config({ quiet: true, override: true });

const { yt } = require("./commands/aud.js");
const { yts } = require("./commands/auds.js");
const { dlVideo } = require("./commands/dlVideo.js");
const { makeSticker } = require("./commands/makeSticker.js");
const { registration } = require("./commands/registration.js");

const { isValidUrl } = require("./utils/isValidUrl.js");
const { getUser } = require("./utils/users.js");
const client = require("./client.js");
const { logger, setClient } = require("./logger.js");

const qrcode = require("qrcode-terminal");
const fs = require("fs");
const { ChatTypes, groupMention } = require("whatsapp-web.js");

const PROCESSING_EMOJIS = ["🍳", "🧙", "🕵️", "🪄", "⏳", "🫡", "👍", "🧃"];
const OWNER = process.env.OWNER;

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
  const chat = await message.getChat();
  const mentions = await message.getMentions();
  const me = await client.getContactById(client.info.wid._serialized);

  const isMentioned = mentions.some(
    (contact) => contact.id._serialized === me.id._serialized,
  );

  if (message.fromMe || (chat.isGroup && !isMentioned)) return;
  logger.info("Message received", { userId: message.author });
  logger.info(`Content: ${message.body}`, { userId: message.author });

  try {
    const body = message.body.replace(/@\d+/g, "").trim();
    const randomEmoji =
      PROCESSING_EMOJIS[Math.floor(Math.random() * PROCESSING_EMOJIS.length)];
    await message.react(randomEmoji);

    const hasMedia = message.hasMedia;
    const isCommand = body.startsWith("!");
    const isUrl = isValidUrl(body);

    // if the command has a media, it will not check any other commands
    // sticker making
    if (hasMedia) {
      logger.debug("Message has media.");
      return await makeSticker(body, message, client);
    }

    // ! as the command prefix
    if (isCommand) {
      logger.debug("Message is a command.");
      // tokenizing
      const [command, ...rest] = body.slice(1).split(" ");
      const args = rest.join(" ");

      switch (command) {
        case "help":
          const data = await fs.promises.readFile("./help.txt", "utf-8");
          await client.sendMessage(message.from, data.trim());
          return;
        case "owner":
          contact = await client.getContactById(OWNER);
          await client.sendMessage(message.from, contact);
          return;
        case "ping":
          await client.sendMessage(message.from, "pong!");
          return;
        case "aud":
          await yt(message, client, args);
          return;
        case "auds":
          await yts(message, client, args);
          return;
        case "register":
          await registration(message, args);
          return;
        case "whoami":
          await message.reply(getUser(message.from));
          return;
      }
    }

    if (isUrl) {
      dlVideo(message, client, body);
    }
  } catch (err) {
    logger.error(err.message, { messageId: message, stack: err.stack });
  } finally {
    await message.react("");
  }
});

client.on("disconnected", async () => {
  logger.info("Client is disconnected.");
  client.sendMessage("120363407521951578@g.us", "Bot is offline");
});

process.on("uncaughtException", (err) => {
  logger.error(`FATAL - uncaughtException: ${err.message}`, {
    stack: err.stack,
  });
});

process.on("unhandledRejection", (err) => {
  logger.error(`FATAL - unhandledRejection: ${err.message}`, {
    stack: err.stack,
  });
});
