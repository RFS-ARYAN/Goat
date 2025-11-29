const { writeFileSync, readFileSync, existsSync, mkdirSync } = require("fs-extra");
const path = require("path");

const tmpDir = path.join(__dirname, "tmp");
const noPrefixDataFile = path.join(tmpDir, "noprefix.json");

if (!existsSync(tmpDir)) mkdirSync(tmpDir, { recursive: true });

function loadNoPrefixData() {
  if (existsSync(noPrefixDataFile)) {
    try {
      return JSON.parse(readFileSync(noPrefixDataFile, "utf-8"));
    } catch {
      return [];
    }
  }
  return [];
}

function saveNoPrefixData(data) {
  writeFileSync(noPrefixDataFile, JSON.stringify(data, null, 2), "utf-8");
}

function rep(str, cmd) {
  return str.replace("{cmd}", cmd);
}

module.exports = {
  config: {
    name: "npx",
    version: "0.0.1",
    author: "ArYAN",
    countDown: 3,
    role: 2,
    vip: true,
    nixprefix: false,
    description: { en: "Manage nixprefix commands" },
    category: "owner"
  },

  langs: {
    en: {
      invalidOption:
        "❌ | Invalid option!\n\n📋 Available options:\n• add <cmdName> - Add command to nixprefix\n• remove <cmdName> - Remove command from nixprefix\n• list - Show all nixprefix commands\n• loadall - Load all nixprefix commands",
      missingCmdName: "⚠️ | Please provide command name!",
      cmdNotFound: "❌ | Command not found: {cmd}",
      alreadyNoPrefix: "⚠️ | {cmd} already in nixprefix list!",
      addSuccess:
        "✅ | Added {cmd} to nixprefix list!\n\n💡 Use '×npx loadall' to activate all nixprefix commands.",
      notInList: "⚠️ | {cmd} not in nixprefix list!",
      removeSuccess: "✅ | Removed {cmd} from nixprefix list!",
      emptyList: "🧘 | nixPrefix list is empty!"
    }
  },

  onStart: async function ({ message, args, getLang, commandName }) {
    const { commands, onChat } = global.GoatBot;

    if (!args || args.length === 0) return message.reply(getLang("invalidOption"));

    const option = args[0].toLowerCase();
    const cmdName = args[1]?.toLowerCase();

    switch (option) {
      case "add":
      case "-a": {
        if (!cmdName) return message.reply(getLang("missingCmdName"));
        if (!commands.has(cmdName)) return message.reply(rep(getLang("cmdNotFound"), cmdName));

        const list = loadNoPrefixData();
        if (list.includes(cmdName)) return message.reply(rep(getLang("alreadyNoPrefix"), cmdName));

        list.push(cmdName);
        saveNoPrefixData(list);

        return message.reply(rep(getLang("addSuccess"), cmdName));
      }

      case "remove":
      case "-r": {
        if (!cmdName) return message.reply(getLang("missingCmdName"));

        const list = loadNoPrefixData();
        const index = list.indexOf(cmdName);

        if (index === -1) return message.reply(rep(getLang("notInList"), cmdName));

        list.splice(index, 1);
        saveNoPrefixData(list);

        if (onChat.includes(cmdName)) onChat.splice(onChat.indexOf(cmdName), 1);

        return message.reply(rep(getLang("removeSuccess"), cmdName));
      }

      case "list":
      case "-l": {
        const list = loadNoPrefixData();
        if (list.length === 0) return message.reply(getLang("emptyList"));

        let msg = "🧘 | nixPrefix Commands List\n\n";
        list.forEach((cmd, i) => (msg += `${i + 1}. ${cmd}\n`));

        return message.reply(msg);
      }

      case "loadall":
      case "-la": {
        const list = loadNoPrefixData();
        if (list.length === 0) return message.reply("⚠️ | No nixprefix commands to load!");

        for (const name of list) {
          try {
            const cmd = commands.get(name);
            if (!cmd) continue;

            if (!cmd.onChat && cmd.onStart && !cmd._noPrefixWrapper) {
              cmd._noPrefixWrapper = true;

              cmd.onChat = async function (params) {
                const { event } = params;
                const body = (event.body || "").trim();
                const lower = body.toLowerCase();

                const aliases = cmd.config?.aliases || [];
                const all = [name, ...aliases];

                for (const a of all) {
                  const al = a.toLowerCase();
                  if (lower === al) return await cmd.onStart({ ...params, args: [] });
                  if (lower.startsWith(al + " ")) {
                    const raw = body.substring(al.length + 1).trim();
                    const args2 = raw ? raw.split(/ +/) : [];
                    return await cmd.onStart({ ...params, args: args2 });
                  }
                }
              };
            }

            if (!onChat.includes(name)) onChat.push(name);
            if (cmd.config) cmd.config.noPrefix = true;
          } catch {}
        }

        return message.reply(`✅ | Loaded ${list.length} nixprefix commands successfully!`);
      }

      default:
        return message.reply(getLang("invalidOption"));
    }
  }
};
