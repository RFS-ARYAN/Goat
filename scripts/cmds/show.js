const fs = require("fs-extra");
const axios = require("axios");

const cachePath = __dirname + "/cache/show_cache.json";

async function saveToCache(key, content) {
  let cache = {};
  if (fs.existsSync(cachePath)) {
    cache = JSON.parse(fs.readFileSync(cachePath, "utf8"));
  }
  cache[key] = content;
  fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2));
}

async function getFromCache(key) {
  if (!fs.existsSync(cachePath)) return null;
  const cache = JSON.parse(fs.readFileSync(cachePath, "utf8"));
  return cache[key] || null;
}

module.exports = {
  config: {
    name: "show",
    version: "0.0.2",
    author: "ArYAN",
    role: 0,
    vip: false,
    nixprefix: false,
    shortDescription: "Show content from any URL",
    longDescription: "Reply to a message with a URL once and get content in parts with show 2, show 3, etc.",
    category: "utility",
    guide: {
      en: "Reply to a message containing a URL with 'show'. Then use 'show 2', 'show 3' to get the next parts."
    }
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, senderID, messageReply } = event;
    const part = parseInt(args[0]) || 1;
    const cacheKey = `${threadID}_${senderID}`;
    const limit = 1900;

    if (part === 1) {
      if (!messageReply || !messageReply.body) {
        return api.sendMessage("❌ Please reply to a message containing a URL to use 'show'.", threadID);
      }

      const urlMatch = messageReply.body.match(/https?:\/\/[^\s]+/);
      if (!urlMatch) return api.sendMessage("❌ No valid URL found in the replied message.", threadID);

      const url = urlMatch[0];

      try {
        const res = await axios.get(url);
        let content = res.data;
        if (typeof content !== "string") content = JSON.stringify(content, null, 2);

        await saveToCache(cacheKey, content);

        const sliced = content.slice(0, limit);
        const msg = `${sliced}`;
        return api.sendMessage(msg, threadID);
      } catch (err) {
        console.error(err);
        return api.sendMessage("❌ Failed to fetch content from the URL.", threadID);
      }
    } else {
      const cached = await getFromCache(cacheKey);
      if (!cached) {
        return api.sendMessage("❌ No previous data found. Please use 'show' by replying to a URL message first.", threadID);
      }

      const start = (part - 1) * limit;
      const end = part * limit;
      const slice = cached.slice(start, end);

      if (!slice) {
        return api.sendMessage("❌ No more content to show.", threadID);
      }

      let reply = `${slice}`;
      if (end < cached.length) reply += `\n\nType "show ${part + 1}" to view the next part.`;
      return api.sendMessage(reply, threadID);
    }
  }
};
