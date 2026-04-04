const { createLogger, transports, format } = require("winston");
require("winston-daily-rotate-file");
const WhatsappTransport = require("./utils/WhatsappTransport");

const coolFormat = format.combine(
  format.timestamp({ format: "HH:mm:ss" }),
  format.colorize(),
  format.printf(({ timestamp, level, message, userId }) => {
    const user = userId ? ` - ${userId}` : "";
    return `[${timestamp}] (${level}): ${message}${user}`;
  }),
);

const boringFormat = format.combine(
  format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  format.json(),
);

const whatsappTransport = new WhatsappTransport({
  chatId: "120363407521951578@g.us",
  level: "error",
});

const logger = createLogger({
  level: "info",
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
    new transports.Console({ format: coolFormat }),
  ],
});

const setClient = (client) => {
  whatsappTransport.client = client;
};

module.exports = { logger, setClient };
