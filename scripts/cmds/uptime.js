const os = require("os");
const pr = require("process");
const f = require("fs");
const pkg = require("../../package.json");
let createCanvas;
try {
  createCanvas = require("canvas").createCanvas;
} catch (err) {
  createCanvas = null;
}
const p = require("path");

module.exports = {
  config: {
    name: "uptime",
    aliases: ["upt", "status", "up"],
    version: "0.0.2",
    author: "ArYAN",
    cooldown: 5,
    role: 0,
    vip: false,
    nixprefix: false,
    category: "utility",
    guide: "{p}uptime",
    description: "Show detailed info about the bot and server",
  },

  onStart: async function ({ api, event }) {
    try {
      const systemUptime = os.uptime();
      const botUptime = process.uptime();
      const systemUptimeFormatted = formatUptime(systemUptime);
      const botUptimeFormatted = formatUptime(botUptime);

      const cpus = os.cpus();
      const cpuModel = cpus[0].model;
      const cpuCores = cpus.length;

      const totalMem = os.totalmem() / 1024 / 1024;
      const freeMem = os.freemem() / 1024 / 1024;
      const usedMem = totalMem - freeMem;
      const ramPercent = usedMem / totalMem;

      const platform = `${os.platform()} (${os.arch()})`;
      const nodeVersion = pr.version;
      const hostname = os.hostname();

      const start = Date.now();
      await new Promise((res) => setTimeout(res, 20));
      const ping = Date.now() - start;

      const memUsage = process.memoryUsage();
      const heapUsed = (memUsage.heapUsed / 1024 / 1024).toFixed(1);

      const text =
        `━━━━ GoatBot Status ━━━━\n\n` +
        `⏰ Bot Uptime: ${botUptimeFormatted}\n` +
        `🖥️ System Uptime: ${systemUptimeFormatted}\n` +
        `💻 CPU: ${cpuModel} (${cpuCores} cores)\n` +
        `📊 RAM: ${usedMem.toFixed(1)} / ${totalMem.toFixed(1)} MB (${(ramPercent * 100).toFixed(1)}%)\n` +
        `🔧 Platform: ${platform}\n` +
        `📦 Node.js: ${nodeVersion}\n` +
        `🏠 Host: ${hostname}\n` +
        `📡 Ping: ${ping} ms\n` +
        `💾 Memory (Bot): ${heapUsed} MB\n` +
        `👨‍💻 Developer: Aryan Rayhan\n\n` +
        `━━━━━━━━━━━━━━━━━━━━`;

      api.sendMessage(text, event.threadID, event.messageID);

    } catch (err) {
      console.error("uptime.js error:", err);
      api.sendMessage("❌ | Failed to get bot status.", event.threadID, event.messageID);
    }

    function formatUptime(seconds) {
      const d = Math.floor(seconds / 86400);
      const h = Math.floor((seconds % 86400) / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = Math.floor(seconds % 60);
      return `${d}d ${h}h ${m}m ${s}s`;
    }

    function roundRect(ctx, x, y, w, h, r, fill, stroke) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
      if (fill) ctx.fill();
      if (stroke) ctx.stroke();
    }

    function drawCircularRam(ctx, x, y, radius, percent, color) {
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI);
      ctx.fillStyle = "#1f2f3c";
      ctx.fill();

      ctx.beginPath();
      ctx.arc(x, y, radius, -Math.PI / 2, (2 * Math.PI * percent) - Math.PI / 2);
      ctx.strokeStyle = color;
      ctx.lineWidth = 20;
      ctx.shadowColor = color;
      ctx.shadowBlur = 30;
      ctx.stroke();
      ctx.shadowBlur = 0;

      ctx.fillStyle = "#eeeeee";
      ctx.font = "20px sans-serif";
      ctx.fillText("RAM Usage", x - 55, y - 10);
      ctx.font = "bold 26px sans-serif";
      ctx.fillText(`${(percent * 100).toFixed(1)}%`, x - 47, y + 25);
    }
  },
};
