const fs = require('fs');
const path = require('path');

module.exports = {
  config: {
    name: "delete",
    aliases: ["d"],
    version: "0.0.1",
    author: "ArYAN",
    countDown: 1,
    role: 2,
    vip: false,
    nixprefix: false,
    category: "utility",
    shortDescription: "Delete files and images",
    longDescription: "Clean cache & delete specific files or delete downloaded images.",
    guide: {
      en: "{pn} (Clean cache and temp files)\n{pn} <fileName> (Deletes specific command without .js)\n{pn} images (Deletes downloaded images)"
    },
  },

  onStart: async function ({ args, api, event }) {
    const directoriesToDelete = ['cache', 'tmp'];
    let fileName = args[0];

    try {
      if (fileName === "images") {
        const imagesFolder = path.join('downloads', 'images');

        if (fs.existsSync(imagesFolder)) {
          const imageFiles = fs.readdirSync(imagesFolder);

          if (imageFiles.length === 0) {
            api.sendMessage("🚫 The 'downloads/images' folder is already empty.", event.threadID);
          } else {
            for (const imageFile of imageFiles) {
              const imagePath = path.join(imagesFolder, imageFile);
              fs.unlinkSync(imagePath);
            }
            api.sendMessage("✅ All downloaded images have been deleted.", event.threadID);
          }
        } else {
          api.sendMessage("❎ The 'downloads/images' folder does not exist.", event.threadID);
        }

      } else if (fileName) {
        // Automatically add ".js" if not present
        if (!fileName.endsWith('.js')) {
          fileName += '.js';
        }

        const filePath = path.join(__dirname, fileName);

        if (!fs.existsSync(filePath)) {
          api.sendMessage(`❎ | File not found: ${fileName}`, event.threadID);
          return;
        }

        fs.unlink(filePath, (err) => {
          if (err) {
            console.error(err);
            api.sendMessage(`❎ | Failed to delete ${fileName}.`, event.threadID);
            return;
          }
          api.sendMessage(`✅ | Deleted successfully! ${fileName}`, event.threadID);
        });

      } else {
        // Clean cache and temp files
        console.log("Starting cleanup process...");
        for (const directory of directoriesToDelete) {
          const directoryPath = path.join(__dirname, directory);
          if (!fs.existsSync(directoryPath)) continue;

          const files = fs.readdirSync(directoryPath);
          for (const file of files) {
            const filePath = path.join(directoryPath, file);
            const fileStat = fs.statSync(filePath);

            if (fileStat.isFile()) {
              fs.unlinkSync(filePath);
              console.log(`Deleted file: ${filePath}`);
            }
          }
        }

        console.log("Cleanup process completed successfully!");
        api.sendMessage(`✅ | Deleted all caches and temp files from the system 💻`, event.threadID);
      }

    } catch (err) {
      console.error(err);
      api.sendMessage(`An error occurred: ${err.message}`, event.threadID);
    }
  }
};
