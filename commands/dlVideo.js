const youtubedl = require("youtube-dl-exec");
const { MessageMedia } = require("whatsapp-web.js");
const { isValidUrl } = require("../utils/isValidUrl");
const { getMeta } = require("../utils/getMeta");
const { getSeconds } = require("../utils/getSeconds");
const fs = require("fs");
const { logger } = require("../logger");

async function dlVideo(message, client, args) {
  let filename;
  const tmpPath = `/tmp/${Date.now()}`;
  let processing;
  try {
    logger.info("Downloading video", { userId: message.author });
    processing = await message.reply("memproses url...");
    logger.debug("Processing URL", { userId: message.author });

    if (!isValidUrl(args)) {
      logger.warn(`Invalid URL (accepted ${args}`);
      await new Promise((resolve) => setTimeout(resolve, 500));
      await processing.edit(`url tidak valid (menerima ${args})`);
      return;
    }

    logger.debug("Starting download process...", { userId: message.author });
    await processing.edit("memulai proses download...");
    const dlProcess = youtubedl(args, {
      format: "mp4",
      abortOnError: true,
      noPlaylist: true,
      output: `${tmpPath}.mp4`,
    });

    logger.debug("Verifying video.", { userId: message.author });
    await processing.edit("memverifikasi video...");
    const meta = await getMeta(args);

    const secondDuration = getSeconds(meta.duration);
    if (secondDuration > 5460) {
      logger.warn(`Duration too long! (accepted ${secondDuration})`, {
        userId: message.author,
      });
      await processing.edit(`durasi terlalu panjang! (maks. 1:30:59)`);
      return;
    }

    logger.debug("Video has been verified.", { userId: message.author });
    await processing.edit(
      "video berhasil diverifikasi! menunggu download selesai...",
    );
    await dlProcess;

    logger.debug("Renaming files.", { userId: message.author });
    filename = meta.title.replace(/[\/\0]/g, "_").replace(/\_+/g, "_");
    fs.renameSync(`${tmpPath}.mp4`, `/tmp/${filename}.mp4`);

    logger.debug("Sending the file...", { userId: message.author });
    await processing.edit("mengirim file...");
    const audio = MessageMedia.fromFilePath(`/tmp/${filename}.mp4`);
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
      logger.warn(`Video was unavailable (accepted ${args})`, {
        userId: message.author,
      });
      await processing?.edit("video tidak tersedia");
    } else if (err.stderr?.includes("Private video")) {
      logger.warn("The video was private", { userId: message.author });
      await processing?.edit("video ini private");
    } else {
      await processing?.edit("terjadi kesalahan");
      logger.error(err.message, { messageId: message, stack: err.stack });
    }
  } finally {
    logger.debug("Deleting cache...", { userId: message.author });
    if (fs.existsSync(`${tmpPath}.mp4`)) fs.unlinkSync(`${tmpPath}.mp4`);
    if (fs.existsSync(`${tmpPath}.part`)) fs.unlinkSync(`${tmpPath}.part`);
    if (filename && fs.existsSync(`/tmp/${filename}.mp4`))
      fs.unlinkSync(`/tmp/${filename}.mp4`);
  }
}

module.exports = { dlVideo };
