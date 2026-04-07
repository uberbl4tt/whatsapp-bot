const youtubedl = require("youtube-dl-exec");
const { MessageMedia } = require("whatsapp-web.js");
const { isValidUrl } = require("../utils/isValidUrl");
const { getMeta } = require("../utils/getMeta");
const { getSeconds } = require("../utils/getSeconds");
const fs = require("fs");
const { logger } = require("../logger");

async function yt(
  message,
  client,
  args,
  pastProcessing = null,
  pastInfo = null,
) {
  let filename;
  const tmpPath = `/tmp/${Date.now()}`;
  let processing;
  try {
    logger.info("Processing url", { userId: message.author });
    processing = pastProcessing ?? (await message.reply("memproses url..."));

    if (!isValidUrl(args)) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      await processing.edit(`url tidak valid (menerima ${args})`, {
        userId: message.author,
      });
      logger.warn(`Invalid URL detected (accepted ${args}).`);
      return;
    }

    logger.debug(`URL is valid. Starting download process from ${args}`, {
      userId: message.author,
    });
    logger.info("Downloading file.", { userId: message.author });
    await processing.edit("memulai proses download...");
    const dlProcess = youtubedl(args, {
      extractAudio: true,
      abortOnError: true,
      audioFormat: "mp3",
      noPlaylist: true,
      output: `${tmpPath}.mp3`,
    });

    logger.debug("Verifying video while downloading.", { userId: message.author });
    await processing.edit("memverifikasi video...");
    const meta = pastInfo ?? (await getMeta(args));

    const secondDuration = getSeconds(meta.duration);
    if (secondDuration > 5460) {
      logger.warn(`Duration is too long (accepted ${secondDuration})`, {
        userId: message.author,
      });
      await processing.edit(`durasi terlalu panjang! (maks. 1:30:59)`);
      return;
    }

    logger.debug(
      "Video has already been verified, waiting for the download to finish.",
      { userId: message.author },
    );
    await processing.edit(
      "video berhasil diverifikasi! menunggu download selesai...",
    );
    await dlProcess;

    logger.debug("Renaming the file", { userId: message.author });
    filename = meta.title.replace(/[\/\0]/g, "_").replace(/\_+/g, "_");
    fs.renameSync(`${tmpPath}.mp3`, `/tmp/${filename}.mp3`);

    logger.debug("Sending the file...", { userId: message.author });
    await processing.edit("mengirim file...");

    const audio = MessageMedia.fromFilePath(`/tmp/${filename}.mp3`);
    await client.sendMessage(message.from, audio, {
      sendMediaAsDocument: true,
    });
    logger.info("File is sent, closing the task...", { userId: message.author });

    await processing.edit("selesai!");
  } catch (err) {
    if (
      err.stderr?.includes("Unsupported URL") ||
      err.stderr?.includes("Unable to extract")
    ) {
      logger.warn(`URL is invalid (accepted ${args})`, {
        userId: message.author,
      });
      await processing?.edit(`url tidak valid (menerima ${args})`);
    } else if (err.stderr?.includes("Video unavailable")) {
      logger.warn("Video was not found.", { userId: message.author });
      await processing?.edit("video tidak tersedia!");
    } else if (err.stderr?.includes("Private video")) {
      logger.warn("The video was private", { userId: message.author });
      await processing?.edit("video ini private!");
    } else {
      await processing?.edit("terjadi kesalahan!");
            logger.error(err.message, { messageId: message, stack: err.stack })
;
    }
  } finally {
    logger.debug("Deleting cache...", { userId: message.author });
    if (fs.existsSync(`${tmpPath}.mp3`)) fs.unlinkSync(`${tmpPath}.mp3`);
    if (fs.existsSync(`${tmpPath}.webm`)) fs.unlinkSync(`${tmpPath}.webm`);
    if (filename && fs.existsSync(`/tmp/${filename}.mp3`))
      fs.unlinkSync(`/tmp/${filename}.mp3`);
  }
}

module.exports = { yt };
