module.exports = {
  config: {
    name: "listbox",
    version: "1.0.0",
    author: "ArYAN",
    role: 2,
    vip: false,
    nixprefix: false,
    countDown: 10,
    shortDescription: {
      en: "List all groups bot is in",
    },
    longDescription: {
      en: "Shows all group names and their thread IDs where the bot is a member.",
    },
    category: "system",
    guide: {
      en: "{pn}",
    },
  },

  onStart: async function ({ api, event }) {
    try {
      const threads = await api.getThreadList(100, null, ["INBOX"]);
      const groupThreads = threads.filter(
        (t) => t.isGroup && t.name && t.threadID
      );

      if (groupThreads.length === 0) {
        return api.sendMessage("❌ No groups found.", event.threadID, event.messageID);
      }

      let msg = `🎯 𝗧𝗼𝘁𝗮𝗹 𝗚𝗿𝗼𝘂𝗽𝘀: ${groupThreads.length}\n━━━━━━━━━━━━━━\n`;

      groupThreads.forEach((group, index) => {
        msg += `📦 𝗚𝗿𝗼𝘂𝗽 ${index + 1}:\n`;
        msg += `📌 𝗡𝗮𝗺𝗲: ${group.name}\n`;
        msg += `🆔 𝗧𝗵𝗿𝗲𝗮𝗱 𝗜𝗗: ${group.threadID}\n`;
        msg += `━━━━━━━━━━━━━━\n`;
      });

      await api.sendMessage(msg, event.threadID, event.messageID);
    } catch (error) {
      return api.sendMessage(
        `⚠️ Error while fetching group list:\n${error.message}`,
        event.threadID,
        event.messageID
      );
    }
  },
};
