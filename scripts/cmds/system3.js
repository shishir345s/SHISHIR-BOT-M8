const si = require('systeminformation');
const request = require("request");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "system3",
    aliases: ["sys3", "info3"],
    version: "1.0",
    author: "",
    countDown: 5,
    role: 0,
    shortDescription: "System details v2",
    longDescription: "Displays hardware, memory, disk, and operating system metrics.",
    category: "system",
    guide: "{pn}"
  },

  // Helper function to format bytes
  byte2mb: function(bytes) {
    const units = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
    let l = 0, n = parseInt(bytes, 10) || 0;
    while (n >= 1024 && ++l) n = n / 1024;
    return `${n.toFixed(n < 10 && l > 0 ? 1 : 0)} ${units[l]}`;
  },

  onStart: async function ({ api, event }) {
    const { cpu, cpuTemperature, currentLoad, memLayout, diskLayout, mem, osInfo } = si;
    const timeStart = Date.now();
    const cacheDir = path.join(__dirname, "cache");
    const filePath = path.join(cacheDir, "system2_img.jpg");

    try {
      // Create cache directory if it doesn't exist
      fs.ensureDirSync(cacheDir);

      const cpuData = await cpu();
      const temp = await cpuTemperature();
      const loadData = await currentLoad();
      const diskInfo = await diskLayout();
      const memInfo = await memLayout();
      const memory = await mem();
      const os = await osInfo();

      const primaryMem = memInfo[0] || { size: 0, type: "Unknown" };
      const primaryDisk = diskInfo[0] || { name: "Unknown", size: 0, type: "Unknown", temperature: 0 };

      // Uptime Calculation
      const time = process.uptime();
      const hours = String(Math.floor(time / 3600)).padStart(2, '0');
      const minutes = String(Math.floor((time % 3600) / 60)).padStart(2, '0');
      const seconds = String(Math.floor(time % 60)).padStart(2, '0');

      const text = [
        "━ 𝗦𝗬𝗦𝗧𝗘𝗠 𝗜𝗡𝗙𝗢𝗥𝗠𝗔𝗧𝗜𝗢𝗡 ━",
        "💻 CPU Info",
        `• Model: ${cpuData.manufacturer || ''} ${cpuData.brand || 'Unknown'}`,
        `• Speed: ${cpuData.speed || 0} GHz`,
        `• Cores: ${cpuData.physicalCores || 0}`,
        `• Threads: ${cpuData.cores || 0}`,
        `• Temperature: ${temp.main || 0}°C`,
        `• Load: ${(loadData.currentLoad || 0).toFixed(1)}%`,
        "",
        "🧠 Memory Info",
        `• Module Size: ${this.byte2mb(primaryMem.size)}`,
        `• Type: ${primaryMem.type}`,
        `• Total: ${this.byte2mb(memory.total)}`,
        `• Available: ${this.byte2mb(memory.available)}`,
        "",
        "💾 Disk Info",
        `• Name: ${primaryDisk.name}`,
        `• Size: ${this.byte2mb(primaryDisk.size)}`,
        `• Type: ${primaryDisk.type}`,
        `• Temperature: ${primaryDisk.temperature || 0}°C`,
        "",
        "🖥️ OS Info",
        `• Platform: ${os.platform}`,
        `• Build: ${os.build}`,
        `• Uptime: ${hours}:${minutes}:${seconds}`,
        `• Ping: ${Date.now() - timeStart} ms`
      ].join("\n");

      const links = [
        "https://i.imgur.com/u1WkhXi.jpg",
        "https://i.imgur.com/zuUMUDp.jpg",
        "https://i.imgur.com/skHrcq9.jpg",
        "https://i.imgur.com/TE9tH8w.jpg",
        "https://i.imgur.com/on9p0FK.jpg",
        "https://i.imgur.com/mriBW5m.jpg",
        "https://i.imgur.com/ju7CyHo.jpg",
        "https://i.imgur.com/KJunp2s.jpg",
        "https://i.imgur.com/6knPOgd.jpg",
        "https://i.imgur.com/Nxcbwxk.jpg",
        "https://i.imgur.com/FgtghTN.jpg"
      ];

      const selectedImage = links[Math.floor(Math.random() * links.length)];

      const callback = () => api.sendMessage(
        { body: text, attachment: fs.createReadStream(filePath) },
        event.threadID,
        () => {
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        },
        event.messageID
      );

      request(encodeURI(selectedImage))
        .pipe(fs.createWriteStream(filePath))
        .on("close", callback)
        .on("error", (err) => {
          console.error("Image download failed:", err);
          // Send text if image fails
          api.sendMessage(text, event.threadID, event.messageID);
        });

    } catch (e) {
      console.error("System command error:", e);
      api.sendMessage("System info fetch korte problem hocche: " + e.message, event.threadID, event.messageID);
    }
  }
};
