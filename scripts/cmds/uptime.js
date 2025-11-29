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

      const width = 1200, height = 750;
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");

      const bg = "#0b0f1c";
      const glow = "#00ffe1";
      const accentBlue = "#33ccff";
      const accentGreen = "#33ff99";
      const developerColor = "#ff8800";
      const softWhite = "#eeeeee";

      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, width, height);
      ctx.shadowColor = glow;
      ctx.shadowBlur = 60;
      ctx.fillStyle = "#111a25";
      roundRect(ctx, 80, 50, 1040, 640, 40, true, false);
      ctx.shadowBlur = 0;

      ctx.fillStyle = accentBlue;
      ctx.font = "bold 50px 'Segoe UI', sans-serif";
      ctx.fillText(`GoatBot | ${pkg.version}`, 120, 140);

      const info = [
        ["Uptime Bot", botUptimeFormatted],
        ["Uptime System", systemUptimeFormatted],
        ["CPU", `${cpuModel} (${cpuCores} cores)`],
        ["RAM Usage", `${usedMem.toFixed(1)} MB / ${totalMem.toFixed(1)} MB (${(ramPercent * 100).toFixed(2)}%)`],
        ["Platform", platform],
        ["Node.js", nodeVersion],
        ["Hostname", hostname],
        ["Ping", `${ping} ms`],
        ["Memory", `${heapUsed} MB`],
        ["Developer", "Aryan Rayhan"],
      ];

      ctx.font = "22px 'Segoe UI', sans-serif";
      info.forEach((item, i) => {
        if (item[0] === "Developer") {
          ctx.fillStyle = developerColor;
          ctx.fillText(item[0], 130, 210 + i * 50);
          ctx.fillStyle = softWhite;
          ctx.fillText(item[1], 400, 210 + i * 50);
        } else {
          ctx.fillStyle = accentGreen;
          ctx.fillText(item[0], 130, 210 + i * 50);
          ctx.fillStyle = softWhite;
          ctx.fillText(item[1], 400, 210 + i * 50);
        }
      });

      drawCircularRam(ctx, 900, 320, 100, ramPercent, accentBlue);

      const outDir = p.join(__dirname, "tmp");
      if (!f.existsSync(outDir)) f.mkdirSync(outDir);
      const outPath = p.join(outDir, "up.png");

      const stream = canvas.createPNGStream();
      const out = f.createWriteStream(outPath);

      stream.on("error", (err) => console.error("Canvas stream error:", err));
      out.on("error", (err) => console.error("File write error:", err));

      stream.pipe(out);

      await new Promise((res, rej) => out.on("finish", res).on("error", rej));

      const text =
        `Uptime: ${botUptimeFormatted}\n` +
        `System Uptime: ${systemUptimeFormatted}\n` +
        `CPU: ${cpuModel} (${cpuCores} cores)\n` +
        `RAM: ${usedMem.toFixed(1)} / ${totalMem.toFixed(1)} MB\n` +
        `Node.js: ${nodeVersion}\n` +
        `Host: ${hostname}\n` +
        `Ping: ${ping} ms\n` +
        `Memory (Bot): ${heapUsed} MB\n` +
        `Developer: Aryan Rayhan`;

      api.sendMessage({
        body: text,
        attachment: f.createReadStream(outPath),
      }, event.threadID, () => f.unlinkSync(outPath), event.messageID);

    } catch (err) {
      console.error("uptime.js error:", err);
      api.sendMessage("❌ | Failed to generate bot status. Check console for details.", event.threadID, event.messageID);
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
