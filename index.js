const { Client, LocalAuth } = require("whatsapp-web.js");
const { isValidUrl } = require("./utils/isValidUrl.js")
const qrcode = require("qrcode-terminal");
const { makeSticker } = require("./commands/makeSticker.js");
const { yt } = require("./commands/aud.js");
const { yts } = require("./commands/auds.js");
const fs = require("fs");
const { dlVideo } = require("./commands/dlVideo.js");

const PROCESSING_EMOJIS = ["🍳", "🧙", "🕵️", "🪄", "⏳", "🫡", "👍", "🧃"];
const HASBI = "238959733043272@lid";

const client = new Client({
  puppeteer: {
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
  authStrategy: new LocalAuth({
    dataPath: "auth",
  }),
});

client.on("ready", () => {
  console.log("Client is ready!");
});

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.initialize();

client.on("message_create", async (message) => {
  if (message.fromMe) return;

  console.log(`Message received from ${message.from}:\n${message.body}`);

  // for timer
  console.log("Starting timer...");
  const start = Date.now();

  try {
    const randomEmoji =
      PROCESSING_EMOJIS[Math.floor(Math.random() * PROCESSING_EMOJIS.length)];
    await message.react(randomEmoji);

    const hasMedia = message.hasMedia;
    const isCommand = message.body.startsWith("!");
    const isUrl = isValidUrl(message.body);

    // if the command has a media, it will not check any other commands
    // sticker making
    if (hasMedia) return await makeSticker(message, client);

    // ! as the command prefix
    if (isCommand) {
      // tokenizing
      const [command, ...rest] = message.body.slice(1).split(" ");
      const args = rest.join(" ");

      switch (command) {
        case "help":
          const data = await fs.promises.readFile("./help.txt", "utf-8");
          return await client.sendMessage(message.from, data.trim());
        case "owner":
          contact = await client.getContactById(HASBI);
          return await client.sendMessage(message.from, contact);
        case "ping":
          return await client.sendMessage(message.from, "pong!");
        case "yt":
          return await yt(message, client, args);
        case "yts":
          return await yts(message, client, args);
      }
    }

    if (isUrl) {
      dlVideo(message, client, message.body)
    }
  } catch (err) {
    console.error(err);
  } finally {
    console.log("Done!");
    await message.react("");
    console.log(`Took ${(Date.now() - start) / 1000} seconds`);
  }
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught exception:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled rejection:", err);
});
