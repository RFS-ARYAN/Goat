const axios = require("axios");
const cheerio = require("cheerio");

module.exports = {
  config: {
    name: "covidbd",
    version: "0.0.1",
    author: "ArYAN",
    role: 0,
    vip: false,
    nixprefix: false,
    description: "Latest COVID-19 stats for Bangladesh",
    usage: "covidbd",
    category: "utility",
    cooldown: 5
  },

  onStart: async function ({ api, event }) {
    const { threadID, messageID } = event;

    try {
      const { data: html } = await axios.get("https://dashboard.dghs.gov.bd/pages/covid19.php");
      const $ = cheerio.load(html);

      const getStat = sel => $(sel).find(".value").text().trim();

      const top = {
        tests: getStat(".total-cases"),
        confirmed: getStat(".total-recovered"),
        recovered: getStat(".active-cases"),
        deaths: getStat(".total-deaths")
      };

      const cur = {
        tests: $(".hourly-section .stats-column:first .tests-mini .mini-stat-value").text().trim(),
        confirmed: $(".hourly-section .stats-column:first .confirmed-mini .mini-stat-value").text().trim(),
        recovered: $(".hourly-section .stats-column:first .recovered-mini .mini-stat-value").text().trim(),
        deaths: $(".hourly-section .stats-column:first .deaths-mini .mini-stat-value").text().trim()
      };

      const last = {
        tests: $(".hourly-section .stats-column:last .tests-mini .mini-stat-value").text().trim(),
        confirmed: $(".hourly-section .stats-column:last .confirmed-mini .mini-stat-value").text().trim(),
        recovered: $(".hourly-section .stats-column:last .recovered-mini .mini-stat-value").text().trim(),
        deaths: $(".hourly-section .stats-column:last .deaths-mini .mini-stat-value").text().trim()
      };

      const reply =
        "বাংলাদেশে কোভিড-১৯ আপডেট\n\n" +
        "মোট পরিসংখ্যান:\n" +
        `• মোট পরীক্ষা: ${top.tests || "তথ্য নেই"}\n` +
        `• মোট শনাক্ত: ${top.confirmed || "তথ্য নেই"}\n` +
        `• মোট সুস্থ: ${top.recovered || "তথ্য নেই"}\n` +
        `• মোট মৃত্যু: ${top.deaths || "তথ্য নেই"}\n\n` +
        "সাম্প্রতিক সময়কাল (Jan 1 – Jun 15):\n" +
        `• পরীক্ষা: ${cur.tests || "তথ্য নেই"}\n` +
        `• শনাক্ত: ${cur.confirmed || "তথ্য নেই"}\n` +
        `• সুস্থ: ${cur.recovered || "তথ্য নেই"}\n` +
        `• মৃত্যু: ${cur.deaths || "তথ্য নেই"}\n\n` +
        "গত ২৪ ঘণ্টা:\n" +
        `• পরীক্ষা: ${last.tests || "তথ্য নেই"}\n` +
        `• শনাক্ত: ${last.confirmed || "তথ্য নেই"}\n` +
        `• সুস্থ: ${last.recovered || "তথ্য নেই"}\n` +
        `• মৃত্যু: ${last.deaths || "তথ্য নেই"}`;

      return api.sendMessage(reply, threadID, messageID);
    } catch {
      return api.sendMessage("❌ Failed to fetch COVID-19 data. Please try again later.", threadID, messageID);
    }
  }
};