/**
 * Optimized Startup Script for Low Memory Hosting
 * Supports 250MB-512MB hosts (Render, Railway, etc.)
 * @author Aryan Rayhan
 */

const { spawn } = require("child_process");
const path = require("path");
const os = require("os");

const systemMemMB = Math.floor(os.totalmem() / 1024 / 1024);
const CONTAINER_MEMORY_MB = parseInt(process.env.MEMORY_LIMIT_MB) || 
                            parseInt(process.env.RENDER_MEMORY_MB) ||
                            (systemMemMB > 2048 ? 512 : systemMemMB);

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

console.log(`[System] OS Memory: ${systemMemMB}MB`);
console.log(`[System] Container Limit: ${CONTAINER_MEMORY_MB}MB`);
console.log(`[System] Free Memory: ${Math.floor(os.freemem() / 1024 / 1024)}MB`);
console.log(`[System] Node Options: ${NODE_OPTIONS.join(" ")}`);

function startBot() {
  console.log("[Bot] Starting Goat Bot V2...");
  
  const child = spawn("node", [...NODE_OPTIONS, "Goat.js"], {
    cwd: __dirname,
    stdio: "inherit",
    shell: true,
    env: {
      ...process.env,
      NODE_ENV: process.env.NODE_ENV || "production",
      UV_THREADPOOL_SIZE: "4"
    }
  });

  child.on("error", (error) => {
    console.error("[Bot] Error starting bot:", error.message);
    setTimeout(startBot, 5000);
  });

  child.on("close", (code) => {
    if (code === 2) {
      console.log("[Bot] Restarting bot...");
      startBot();
    } else if (code !== 0) {
      console.log(`[Bot] Bot exited with code ${code}. Restarting in 5 seconds...`);
      setTimeout(startBot, 5000);
    }
  });
}

startBot();
