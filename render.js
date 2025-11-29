/**
 * Render.com Optimized Startup Script
 * For hosting on Render Free Tier (512MB or less)
 * @author Aryan Rayhan
 */

const express = require("express");
const path = require("path");
const { spawn } = require("child_process");
const os = require("os");

const PORT = process.env.PORT || 5000;
const app = express();

const systemMemMB = Math.floor(os.totalmem() / 1024 / 1024);
const CONTAINER_MEMORY_MB = parseInt(process.env.MEMORY_LIMIT_MB) || 
                            parseInt(process.env.RENDER_MEMORY_MB) ||
                            (systemMemMB > 2048 ? 512 : systemMemMB);

console.log("========================================");
console.log("  Goat Bot V2 - Render Deployment");
console.log("========================================");
console.log(`[System] OS Memory: ${systemMemMB}MB`);
console.log(`[System] Container Limit: ${CONTAINER_MEMORY_MB}MB`);
console.log(`[System] Free Memory: ${Math.floor(os.freemem() / 1024 / 1024)}MB`);
console.log(`[System] Platform: ${os.platform()} (${os.arch()})`);
console.log(`[System] Node.js: ${process.version}`);
console.log("========================================");

let botStatus = "starting";
let lastPing = Date.now();
let botProcess = null;

app.use(express.static(__dirname));

app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Goat Bot V2 - Status</title>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body { font-family: 'Segoe UI', sans-serif; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: #fff; min-height: 100vh; margin: 0; display: flex; align-items: center; justify-content: center; }
        .container { text-align: center; padding: 2rem; background: rgba(255,255,255,0.1); border-radius: 20px; backdrop-filter: blur(10px); max-width: 500px; margin: 1rem; }
        h1 { color: #00d4ff; margin-bottom: 0.5rem; }
        .status { font-size: 1.2rem; padding: 1rem; border-radius: 10px; margin: 1rem 0; }
        .running { background: rgba(0,255,136,0.2); color: #00ff88; }
        .starting { background: rgba(255,200,0,0.2); color: #ffc800; }
        .error { background: rgba(255,0,0,0.2); color: #ff4444; }
        .stats { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1rem; }
        .stat { background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 10px; }
        .stat-value { font-size: 1.5rem; font-weight: bold; color: #00d4ff; }
        .footer { margin-top: 2rem; opacity: 0.7; font-size: 0.9rem; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🤖 Goat Bot V2</h1>
        <p>Facebook Messenger Bot</p>
        <div class="status ${botStatus === 'running' ? 'running' : botStatus === 'starting' ? 'starting' : 'error'}">
          Status: ${botStatus.toUpperCase()}
        </div>
        <div class="stats">
          <div class="stat">
            <div>Memory</div>
            <div class="stat-value">${Math.floor(os.freemem() / 1024 / 1024)}MB</div>
            <div>Free</div>
          </div>
          <div class="stat">
            <div>Uptime</div>
            <div class="stat-value">${formatUptime(process.uptime())}</div>
            <div>Running</div>
          </div>
        </div>
        <div class="footer">
          <p>Developer: Aryan Rayhan</p>
          <p>Last Ping: ${new Date(lastPing).toLocaleString()}</p>
        </div>
      </div>
    </body>
    </html>
  `);
});

app.get("/health", (req, res) => {
  lastPing = Date.now();
  res.json({
    status: botStatus,
    uptime: process.uptime(),
    memory: {
      container: CONTAINER_MEMORY_MB,
      free: Math.floor(os.freemem() / 1024 / 1024),
      used: CONTAINER_MEMORY_MB - Math.floor(os.freemem() / 1024 / 1024)
    },
    timestamp: Date.now()
  });
});

app.get("/ping", (req, res) => {
  lastPing = Date.now();
  res.send("pong");
});

function formatUptime(seconds) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m ${s}s`;
}

function startBot() {
  const NODE_OPTIONS = [];
  
  if (CONTAINER_MEMORY_MB <= 256) {
    NODE_OPTIONS.push("--max-old-space-size=128");
    NODE_OPTIONS.push("--max-semi-space-size=2");
    console.log("[Memory] Ultra-low memory mode (128MB heap)");
  } else if (CONTAINER_MEMORY_MB <= 512) {
    NODE_OPTIONS.push("--max-old-space-size=256");
    NODE_OPTIONS.push("--max-semi-space-size=4");
    console.log("[Memory] Low memory mode (256MB heap)");
  } else if (CONTAINER_MEMORY_MB <= 1024) {
    NODE_OPTIONS.push("--max-old-space-size=384");
    console.log("[Memory] Standard memory mode (384MB heap)");
  } else {
    NODE_OPTIONS.push("--max-old-space-size=512");
    console.log("[Memory] High memory mode (512MB heap)");
  }
  
  NODE_OPTIONS.push("--optimize-for-size");

  console.log("[Bot] Starting with options:", NODE_OPTIONS.join(" "));

  botProcess = spawn("node", [...NODE_OPTIONS, "Goat.js"], {
    cwd: __dirname,
    stdio: "inherit",
    shell: true,
    env: {
      ...process.env,
      NODE_ENV: "production",
      UV_THREADPOOL_SIZE: "4"
    }
  });

  botProcess.on("spawn", () => {
    botStatus = "running";
    console.log("[Bot] Bot started successfully");
  });

  botProcess.on("error", (error) => {
    botStatus = "error";
    console.error("[Bot] Error:", error.message);
    setTimeout(startBot, 5000);
  });

  botProcess.on("close", (code) => {
    if (code === 2) {
      console.log("[Bot] Restarting...");
      botStatus = "starting";
      startBot();
    } else if (code !== 0) {
      console.log(`[Bot] Exited with code ${code}. Restarting in 5s...`);
      botStatus = "error";
      setTimeout(startBot, 5000);
    }
  });
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`[Server] Web server running on port ${PORT}`);
  console.log("[Server] Starting bot...");
  startBot();
});
