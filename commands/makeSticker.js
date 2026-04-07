const { logger } = require("../logger")

const ALLOWED_TYPES = [
  "image/gif",
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/heic",
  "image/heif",
  "video/mp4",
  "video/3gpp",
];

async function makeSticker(body, message, client) {
  logger.info("Making stickers", { userId: message.author });
  const media = await message.downloadMedia();

  if (!ALLOWED_TYPES.includes(media.mimetype)) {
    logger.warn(`File type is unsupported! (${media.mimetype})`, { userId: message.author });
    return await client.sendMessage(
      message.from,
      `tidak bisa membuat stiker dengan format ${media.mimetype}`,
    );
  }

  logger.debug("Sending sticker...", { userId: message.author });
  await client.sendMessage(message.from, media, {
    sendMediaAsSticker: true,
    stickerName: body?.slice(0, 128) || "sticker",
  });
  logger.info("Sticker is successfuly sent", { userId: message.author });

  return;
}

module.exports = { makeSticker };
