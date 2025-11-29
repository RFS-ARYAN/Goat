const axios = require("axios");

module.exports = {
  config: {
    name: "imgur",
    version: "1.0.0",
    author: "ArYAN",
    countDown: 0,
    role: 0,
    vip: false,
    nixprefix: false,
    shortDescription: "Upload an image/video to Imgur",
    longDescription: "Reply to an image/video or provide a URL to upload it to Imgur.",
    category: "utility",
    guide: "{pn} reply to an image/video or provide a URL"
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID, messageReply } = event;
    let mediaUrl = "";

    if (messageReply && messageReply.attachments.length > 0) {
      mediaUrl = messageReply.attachments[0].url;
    } else if (args.length > 0) {
      mediaUrl = args.join(" ");
    }

    if (!mediaUrl) {
      return api.sendMessage("❌ Please reply to an image/video or provide a URL!", threadID, messageID);
    }

    try {
      api.setMessageReaction("⏳", messageID, () => {}, true);

      const res = await axios.get(`http://65.109.80.126:20409/aryan/imgur?url=${encodeURIComponent(mediaUrl)}`);
      const imgurLink = res.data.imgur;

      if (!imgurLink) {
        api.setMessageReaction("", messageID, () => {}, true);
        return api.sendMessage("❌ Failed to upload to Imgur.", threadID, messageID);
      }

      api.setMessageReaction("✅", messageID, () => {}, true);
      return api.sendMessage(`${imgurLink}`, threadID, messageID);

    } catch (err) {
      console.error("Imgur upload error:", err);
      api.setMessageReaction("", messageID, () => {}, true);
      return api.sendMessage("⚠️ An error occurred while uploading.", threadID, messageID);
    }
  }
};
