const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const videos = [
  "https://drive.google.com/uc?id=1xLc_9r1TYGVM0J33hJ61hmW3yXOBTcEo",
  "https://drive.google.com/uc?id=1xFVA97twVhvJJzmxhXjT9QukwWEDRO2a",
  "https://drive.google.com/uc?id=1xC8J23XORH4zHsXCDkfrgzmVBm1_-b5E",
  "https://drive.google.com/uc?id=1x5EX0grUJwEKzHyzeR63HnzC_UlDdJD6",
  "https://drive.google.com/uc?id=1xM82tBosefpCvaDokhufHoikub1Opupz",
  "https://drive.google.com/uc?id=1xhCqfx7pScogeGph4T4ITnRJFYcUNmJ8",
  "https://drive.google.com/uc?id=1xTgkjk__QRMOVQnkQsSIcEzGfRUwUDLY",
  "https://drive.google.com/uc?id=1xRsWDPe485xXPna9nWhj0TaW_Q9lVJDd",
  "https://drive.google.com/uc?id=1xC30T2eSDWZGr_O8699yxaMS-AZ_X5y8",
  "https://drive.google.com/uc?id=1xcoHMLkNU1naPET4bP2sEiHoXUF23w-R",
  "https://drive.google.com/uc?id=1xcN88lPjPoRJhdxCUesuTFFArtvbUNL2",
  "https://drive.google.com/uc?id=1xUee8t4ukXW_XD4K4pGV_I4VFccwdyqt",
  "https://drive.google.com/uc?id=1xgfepctwXjZ5Y9kxhD3HcTTaJcsWHi-x",
  "https://drive.google.com/uc?id=1xhymaD6J1patQzfass5-e4ewUDg8gnQ9",
  "https://drive.google.com/uc?id=1xCvCvUa2zVWLm3y1pAGFKrr-emyaFicK",
  "https://drive.google.com/uc?id=1x87CHgjwaOjANyN_06_JqB-YKaUQGU2b"
];

module.exports = {
  config: {
    name: "love_video",
    aliases: ["lovevideo", "lv"],
    version: "1.0.0",
    author: "SHISHIR",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Send random love video"
    },
    longDescription: {
      en: "Send a random love video from the collection"
    },
    category: "fun",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ message }) {
    try {
      const randomVideo = videos[Math.floor(Math.random() * videos.length)];

      const cacheDir = path.join(__dirname, "cache");
      await fs.ensureDir(cacheDir);

      const filePath = path.join(
        cacheDir,
        `love_video_${Date.now()}.mp4`
      );

      const response = await axios({
        method: "GET",
        url: randomVideo,
        responseType: "stream",
        headers: {
          "User-Agent": "Mozilla/5.0"
        }
      });

      const writer = fs.createWriteStream(filePath);

      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });

      await message.reply({
        body: "💖 𝐇𝐞𝐫𝐞'𝐬 𝐚 𝐋𝐨𝐯𝐞 𝐕𝐢𝐝𝐞𝐨 💕\n\n🌸 𝐄𝐧𝐣𝐨𝐲 𝐭𝐡𝐞 𝐯𝐢𝐝𝐞𝐨 𝐛𝐞𝐚𝐮𝐭𝐢𝐟𝐮𝐥𝐥𝐲! 🥰",
        attachment: fs.createReadStream(filePath)
      });

      setTimeout(() => {
        if (fs.existsSync(filePath))
          fs.unlinkSync(filePath);
      }, 5000);

    } catch (error) {
      console.error(error);

      return message.reply(
        "❌ 𝐕𝐢𝐝𝐞𝐨 𝐥𝐨𝐚𝐝 𝐤𝐨𝐫𝐭𝐞 𝐩𝐚𝐫𝐢𝐧𝐢। 𝐏𝐨𝐫𝐞 𝐚𝐛𝐚𝐫 𝐭𝐫𝐲 𝐤𝐨𝐫𝐨!"
      );
    }
  }
};
