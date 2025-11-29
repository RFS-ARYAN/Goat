let createCanvas, loadImage, registerFont;
let canvasAvailable = false;
try {
  const canvas = require("canvas");
  createCanvas = canvas.createCanvas;
  loadImage = canvas.loadImage;
  registerFont = canvas.registerFont;
  canvasAvailable = true;
} catch (err) {
  createCanvas = null;
  loadImage = null;
  registerFont = null;
  canvasAvailable = false;
}
const path = require("path");
const fs = require("fs");
const axios = require("axios");

function drawHexagon(ctx, cx, cy, size, fillColor, strokeColor) {
  const points = [];
  for (let i = 0; i < 6; i++) {
    const angle = Math.PI / 3 * i - Math.PI / 6;
    const x = cx + Math.cos(angle) * size;
    const y = cy + Math.sin(angle) * size;
    points.push({ x, y });
  }
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
  ctx.closePath();
  ctx.fillStyle = fillColor;
  ctx.fill();
  ctx.lineWidth = 6;
  ctx.strokeStyle = strokeColor;
  ctx.stroke();
}

let bgIndex = 0;
const bgColors = [
  "#1a1236", "#2c1c4f", "#111a21"
];

function createProgressBar(percent, length = 20) {
  const filled = Math.round(percent * length);
  const empty = length - filled;
  return "█".repeat(filled) + "░".repeat(empty);
}

module.exports = {
  config: {
    name: "balance",
    aliases: ["bal"],
    version: "5.3",
    author: "ArYAN",
    countDown: 5,
    role: 0,
    vip: false,
    nixprefix: false,
    description: { en: "View your money and stats" },
    category: "economy",
    guide: { en: "{pn}: view your money\n{pn} <@tag>: view the money of the tagged person" }
  },

  onStart: async function({ message, usersData, event, api }) {
    try {
      let targetID;
      if (event.type === "message_reply" && event.messageReply) {
        targetID = event.messageReply.senderID;
      } else if (Object.keys(event.mentions || {}).length > 0) {
        targetID = Object.keys(event.mentions)[0];
      } else {
        targetID = event.senderID;
      }

      const userData = await usersData.get(targetID);
      const targetName = userData ? userData.name || "Unknown User" : "Unknown User";
      const targetMoney = userData ? userData.money || 0 : 0;
      const level = userData ? userData.level || 1 : 1;
      const xp = userData ? userData.xp || 0 : 0;
      const xpForNext = 100 + level * 50;
      const xpPercent = Math.min(xp / xpForNext, 1);

      if (!canvasAvailable || !createCanvas || !loadImage) {
        const progressBar = createProgressBar(xpPercent);
        const textBalance = `
╔═══════════════════════════╗
║     💰 BALANCE 💰         ║
╠═══════════════════════════╣
║ 👤 ${targetName}
║ 🆔 UID: ${targetID}
║ 💵 Money: ${targetMoney}$
║ 🏅 Level: ${level}
║ 📈 XP: ${xp} / ${xpForNext}
║ ${progressBar} ${Math.floor(xpPercent * 100)}%
╚═══════════════════════════╝
        `.trim();
        
        return message.reply(textBalance);
      }

      const profileX = 675;
      const profileY = 250;
      const profileSize = 120;
      const width = 900;
      const height = 500;
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");

      const currentColor = bgColors[bgIndex % bgColors.length];
      bgIndex++;
      const bgGradient = ctx.createLinearGradient(0, 0, width, height);
      bgGradient.addColorStop(0, currentColor);
      bgGradient.addColorStop(1, "#111a21");
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, width, height);

      const glow = ctx.createLinearGradient(0, 0, 0, 150);
      glow.addColorStop(0, "rgba(255,255,255,0.2)");
      glow.addColorStop(1, "transparent");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, 150);

      ctx.font = "bold 70px 'Segoe UI', sans-serif";
      ctx.textAlign = "center";
      ctx.shadowColor = "#00c9ff";
      ctx.shadowBlur = 15;
      ctx.fillStyle = "#00c9ff";
      ctx.fillText("BALANCE", width / 2, 90);
      ctx.shadowBlur = 0;

      const moneyX = width / 4;
      const moneyY = height / 2;
      const hexSize = 130;
      drawHexagon(ctx, moneyX, moneyY, hexSize, "#112e4f", "#00c9ff");
      ctx.font = "bold 50px 'Segoe UI', sans-serif";
      ctx.fillStyle = "#ffffff";
      ctx.fillText(`${targetMoney}$`, moneyX, moneyY + 15);

      const tmpDir = path.join(__dirname, "tmp");
      if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
      const pathAvt1 = path.join(tmpDir, `${targetID}_avatar.png`);

      let avatarLoaded = false;
      try {
        const getAvtmot = await axios.get(
          `https://graph.facebook.com/${targetID}/picture?width=720&height=720&access_token=6628568379|c1e620fa708a1d5696fb991c1bde5662`,
          { responseType: "arraybuffer", timeout: 10000 }
        );
        fs.writeFileSync(pathAvt1, Buffer.from(getAvtmot.data, "binary"));
        avatarLoaded = true;
      } catch (err) {
        const placeholderCanvas = createCanvas(200, 200);
        const pCtx = placeholderCanvas.getContext("2d");
        pCtx.fillStyle = "#333";
        pCtx.fillRect(0, 0, 200, 200);
        pCtx.fillStyle = "#fff";
        pCtx.font = "bold 80px sans-serif";
        pCtx.textAlign = "center";
        pCtx.fillText("?", 100, 130);
        fs.writeFileSync(pathAvt1, placeholderCanvas.toBuffer("image/png"));
        avatarLoaded = true;
      }

      if (avatarLoaded) {
        const profilePic = await loadImage(pathAvt1);
        ctx.save();
        ctx.beginPath();
        ctx.arc(profileX, profileY, profileSize / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(profilePic, profileX - profileSize / 2, profileY - profileSize / 2, profileSize, profileSize);
        ctx.restore();
      }

      ctx.font = "bold 26px 'Segoe UI', sans-serif";
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.fillText(targetName, profileX, profileY + profileSize / 2 + 30);
      ctx.font = "20px 'Segoe UI', sans-serif";
      ctx.fillStyle = "#bbbbbb";
      ctx.fillText(`UID: ${targetID}`, profileX, profileY + profileSize / 2 + 55);

      const barX = moneyX - 150;
      const barY = moneyY + 180;
      const barWidth = 300;
      const barHeight = 25;
      ctx.fillStyle = "#222831";
      ctx.fillRect(barX, barY, barWidth, barHeight);

      const fillWidth = Math.min((xp / xpForNext) * barWidth, barWidth);
      const xpGradient = ctx.createLinearGradient(barX, 0, barX + barWidth, 0);
      xpGradient.addColorStop(0, "#00c9ff");
      xpGradient.addColorStop(1, "#92fe9d");
      ctx.fillStyle = xpGradient;
      ctx.fillRect(barX, barY, fillWidth, barHeight);

      ctx.font = "18px 'Segoe UI', sans-serif";
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.fillText(`Level ${level} - XP: ${xp} / ${xpForNext}`, barX + barWidth / 2, barY + barHeight - 5);

      ctx.font = "16px 'Segoe UI', sans-serif";
      ctx.fillStyle = "#888888";
      ctx.textAlign = "right";
      ctx.fillText("© Aryan Rayhan", width - 20, height - 20);

      const outPath = path.join(tmpDir, "balance.png");
      const out = fs.createWriteStream(outPath);
      const stream = canvas.createPNGStream();
      stream.pipe(out);
      await new Promise(resolve => out.on("finish", resolve));

      await api.sendMessage({ body: "", attachment: fs.createReadStream(outPath) }, event.threadID, () => {
        try { fs.unlinkSync(outPath); } catch {}
        try { fs.unlinkSync(pathAvt1); } catch {}
      });
    } catch (err) {
      console.error(err);
      const progressBar = createProgressBar(0);
      return message.reply(`
╔═══════════════════════════╗
║     💰 BALANCE 💰         ║
╠═══════════════════════════╣
║ ❌ Error loading balance
║ Please try again later
╚═══════════════════════════╝
      `.trim());
    }
  }
};
