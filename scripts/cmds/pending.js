module.exports = {
  config: {
    name: "pending",
    aliases: ["pen"],
    version: "1.6",
    author: "ArYAN",
    countDown: 0,
    role: 2,
    vip: true,
    nixprefix: false,
    shortDescription: { en: "Manage pending group chats." },
    longDescription: { en: "Approve or deny pending group chat requests." },
    category: "owner"
  },

  langs: {
    en: {
      invaildNumber: "❌ Invalid Number: %1 is not a valid number.",
      cancelSuccess: "✅ Cancelled: Refused %1 pending thread(s).",
      approveSuccess: "✅ Approved: Successfully approved %1 thread(s).",
      cantGetPendingList: "❌ Error: Can't get the pending list. The bot may lack permissions.",
      returnListPending: "»>> PENDING GC <<«\n\nThere are %1 pending threads:\n\n%2\n\nTo approve a group, reply with its number(s). To cancel, reply with 'cancel [number(s)]'.",
      returnListClean: "✅ PENDING GC\n\nThere are no threads in the pending list."
    }
  },

  onReply: async function ({ api, event, Reply, getLang }) {
    if (String(event.senderID) !== String(Reply.author)) return;
    const { body, threadID, messageID } = event;
    const args = body.split(/\s+/).map(s => s.trim().toLowerCase());
    let count = 0;

    if (args[0] === "cancel" || args[0] === "c") {
      const indices = args.slice(1);
      if (indices.length === 0) return api.sendMessage("Please provide at least one number to cancel.", threadID, messageID);

      for (const singleIndex of indices) {
        if (isNaN(singleIndex) || singleIndex <= 0 || singleIndex > Reply.pending.length) {
          return api.sendMessage(getLang("invaildNumber", singleIndex), threadID, messageID);
        }
        try {
          await api.removeUserFromGroup(api.getCurrentUserID(), Reply.pending[singleIndex - 1].threadID);
          count++;
        } catch (e) {
          console.error(`Error removing bot from group ${Reply.pending[singleIndex - 1].threadID}:`, e);
        }
      }
      return api.sendMessage(getLang("cancelSuccess", count), threadID, messageID);
    } else {
      const indices = args;
      if (indices.length === 0) return api.sendMessage("Please provide at least one number to approve.", threadID, messageID);

      for (const singleIndex of indices) {
        if (isNaN(singleIndex) || singleIndex <= 0 || singleIndex > Reply.pending.length) {
          return api.sendMessage(getLang("invaildNumber", singleIndex), threadID, messageID);
        }
        
        let targetThread;
        try {
          targetThread = Reply.pending[singleIndex - 1];
          const senderID = event.senderID;
          const senderUserInfo = await api.getUserInfo(senderID);
          const approvedUserName = senderUserInfo[senderID]?.name;
          const mentions = [{
              tag: approvedUserName,
              id: senderID,
              fromIndex: "Approved by: ".length
          }];

          await api.sendMessage({
            body: `✅ Connected Bot\n\n🎀 Approved by: ${approvedUserName}`,
            mentions: mentions
          }, targetThread.threadID);
          
          count++;
        } catch (e) {
          console.error(`Error sending message to thread ${targetThread?.threadID}:`, e);
        }
      }
      return api.sendMessage(getLang("approveSuccess", count), threadID, messageID);
    }
  },

  onStart: async function ({ api, event, getLang, commandName }) {
    const { threadID, messageID } = event;
    let msg = "", index = 1;

    try {
      const spam = await api.getThreadList(100, null, ["OTHER"]) || [];
      const pending = await api.getThreadList(100, null, ["PENDING"]) || [];
      const list = [...spam, ...pending].filter(group => group.isSubscribed && group.isGroup);

      if (list.length === 0) {
        return api.sendMessage(getLang("returnListClean"), threadID, messageID);
      }
      
      for (const single of list) {
        msg += `${index++}/ ${single.name} (${single.threadID})\n`;
      }

      return api.sendMessage(getLang("returnListPending", list.length, msg), threadID, (err, info) => {
        if (err) return console.error(err);
        global.GoatBot.onReply.set(info.messageID, {
          commandName,
          messageID: info.messageID,
          author: event.senderID,
          pending: list
        });
      }, messageID);
    } catch (e) {
      console.error(e);
      return api.sendMessage(getLang("cantGetPendingList"), threadID, messageID);
    }
  }
};
