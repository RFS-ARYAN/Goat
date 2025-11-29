const axios = require("axios");

module.exports = {
  config: {
    name: "gcinfo",
    version: "0.0.5",
    author: "ArYAN",
    role: 0,
    vip: false,
    nixprefix: false,
    shortDescription: "Group info and settings",
    longDescription: "Control and view group info like name, image, link, admins",
    category: "group",
    guide: {
      en: "{pn} [-name | -image | -a | -r | -link]"
    }
  },

  onStart: async function ({ api, event, args }) {
    const threadID = event.threadID;
    const messageID = event.messageID;
    const mention = Object.keys(event.mentions || {})[0];
    const botID = api.getCurrentUserID();

    const info = await api.getThreadInfo(threadID);
    const admins = info.adminIDs.map(i => i.id);
    const botIsAdmin = admins.includes(botID);

    if (args[0] === "-name") {
      const name = args.slice(1).join(" ");
      if (!name) return api.sendMessage("❌ Provide a new name.", threadID);
      return api.setTitle(name, threadID, err => {
        if (err) return api.sendMessage("❌ Failed to change name.", threadID);
        return api.sendMessage(`✅ Group name changed to: ${name}`, threadID);
      });

    } else if (args[0] === "-image") {
      if (!botIsAdmin) return api.sendMessage("❌ Bot must be admin to change group image.", threadID);

      let imageURL = args[1];

      // Check for reply with image
      if (!imageURL && event.messageReply && event.messageReply.attachments.length > 0) {
        const attachment = event.messageReply.attachments[0];
        if (attachment.type === "photo") imageURL = attachment.url;
      }

      if (!imageURL) return api.sendMessage("❌ Provide a direct image URL or reply to an image.", threadID);

      try {
        const response = await axios.get(imageURL, { responseType: "stream" });
        await api.changeGroupImage(response.data, threadID);
        return api.sendMessage("✅ Group image changed!", threadID);
      } catch {
        return api.sendMessage("❌ Failed to set image. Use a valid direct image link (jpg/png) or reply to an image.", threadID);
      }

    } else if (args[0] === "-a") {
      if (!mention) return api.sendMessage("❌ Mention someone to add as admin.", threadID);
      if (!botIsAdmin) return api.sendMessage("❌ Bot must be admin.", threadID);
      try {
        await api.changeAdminStatus(threadID, mention, true);
        return api.sendMessage("✅ Admin added.", threadID);
      } catch {
        return api.sendMessage("❌ Failed to add admin.", threadID);
      }

    } else if (args[0] === "-r") {
      if (!mention) return api.sendMessage("❌ Mention someone to remove from admin.", threadID);
      if (!botIsAdmin) return api.sendMessage("❌ Bot must be admin.", threadID);
      try {
        await api.changeAdminStatus(threadID, mention, false);
        return api.sendMessage("✅ Admin removed.", threadID);
      } catch {
        return api.sendMessage("❌ Failed to remove admin.", threadID);
      }

    } else if (args[0] === "-link") {
      try {
        const updated = await api.getThreadInfo(threadID);
        const link = updated?.inviteLink;
        if (!link) return api.sendMessage("❌ Group link not available.", threadID);
        return api.sendMessage(`🔗 Group Link:\n${link}`, threadID);
      } catch {
        return api.sendMessage("❌ Couldn't fetch group link.", threadID);
      }

    } else {
      const adminList = admins.join(", ") || "None";
      const msg =
`=== [📌 GROUP INFO] ===

📛 Name: ${info.threadName}
👑 Admins: ${adminList}
🖼️ Image: ${info.imageSrc ? "Set" : "Not set"}

Use:
- gcinfo -name <text> ✏️ Change name
- gcinfo -image <url> or reply 🖼️ Change image
- gcinfo -a @mention 👑 Add admin
- gcinfo -r @mention ❌ Remove admin
- gcinfo -link 🔗 Get group link

======================`;

      return api.sendMessage(msg, threadID);
    }
  }
};