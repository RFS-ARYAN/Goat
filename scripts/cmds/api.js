const axios = require('axios');

module.exports = {
  config: {
    name: "apitest",
    aliases: ["api"],
    version: "0.0.1",
    author: "ArYAN",
    countDown: 5,
    role: 2,
    vip: false,
    nixprefix: false,
    description: {
      en: "Fetch API response from a given URL and display it"
    },
    category: "OWNER",
    guide: {
      en: "{pn} <url>: Fetch and display response from the provided API URL"
    }
  },

  onStart: async function ({ message, args }) {
    if (!args.length) {
      return message.reply("⚠ Please provide an API URL to test.");
    }

    const apiUrl = args.join(" ");

    try {
      const response = await axios.get(apiUrl);
      return message.reply(`${JSON.stringify(response.data, null, 2)}`);
    } catch (error) {
      return message.reply(`⚠ Error fetching the API response: ${error.message}`);
    }
  }
};
