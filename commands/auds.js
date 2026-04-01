const youtubedl = require("youtube-dl-exec");
const { yt } = require("./aud");

async function yts(message, client, args) {
  const processing = await message.reply("mencari audio");

  const info = await youtubedl(`ytsearch:${args}`, {
    getId: true,
    noPlaylist: true,
    print: "title,duration",
  });

  const [title, duration, id] = info.split("\n");

  await processing.edit(`menemukan "${title}"`);
  yt(message, client, `https://www.youtube.com/watch?v=${id}`, processing, {
    title,
    duration,
  });
}

module.exports = { yts };
