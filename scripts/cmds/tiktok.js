const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "tiktok",
    aliases: ["tt"],
    version: "3.0",
    author: "𝑺𝑯𝑰𝑺𝑯𝑰𝑹",
    role: 0,
    countDown: 10,
    shortDescription: "𝑻𝒊𝒌𝑻𝒐𝒌 𝑽𝒊𝒅𝒆𝒐 𝑫𝒐𝒘𝒏𝒍𝒐𝒂𝒅𝒆𝒓",
    longDescription: "𝑺𝒆𝒂𝒓𝒄𝒉 𝒂𝒏𝒅 𝒅𝒐𝒘𝒏𝒍𝒐𝒂𝒅 𝑻𝒊𝒌𝑻𝒐𝒌 𝒗𝒊𝒅𝒆𝒐𝒔",
    category: "media",
    guide: {
      en: "{pn} [search keyword]"
    }
  },

  onStart: async function ({ message, args }) {
    const query = args.join(" ").trim();

    if (!query) {
      return message.reply(
        "╭━━━〔 𝑻𝑰𝑲𝑻𝑶𝑲 〕━━━╮\n" +
        "┃\n" +
        "┃ ⚠️ 𝑷𝒍𝒆𝒂𝒔𝒆 𝒆𝒏𝒕𝒆𝒓 𝒂 𝒔𝒆𝒂𝒓𝒄𝒉 𝒌𝒆𝒚𝒘𝒐𝒓𝒅!\n" +
        "┃\n" +
        "┃ 📌 𝑬𝒙𝒂𝒎𝒑𝒍𝒆: 𝒕𝒕 𝒇𝒖𝒏𝒏𝒚 𝒗𝒊𝒅𝒆𝒐\n" +
        "┃\n" +
        "╰━━━━━━━━━━━━━━━━━━━━━━╯"
      );
    }

    let filePath = null;

    try {
      await message.reply(
        `╭━━━〔 🔍 𝑻𝑰𝑲𝑻𝑶𝑲 〕━━━╮\n` +
        `┃\n` +
        `┃ 🔎 𝑸𝒖𝒆𝒓𝒚: ${query}\n` +
        `┃ ⏳ 𝑺𝒆𝒂𝒓𝒄𝒉𝒊𝒏𝒈...\n` +
        `┃\n` +
        `╰━━━━━━━━━━━━━━━━━━━━━━╯`
      );

      const apiUrl =
        "https://azadx69x-all-apis-top.vercel.app/api/tiktok?query=" +
        encodeURIComponent(query);

      const { data } = await axios.get(apiUrl, {
        timeout: 30000
      });

      if (!data || !Array.isArray(data.data) || data.data.length === 0) {
        return message.reply(
          "❌ 𝑵𝒐 𝑻𝒊𝒌𝑻𝒐𝒌 𝒗𝒊𝒅𝒆𝒐 𝒇𝒐𝒖𝒏𝒅!"
        );
      }

      const videos = data.data.slice(0, 10);
      const video = videos[Math.floor(Math.random() * videos.length)];

      if (!video.video_url) {
        return message.reply("❌ 𝑽𝒊𝒅𝒆𝒐 𝑼𝑹𝑳 𝒏𝒐𝒕 𝒇𝒐𝒖𝒏𝒅!");
      }

      const videoUrl = String(video.video_url)
        .replace(/^\[|\]$/g, "")
        .trim();

      if (!/^https?:\/\//i.test(videoUrl)) {
        return message.reply("❌ 𝑰𝒏𝒗𝒂𝒍𝒊𝒅 𝑽𝒊𝒅𝒆𝒐 𝑼𝑹𝑳!");
      }

      filePath = path.join(
        __dirname,
        `tiktok_${Date.now()}_${Math.random()
          .toString(36)
          .slice(2, 8)}.mp4`
      );

      const response = await axios.get(videoUrl, {
        responseType: "stream",
        timeout: 120000
      });

      await new Promise((resolve, reject) => {
        const writer = fs.createWriteStream(filePath);

        response.data.pipe(writer);

        writer.on("finish", resolve);
        writer.on("error", reject);
        response.data.on("error", reject);
      });

      const title = video.title || "𝑼𝒏𝒌𝒏𝒐𝒘𝒏";
      const author = video.author || "𝑼𝒏𝒌𝒏𝒐𝒘𝒏";
      const stats = video.stats || {};

      const hashtags =
        title.match(/#[\w]+/g)?.join(" ") || "𝑵𝒐𝒏𝒆";

      const formatNumber = (num) => {
        if (num === undefined || num === null) return "0";
        return String(num);
      };

      await message.reply({
        body:
          `╭━━━〔 🎞️ 𝑻𝑰𝑲𝑻𝑶𝑲 𝑽𝑰𝑫𝑬𝑶 〕━━━╮\n` +
          `┃\n` +
          `┃ 🎬 𝑻𝒊𝒕𝒍𝒆: ${title}\n` +
          `┃ 👤 𝑪𝒓𝒆𝒂𝒕𝒐𝒓: ${author}\n` +
          `┃ 🏷️ 𝑯𝒂𝒔𝒉𝒕𝒂𝒈𝒔: ${hashtags}\n` +
          `┃\n` +
          `┃ ❤️ 𝑳𝒊𝒌𝒆𝒔: ${formatNumber(stats.likes)}\n` +
          `┃ 💬 𝑪𝒐𝒎𝒎𝒆𝒏𝒕𝒔: ${formatNumber(stats.comments)}\n` +
          `┃ 🔁 𝑺𝒉𝒂𝒓𝒆𝒔: ${formatNumber(stats.shares)}\n` +
          `┃\n` +
          `┃ ✨ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑺𝑯𝑰𝑺𝑯𝑰𝑹 𝑩𝑶𝑻\n` +
          `╰━━━━━━━━━━━━━━━━━━━━━━╯`,
        attachment: fs.createReadStream(filePath)
      });

    } catch (error) {
      console.error("TikTok Error:", error.message);

      await message.reply(
        "╭━━━〔 ⚠️ 𝑬𝑹𝑹𝑶𝑹 〕━━━╮\n" +
        "┃\n" +
        "┃ ❌ 𝑽𝒊𝒅𝒆𝒐 𝒅𝒐𝒘𝒏𝒍𝒐𝒂𝒅 𝒇𝒂𝒊𝒍𝒆𝒅!\n" +
        "┃ 🔄 𝑷𝒍𝒆𝒂𝒔𝒆 𝒕𝒓𝒚 𝒂𝒈𝒂𝒊𝒏 𝒍𝒂𝒕𝒆𝒓.\n" +
        "┃\n" +
        "╰━━━━━━━━━━━━━━━━━━╯"
      );

    } finally {
      if (filePath && fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (error) {
          console.error("File cleanup error:", error.message);
        }
      }
    }
  }
};
