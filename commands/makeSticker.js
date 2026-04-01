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

async function makeSticker(message, client) {
  console.log("Downloading media");
  const media = await message.downloadMedia();

  console.log("Checking media filetype");
  if (!ALLOWED_TYPES.includes(media.mimetype)) {
    console.log(`Media type is not recognized. received ${media.mimetype}`);
    await client.sendMessage(
      message.from,
      `tidak bisa membuat stiker dengan format ${media.mimetype}`,
    );
    return;
  }
  console.log("Media filetype is valid");

  console.log("Sending back the media as a sticker");
  await client.sendMessage(message.from, media, {
    sendMediaAsSticker: true,
    stickerName: message.body?.slice(0, 128) || "sticker",
  });

  return;
}

module.exports = { makeSticker };
