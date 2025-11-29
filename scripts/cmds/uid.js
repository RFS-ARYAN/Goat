module.exports = {
  config: {
    name: "uid",
    version: "0.0.1",
    author: "ArYAN",
    description: "Show Facebook UID",
    usage: "uid | uid @tag | reply uid",
    cooldown: 3,
    role: 0,
    vip: false,
    nixprefix: false,
    category: "info"
  },

  onStart: async function ({ api, event }) {
    const { threadID, messageID, senderID, messageReply, mentions } = event;
    let target = senderID;
    if (messageReply?.senderID) target = messageReply.senderID;
    else if (mentions && Object.keys(mentions).length) target = Object.keys(mentions)[0];
    api.sendMessage(`${target}`, threadID, messageID);
  }
};