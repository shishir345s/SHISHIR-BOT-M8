const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "ledysr",
    version: "1.0",
    author: "SHISHIR",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Send a random video"
    },
    longDescription: {
      en: "Send a random video from the local collection"
    },
    category: "fun",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ message }) {
    try {
      const videoFolder = path.join(__dirname, "videos");

      if (!fs.existsSync(videoFolder)) {
        fs.mkdirSync(videoFolder, { recursive: true });
      }

      const videos = fs.readdirSync(videoFolder)
        .filter(file =>
          /\.(mp4|mov|mkv|webm)$/i.test(file)
        );

      if (videos.length === 0) {
        return message.reply(
          "╭━━━〔 ⚠️ ERROR 〕━━━╮\n" +
          "┃ 📂 কোনো ভিডিও পাওয়া যায়নি!\n" +
          "┃ 📌 videos ফোল্ডারে ভিডিও রাখো।\n" +
          "╰━━━━━━━━━━━━━━━━╯"
        );
      }

      const randomVideo =
        videos[Math.floor(Math.random() * videos.length)];

      const videoPath = path.join(videoFolder, randomVideo);

      return message.reply({
        body:
          "╭━━━〔 🎬 LEDYSR 〕━━━╮\n" +
          "┃ 🖤 Random Video\n" +
          "┃ ⚡ Powered By SHISHIR\n" +
          "╰━━━━━━━━━━━━━━━━╯",
        attachment: fs.createReadStream(videoPath)
      });

    } catch (error) {
      console.error("LEDYSR ERROR:", error);

      return message.reply(
        "❌ ভিডিও পাঠাতে সমস্যা হয়েছে!"
      );
    }
  }
};
