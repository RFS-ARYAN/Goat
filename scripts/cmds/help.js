const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");
const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;

module.exports = {
  config: {
    name: "help",
    version: "0.0.8",
    author: "ArYAN",
    countDown: 5,
    role: 0,
    vip: false,
    nixprefix: false,
    shortDescription: {
      en: "View command usage and list all commands directly"
    },
    longDescription: {
      en: "View command usage and list all commands directly"
    },
    category: "info",
    guide: {
      en: "{pn} / help cmdName"
    },
    priority: 1
  },

  onStart: async function ({ message, args, event, threadsData, role }) {
    const { threadID } = event;
    const threadData = await threadsData.get(threadID);
    const prefix = getPrefix(threadID);

    const toBold = (text) => {
      const map = {
        A: "𝗔", B: "𝗕", C: "𝗖", D: "𝗗", E: "𝗘", F: "𝗙", G: "𝗚", H: "𝗛", I: "𝗜", J: "𝗝",
        K: "𝗞", L: "𝗟", M: "𝗠", N: "𝗡", O: "𝗢", P: "𝗣", Q: "𝗤", R: "𝗥", S: "𝗦", T: "𝗧",
        U: "𝗨", V: "𝗩", W: "𝗪", X: "𝗫", Y: "𝗬", Z: "𝗭",
        a: "𝗮", b: "𝗯", c: "𝗰", d: "𝗱", e: "𝗲", f: "𝗳", g: "𝗴", h: "𝗵", i: "𝗶", j: "𝗷",
        k: "𝗸", l: "𝗹", m: "𝗺", n: "𝗻", o: "𝗼", p: "𝗽", q: "𝗾", r: "𝗿", s: "𝘀", t: "𝘁",
        u: "𝘂", v: "𝘃", w: "𝘄", x: "𝘅", y: "𝘆", z: "𝘇"
      };
      return [...text].map(c => map[c] || c).join("");
    };

    const toSans = (text) => {
      const map = {
        a: "𝖺", b: "𝖻", c: "𝖼", d: "𝖽", e: "𝖾", f: "𝖿", g: "𝗀", h: "𝗁", i: "𝗂", j: "𝗃",
        k: "𝗄", l: "𝗅", m: "𝗆", n: "𝗇", o: "𝗈", p: "𝗉", q: "𝗊", r: "𝗋", s: "𝗌", t: "𝗍",
        u: "𝗎", v: "𝗏", w: "𝗐", x: "𝗑", y: "𝗒", z: "𝗓"
      };
      return [...text].map(c => map[c] || c).join("");
    };

    if (args.length === 0) {
      const categories = {};
      let msg = `💜 ${toBold("Nix Bot commands")} 🧡\n`;

      for (const [name, value] of commands) {
        if (value.config.role > 1 && role < value.config.role) continue;
        const category = value.config.category || "Uncategorized";
        categories[category] = categories[category] || { commands: [] };
        categories[category].commands.push(name);
      }

      Object.keys(categories).forEach((category) => {
        if (category !== "info") {
          msg += `\n🔸 ${toBold(category.toUpperCase())}\n`;
          const names = categories[category].commands.sort();
          for (let i = 0; i < names.length; i += 3) {
            const cmds = names.slice(i, i + 3).map((cmd) => `• ${toSans(cmd)}`);
            msg += `${cmds.join("    ")}\n`;
          }
        }
      });

      await message.reply({ body: msg });
    } else {
      const commandName = args[0].toLowerCase();
      const command = commands.get(commandName) || commands.get(aliases.get(commandName));

      if (!command) {
        await message.reply(`❌ Command "${commandName}" not found.`);
      } else {
        const configCommand = command.config;
        const author = configCommand.author || "Unknown";
        const longDescription = configCommand.longDescription?.en || "No description";
        const guideBody = configCommand.guide?.en || "No guide available.";
        const usage = guideBody.replace(/{p}/g, prefix).replace(/{n}/g, configCommand.name);

        const response = `╭── ${toBold("COMMAND DETAILS")} ──⭓
│ ${toBold("Name")}: ${toSans(configCommand.name)}
│ ${toBold("Description")}: ${toSans(longDescription)}
│ ${toBold("Aliases")}: ${toSans(configCommand.aliases?.join(", ") || "None")}
│ ${toBold("Version")}: ${toSans(configCommand.version || "1.0")}
│ ${toBold("Role")}: ${toSans(configCommand.role.toString())}
│ ${toBold("Cooldown")}: ${toSans(`${configCommand.countDown || 1}s`)}
│ ${toBold("Author")}: ${toSans(author)}
│ ${toBold("Usage")}: ${toSans(usage)}
╰────────────⭓`;

        await message.reply(response);
      }
    }
  }
};
