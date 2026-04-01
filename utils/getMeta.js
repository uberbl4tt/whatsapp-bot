const youtubedl = require("youtube-dl-exec");

async function getMeta(url) {
  const meta = await youtubedl(url, {
    print: "title,duration",
    noPlaylist: true,
  });

  const [title, duration] = meta.split("\n");

  return { title, duration };
}

module.exports = { getMeta };
