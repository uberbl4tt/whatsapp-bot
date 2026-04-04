const { Client, LocalAuth } = require("whatsapp-web.js");

const client = new Client({
  puppeteer: {
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
  authStrategy: new LocalAuth({
    dataPath: "auth",
  }),
});

module.exports = client;
