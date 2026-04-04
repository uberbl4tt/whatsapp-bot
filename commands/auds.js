const youtubedl = require("youtube-dl-exec");
const { yt } = require("./aud");
const { logger } = require("../logger");

async function yts(message, client, args) {
  logger.info("Searching for the audio...", { userId: message.from });
  const processing = await message.reply("mencari audio");

  const info = await youtubedl(`ytsearch:${args}`, {
    getId: true,
    noPlaylist: true,
    print: "title,duration",
  });
  if (!info) {
    logger.warn("Cannot find the audio", { userId: message.from });
    return await processing.reply("tidak bisa menemukan audio");
  }

  logger.debug("Found the audio!", { userId: message.from });
  const [title, duration, id] = info.split("\n");
  logger.debug("Video metadata", {
    userId: message.from,
    title,
    duration,
    id,
  });

  await processing.edit(`menemukan "${title}"`);
  logger.debug("Sending metadata to yt-dlp...")
  yt(message, client, `https://www.youtube.com/watch?v=${id}`, processing, {
    title,
    duration,
  });
}

module.exports = { yts };
