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

const tmpDir = path.join(__dirname, "tmp");
if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

function expToLevel(exp) {
  const deltaNext = 5;
  return Math.floor((1 + Math.sqrt(1 + 8 * exp / deltaNext)) / 2);
}

function levelToExp(level) {
  const deltaNext = 5;
  return Math.floor(((level ** 2 - level) * deltaNext) / 2);
}

function getRankBadge(rank) {
  switch (rank) {
    case 1: return "🥇";
    case 2: return "🥈";
    case 3: return "🥉";
    default: return `#${rank}`;
  }
}

function createProgressBar(percent, length = 20) {
  const filled = Math.round(percent * length);
  const empty = length - filled;
  return "█".repeat(filled) + "░".repeat(empty);
}

async function makeRankCard(userData, level, exp, requiredExp, rank, total) {
  if (!canvasAvailable || !createCanvas || !loadImage) {
    return null;
  }
  
  try {
    const canvas = createCanvas(920, 310);
    const ctx = canvas.getContext("2d");

    const gradient = ctx.createLinearGradient(0, 0, 920, 0);
    gradient.addColorStop(0, "#000428");
    gradient.addColorStop(1, "#004e92");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const pathAvt = path.join(tmpDir, `${userData.userID}_avatar.png`);
    try {
      const getAvtmot = await axios.get(
        `https://graph.facebook.com/${userData.userID}/picture?width=720&height=720&access_token=6628568379|c1e620fa708a1d5696fb991c1bde5662`,
        { responseType: "arraybuffer", timeout: 10000 }
      );
      fs.writeFileSync(pathAvt, Buffer.from(getAvtmot.data, "binary"));
    } catch {
      const defaultAvatar = path.join(__dirname, "assest", "default-avatar.png");
      if (fs.existsSync(defaultAvatar)) {
        fs.copyFileSync(defaultAvatar, pathAvt);
      } else {
        const placeholderCanvas = createCanvas(200, 200);
        const pCtx = placeholderCanvas.getContext("2d");
        pCtx.fillStyle = "#333";
        pCtx.fillRect(0, 0, 200, 200);
        pCtx.fillStyle = "#fff";
        pCtx.font = "bold 80px sans-serif";
        pCtx.textAlign = "center";
        pCtx.fillText("?", 100, 130);
        fs.writeFileSync(pathAvt, placeholderCanvas.toBuffer("image/png"));
      }
    }

    const avatar = await loadImage(pathAvt);
    ctx.save();
    ctx.beginPath();
    ctx.arc(155, 155, 100, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, 55, 55, 200, 200);
    ctx.restore();

    ctx.beginPath();
    ctx.arc(155, 155, 102, 0, Math.PI * 2);
    ctx.lineWidth = 8;
    ctx.shadowColor = "#00ffe0";
    ctx.shadowBlur = 20;
    ctx.strokeStyle = "#00ffe0";
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.font = "bold 36px sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "#00ffff";
    ctx.shadowBlur = 15;
    ctx.fillText(userData.name, 280, 85);
    ctx.shadowBlur = 0;

    ctx.font = "24px sans-serif";
    ctx.fillStyle = "#00ffc3";
    ctx.shadowColor = "#00ffc3";
    ctx.shadowBlur = 10;
    ctx.fillText(`🏅 Level ${level}`, 280, 130);
    ctx.fillText(`🎖 Rank: ${getRankBadge(rank)} of ${total}`, 280, 170);
    ctx.fillText(`📈 EXP: ${exp} / ${requiredExp}`, 280, 210);
    ctx.shadowBlur = 0;

    const percent = Math.min(exp / requiredExp, 1);
    const barX = 280, barY = 230, barWidth = 580, barHeight = 25;

    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(barX, barY, barWidth, barHeight);

    ctx.fillStyle = "#00ffc3";
    ctx.shadowColor = "#00ffc3";
    ctx.shadowBlur = 10;
    ctx.fillRect(barX, barY, barWidth * percent, barHeight);
    ctx.shadowBlur = 0;

    ctx.font = "20px sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "#ffffff";
    ctx.shadowBlur = 12;
    ctx.fillText(`${Math.floor(percent * 100)}%`, barX + barWidth + 10, barY + 20);
    ctx.shadowBlur = 0;

    ctx.font = "16px sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "right";
    ctx.fillText("© Aryan Rayhan", 900 - 20, 310 - 20);

    try { fs.unlinkSync(pathAvt); } catch {}
    return canvas.toBuffer("image/png");
  } catch (err) {
    console.error("Canvas error:", err.message);
    return null;
  }
}

module.exports = {
  config: {
    name: "rank",
    version: "3.1",
    author: "NTKhang",
    countDown: 5,
    role: 0,
    vip: false,
    nixprefix: false,
    shortDescription: { en: "View your glowing neon rank card" },
    description: {
      en: "Show rank, EXP, level, and position in a stunning neon style card."
    },
    category: "ranking",
    guide: {
      en: `{pn} → Your rank\n{pn} @user\n{pn} uid\n(Reply) {pn}`
    }
  },

  onStart: async function ({ api, event, args, message, usersData }) {
    let targetID;
    if (event.type === "message_reply") {
      targetID = event.messageReply.senderID;
    } else if (Object.keys(event.mentions || {}).length > 0) {
      targetID = Object.keys(event.mentions)[0];
    } else if (!isNaN(args[0])) {
      targetID = args[0];
    } else {
      targetID = event.senderID;
    }

    const allUsers = await usersData.getAll();
    const sortedUsers = allUsers
      .map(u => ({ id: u.userID, exp: u.exp || 0 }))
      .sort((a, b) => b.exp - a.exp);
    const rankPosition = sortedUsers.findIndex(u => u.id === targetID) + 1;
    const totalUsers = sortedUsers.length;
    const userData = await usersData.get(targetID);

    if (!userData) {
      return message.reply("❌ User data not found.");
    }

    const exp = userData.exp || 0;
    const level = expToLevel(exp);
    const nextExp = levelToExp(level + 1);
    const currentExp = levelToExp(level);
    const requiredExp = nextExp - currentExp;
    const progressExp = exp - currentExp;
    const percent = Math.min(progressExp / requiredExp, 1);

    const imageBuffer = await makeRankCard(
      { name: userData.name, userID: targetID },
      level,
      progressExp,
      requiredExp,
      rankPosition,
      totalUsers
    );

    if (imageBuffer) {
      const filePath = path.join(tmpDir, `rank_card_${targetID}.png`);
      fs.writeFileSync(filePath, imageBuffer);

      return message.reply({
        body: `🌟 Rank Card for ${userData.name}`,
        attachment: fs.createReadStream(filePath)
      }, () => {
        try { fs.unlinkSync(filePath); } catch {}
      });
    } else {
      const progressBar = createProgressBar(percent);
      const textRank = `
╔══════════════════════════╗
║    🌟 RANK CARD 🌟       ║
╠══════════════════════════╣
║ 👤 ${userData.name}
║ 🏅 Level: ${level}
║ 🎖 Rank: ${getRankBadge(rankPosition)} of ${totalUsers}
║ 📈 EXP: ${progressExp} / ${requiredExp}
║ ${progressBar} ${Math.floor(percent * 100)}%
╚══════════════════════════╝
      `.trim();
      
      return message.reply(textRank);
    }
  }
};
