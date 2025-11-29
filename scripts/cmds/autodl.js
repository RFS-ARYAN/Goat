const fs = require("fs-extra");
const axios = require("axios");
const request = require("request");

module.exports = {
  config: {
    name: "auto",
    version: "0.0.1",
    author: "ArYAN",
    countDown: 5,
    role: 0,
    vip: false,
    nixprefix: false,
    shortDescription: "Always active auto video download for any URL",
    category: "media"
  },

  onStart: async function ({ api, event }) {
    return api.sendMessage("✅ AutoLink Is running ", event.threadID);
  },

  onChat: async function ({ api, event }) {
    const threadID = event.threadID;
    const message = event.body;

    if (!message) return;

    const linkMatch = message.match(/(https?:\/\/[^\s]+)/);
    if (!linkMatch) return;

    const url = linkMatch[0];
    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    try {
      const response = await axios.get(
        `https://aryan-video-downloader.vercel.app/alldl?url=${encodeURIComponent(url)}`
      );
      const data = response.data.data || {};
      const videoUrl = data.videoUrl || data.high || data.low || null;
      if (!videoUrl) return;

      request(videoUrl)
        .pipe(fs.createWriteStream("video.mp4"))
        .on("close", () => {
          api.setMessageReaction("✅", event.messageID, () => {}, true);
          api.sendMessage(
            {
              body: "════『 AUTODL 』════\n\n✨ Here's your video! ✨",
              attachment: fs.createReadStream("video.mp4")
            },
            threadID,
            () => fs.unlinkSync("video.mp4")
          );
        });
    } catch (err) {
      api.sendMessage("❌ Failed to download video.", threadID, event.messageID);
    }
  }
};