const path = require("path");
const fs = require("fs");

let registerFont = null;
let canvasAvailable = false;

try {
  const canvas = require("canvas");
  registerFont = canvas.registerFont;
  canvasAvailable = true;
} catch (err) {
  canvasAvailable = false;
}

const fontsDir = path.join(__dirname, "..", "assets", "fonts");
const fontsConfigPath = path.join(fontsDir, "fonts.json");

const registeredFonts = new Set();

function loadFonts() {
  if (!canvasAvailable || !registerFont) {
    console.log("[FontLoader] Canvas not available - skipping font registration");
    return false;
  }

  if (!fs.existsSync(fontsDir)) {
    console.log("[FontLoader] Fonts directory not found");
    return false;
  }

  let fontsConfig = { fonts: [] };
  if (fs.existsSync(fontsConfigPath)) {
    try {
      fontsConfig = JSON.parse(fs.readFileSync(fontsConfigPath, "utf8"));
    } catch (err) {
      console.log("[FontLoader] Error reading fonts.json:", err.message);
    }
  }

  let loadedCount = 0;
  for (const fontInfo of fontsConfig.fonts) {
    const fontPath = path.join(fontsDir, fontInfo.file);
    if (fs.existsSync(fontPath) && !registeredFonts.has(fontInfo.file)) {
      try {
        registerFont(fontPath, {
          family: fontInfo.family,
          weight: fontInfo.weight || "normal",
          style: fontInfo.style || "normal"
        });
        registeredFonts.add(fontInfo.file);
        loadedCount++;
        console.log(`[FontLoader] Registered font: ${fontInfo.family} (${fontInfo.weight})`);
      } catch (err) {
        console.log(`[FontLoader] Error registering ${fontInfo.file}:`, err.message);
      }
    }
  }

  const fontFiles = fs.readdirSync(fontsDir).filter(f => 
    f.endsWith(".ttf") || f.endsWith(".otf")
  );

  for (const file of fontFiles) {
    if (registeredFonts.has(file)) continue;
    
    const fontPath = path.join(fontsDir, file);
    const family = path.basename(file, path.extname(file))
      .replace(/-/g, " ")
      .replace(/Regular|Bold|Italic|Light|Medium/gi, "")
      .trim();
    
    try {
      const weight = /bold/i.test(file) ? "bold" : "normal";
      const style = /italic/i.test(file) ? "italic" : "normal";
      
      registerFont(fontPath, { family, weight, style });
      registeredFonts.add(file);
      loadedCount++;
      console.log(`[FontLoader] Auto-registered font: ${family}`);
    } catch (err) {
      console.log(`[FontLoader] Error auto-registering ${file}:`, err.message);
    }
  }

  console.log(`[FontLoader] Loaded ${loadedCount} fonts`);
  return loadedCount > 0;
}

function isFontAvailable(fontFamily) {
  return registeredFonts.size > 0;
}

function getAvailableFonts() {
  return Array.from(registeredFonts);
}

module.exports = {
  loadFonts,
  isFontAvailable,
  getAvailableFonts,
  canvasAvailable
};
