require("dotenv").config({ quiet: true, override: true });
const { users } = require("./utils/users.js")

const { createLogger, transports, format } = require("winston");
require("winston-daily-rotate-file");
const WhatsappTransport = require("./utils/WhatsappTransport");

const coolFormat = format.combine(
  format.timestamp({ format: "HH:mm:ss" }),
  format.colorize(),
  format.printf(({ timestamp, level, message, userId }) => {
    const username = users[userId];
    const user = userId ? ` - ${username ? `${username} (${userId})` : userId}` : "";
    return `[${timestamp}] (${level}): ${message}${user}`;
  }),
);

const boringFormat = format.combine(
  format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  format.json(),
);

const whatsappTransport = new WhatsappTransport({
  chatId: process.env.LOG_CHAT,
  level: "error",
});

const logger = createLogger({
  level: process.env.LOG_LEVEL || "info",
  transports: [
    new transports.DailyRotateFile({
      level: "error",
      filename: "./logs/%DATE%-error.log",
      datePattern: "YYYY-MM-DD",
      format: boringFormat,
    }),
    new transports.DailyRotateFile({
      filename: "./logs/%DATE%-combined.log",
      datePattern: "YYYY-MM-DD",
      format: boringFormat,
    }),
    whatsappTransport,
    new transports.Console({
      format: coolFormat,
    }),
  ],
});

const setClient = (client) => {
  whatsappTransport.client = client;
};

module.exports = { logger, setClient };
