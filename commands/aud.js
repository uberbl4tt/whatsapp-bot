const youtubedl = require("youtube-dl-exec");
const { MessageMedia } = require("whatsapp-web.js");
const { isValidUrl } = require("../utils/isValidUrl");
const { getMeta } = require("../utils/getMeta");
const { getSeconds } = require("../utils/getSeconds");
const fs = require("fs");

async function yt(
  message,
  client,
  args,
  pastProcessing = null,
  pastInfo = null,
) {
  console.log(args);
  const start = Date.now();
  let filename;
  const tmpPath = `/tmp/${Date.now()}`;
  let processing;
  try {
    processing = pastProcessing ?? (await message.reply("memproses url..."));
    console.log("processing object:", processing); // is it defined?

    if (!isValidUrl(args)) {
      console.log("invalid url detected");
      await new Promise((resolve) => setTimeout(resolve, 500));
      await processing.edit(`url tidak valid (menerima ${args})`);
      return;
    }

    await processing.edit("memulai proses download...");
    const dlProcess = youtubedl(args, {
      extractAudio: true,
      abortOnError: true,
      audioFormat: "mp3",
      noPlaylist: true,
      output: `${tmpPath}.mp3`,
    });

    await processing.edit("memverifikasi video...");
    const meta = pastInfo ?? (await getMeta(args));

    if (getSeconds(meta.duration) > 5460) {
      await processing.edit(`durasi terlalu panjang! (maks. 1:30:59)`);
      return;
    }

    await processing.edit(
      "video berhasil diverifikasi! menunggu download selesai...",
    );
    await dlProcess;

    filename = meta.title.replace(/[\/\0]/g, "_").replace(/\_+/g, "_");
    fs.renameSync(`${tmpPath}.mp3`, `/tmp/${filename}.mp3`);

    await processing.edit("mengirim file...");
    const audio = MessageMedia.fromFilePath(`/tmp/${filename}.mp3`);
    await client.sendMessage(message.from, audio, {
      sendMediaAsDocument: true,
    });

    await processing.edit("selesai!");
    console.log(`Done in ${(Date.now() - start) / 1000}s`);
  } catch (err) {
    console.log(`===ERROR DETECTED!!!!!!!\n${err}`);
    if (
      err.stderr?.includes("Unsupported URL") ||
      err.stderr?.includes("Unable to extract")
    ) {
      await processing?.edit(`url tidak valid (menerima ${args})`);
    } else if (err.stderr?.includes("Video unavailable")) {
      await processing?.edit("video tidak tersedia!");
    } else if (err.stderr?.includes("Private video")) {
      await processing?.edit("video ini private!");
    } else {
      await processing?.edit("terjadi kesalahan!");
      console.error(err);
    }
  } finally {
    if (fs.existsSync(`${tmpPath}.mp3`)) fs.unlinkSync(`${tmpPath}.mp3`);
    if (fs.existsSync(`${tmpPath}.webm`)) fs.unlinkSync(`${tmpPath}.webm`);
    if (filename && fs.existsSync(`/tmp/${filename}.mp3`))
      fs.unlinkSync(`/tmp/${filename}.mp3`);
  }
}

module.exports = { yt };
