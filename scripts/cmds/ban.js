const { findUid } = global.utils;
const moment = require("moment-timezone");

module.exports = {
  config: {
    name: "ban",
    version: "2.0",
    author: "Ntkhang",
    countDown: 0,
    noPrefix: true,
    role: 1,
    vip: false,
    nixprefix: false,
    longDescription: {
      en: "Ban Users from box chat"
    },
    category: "boxchat",
    guide: {
      en: "   {pn} [@tag|uid|fb link|reply] [<reason>|leave blank if no reason]: Ban user from box chat"
        + "\n   {pn} check: Check banned members and kick them out of the box chat"
        + "\n   {pn} unban [@tag|uid|fb link|reply]: Unban user from box chat"
        + "\n   {pn} list: View the list of banned members"
    }
  },

  langs: {
    en: {
      notFoundTarget: "⛔|𝗜𝗻𝘃𝗮𝗹𝗶𝗱 𝗔𝗰𝘁𝗶𝗼𝗻\n━━━━━━━━━━\n\nPlease tag the person to ban or enter uid or fb link or reply to the message of the person to ban",
      notFoundTargetUnban: "⛔|𝗜𝗻𝘃𝗮𝗹𝗶𝗱 𝗔𝗰𝘁𝗶𝗼𝗻\n━━━━━━━━━━\n\nPlease tag the person to unban or enter uid or fb link or reply to the message of the person to unban",
      userNotBanned: "⛔|𝗡𝗼 𝗗𝗮𝘁𝗮\n━━━━━━━━━━\n\nThe person with id %1 is not banned from this box chat",
      unbannedSuccess: "✅|𝗨𝗻𝗯𝗮𝗻𝗻𝗲𝗱\n━━━━━━━━━━\n\nUnbanned %1 from box chat!",
      cantSelfBan: "⛔|𝗜𝗻𝘃𝗮𝗹𝗶𝗱 𝗔𝗰𝘁𝗶𝗼𝗻\n━━━━━━━━━━\n\nYou can't ban yourself!",
      cantBanAdmin: "⛔|𝗡𝗼 𝗣𝗲𝗿𝗺𝗶𝘀𝘀𝗶𝗼𝗻\n━━━━━━━━━━\n\nYou can't ban the administrator!",
      existedBan: "⛔|𝗕𝗮𝗻𝗻𝗲𝗱 𝗕𝗲𝗳𝗼𝗿𝗲\n━━━━━━━━━━\n\nThis person has been banned before!",
      noReason: "No reason found!",
      bannedSuccess: "✅|𝗕𝗮𝗻𝗻𝗲𝗱\n━━━━━━━━━━\n\nBanned %1 from box chat!",
      needAdmin: "⛔|𝗡𝗼 𝗣𝗲𝗿𝗺𝗶𝘀𝘀𝗶𝗼𝗻\n━━━━━━━━━━\n\nBot needs administrator permission to kick banned members",
      noName: "Facebook User",
      noData: "🔎|𝗡𝗼 𝗗𝗮𝘁𝗮\n━━━━━━━━━━\n\nThere are no banned members in this box chat",
      listBanned: "🔎|𝗕𝗮𝗻𝗻𝗲𝗱 𝗟𝗶𝘀𝘁\n━━━━━━━━━━\n\nList of banned members in this box chat (page %1/%2)",
      content: "%1/ %2 (%3)\nReason: %4\nBan time: %5",
      needAdminToKick: "⛔|𝗡𝗼 𝗣𝗲𝗿𝗺𝗶𝘀𝘀𝗶𝗼𝗻\n━━━━━━━━━━\n\nMember %1 (%2) has been banned from box chat, but the bot does not have administrator permission to kick this member, please grant administrator permission to the bot to kick this member",
      bannedKick: "⛔|𝗕𝗮𝗻𝗻𝗲𝗱 𝗨𝘀𝗲𝗿\n━━━━━━━━━━\n\n%1 has been banned from box chat before!\nUID: %2\nReason: %3\nBan time: %4\n\nBot has automatically kicked this member\n"
    }
  },

  onStart: async function ({ message, event, args, threadsData, getLang, usersData, api }) {
    const { members, adminIDs } = await threadsData.get(event.threadID);
    const { senderID } = event;
    let target;
    let reason;

    const dataBanned = await threadsData.get(event.threadID, 'data.banned_ban', []);

    if (args[0] == 'unban') {
      if (!isNaN(args[1]))
        target = args[1];
      else if (args[1]?.startsWith('https'))
        target = await findUid(args[1]);
      else if (Object.keys(event.mentions || {}).length)
        target = Object.keys(event.mentions)[0];
      else if (event.messageReply?.senderID)
        target = event.messageReply.senderID;
      else
        return api.sendMessage(getLang('notFoundTargetUnban'), event.threadID, event.messageID);

      const index = dataBanned.findIndex(item => item.id == target);
      if (index == -1)
        return api.sendMessage(getLang('userNotBanned', target), event.threadID, event.messageID);

      dataBanned.splice(index, 1);
      await threadsData.set(event.threadID, dataBanned, 'data.banned_ban');
      const userName = members[target]?.name || await usersData.getName(target) || getLang('noName');

      return api.sendMessage(getLang('unbannedSuccess', userName), event.threadID, event.messageID);
    }
    else if (args[0] == "check") {
      if (!dataBanned.length)
        return;
      for (const user of dataBanned) {
        if (event.participantIDs.includes(user.id))
          api.removeUserFromGroup(user.id, event.threadID);
      }
    }

    if (event.messageReply?.senderID) {
      target = event.messageReply.senderID;
      reason = args.join(' ');
    }
    else if (Object.keys(event.mentions || {}).length) {
      target = Object.keys(event.mentions)[0];
      reason = args.join(' ').replace(event.mentions[target], '');
    }
    else if (!isNaN(args[0])) {
      target = args[0];
      reason = args.slice(1).join(' ');
    }
    else if (args[0]?.startsWith('https')) {
      target = await findUid(args[0]);
      reason = args.slice(1).join(' ');
    }
    else if (args[0] == 'list') {
      if (!dataBanned.length)
        return message.reply(getLang('noData'));
      const limit = 20;
      const page = parseInt(args[1] || 1) || 1;
      const start = (page - 1) * limit;
      const end = page * limit;
      const data = dataBanned.slice(start, end);
      let msg = '';
      let count = 0;
      for (const user of data) {
        count++;
        const name = members[user.id]?.name || await usersData.getName(user.id) || getLang('noName');
        const time = user.time;
        msg += getLang('content', start + count, name, user.id, user.reason, time);
      }
      return message.reply(getLang('listBanned', page, Math.ceil(dataBanned.length / limit)) + '\n\n' + msg);
    }

    if (!target)
      return message.reply(getLang('notFoundTarget'));
    if (target == senderID)
      return message.reply(getLang('cantSelfBan'));
    if (adminIDs.includes(target))
      return message.reply(getLang('cantBanAdmin'));

    const banned = dataBanned.find(item => item.id == target);
    if (banned)
      return message.reply(getLang('existedBan'));

    const name = members[target]?.name || (await usersData.getName(target)) || getLang('noName');
    const time = moment().tz(global.GoatBot.config.timeZone).format('HH:mm:ss DD/MM/YYYY');
    const data = {
      id: target,
      time,
      reason: reason || getLang('noReason')
    };

    dataBanned.push(data);
    await threadsData.set(event.threadID, dataBanned, 'data.banned_ban');
    message.reply(getLang('bannedSuccess', name), () => {
      if (members.some(item => item.userID == target)) {
        if (adminIDs.includes(api.getCurrentUserID()))
          api.removeUserFromGroup(target, event.threadID);
        else
          message.send(getLang('needAdmin'), (err, info) => {
            global.GoatBot.onEvent.push({
              messageID: info.messageID,
              onStart: ({ event }) => {
                if (event.logMessageType === "log:thread-admins" && event.logMessageData.ADMIN_EVENT == "add_admin") {
                  const { TARGET_ID } = event.logMessageData;
                  if (TARGET_ID == api.getCurrentUserID()) {
                    api.removeUserFromGroup(target, event.threadID, () => global.GoatBot.onEvent = global.GoatBot.onEvent.filter(item => item.messageID != info.messageID));
                  }
                }
              }
            });
          });
      }
    });
  },

  onEvent: async function ({ event, api, threadsData, getLang, message }) {
    if (event.logMessageType == "log:subscribe") {
      const { threadID } = event;
      const dataBanned = await threadsData.get(threadID, 'data.banned_ban', []);
      const usersAdded = event.logMessageData.addedParticipants;

      for (const user of usersAdded) {
        const { userFbId, fullName } = user;
        const banned = dataBanned.find(item => item.id == userFbId);
        if (banned) {
          const reason = banned.reason || getLang('noReason');
          const time = banned.time;
          return api.removeUserFromGroup(userFbId, threadID, err => {
            if (err)
              return message.send(getLang('needAdminToKick', fullName, userFbId), (err, info) => {
                global.GoatBot.onEvent.push({
                  messageID: info.messageID,
                  onStart: ({ event }) => {
                    if (event.logMessageType === "log:thread-admins" && event.logMessageData.ADMIN_EVENT == "add_admin") {
                      const { TARGET_ID } = event.logMessageData;
                      if (TARGET_ID == api.getCurrentUserID()) {
                        api.removeUserFromGroup(userFbId, event.threadID, () => global.GoatBot.onEvent = global.GoatBot.onEvent.filter(item => item.messageID != info.messageID));
                      }
                    }
                  }
                });
              });
            else
              message.send(getLang('bannedKick', fullName, userFbId, reason, time));
          });
        }
      }
    }
  }
};
