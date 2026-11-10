const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

function toBold(text) {
  const fontMap = {
    A:"𝘼",B:"𝘽",C:"𝘾",D:"𝘿",E:"𝙀",F:"𝙁",G:"𝙂",H:"𝙃",I:"𝙄",J:"𝙅",
    K:"𝙆",L:"𝙇",M:"𝙈",N:"𝙉",O:"𝙊",P:"𝙋",Q:"𝙌",R:"𝙍",S:"𝙎",T:"𝙏",
    U:"𝙐",V:"𝙑",W:"𝙒",X:"𝙓",Y:"𝙔",Z:"𝙕",
    a:"𝙖",b:"𝙗",c:"𝙘",d:"𝙚",e:"𝙚",f:"𝙛",g:"𝙜",h:"𝙝",i:"𝙞",j:"𝙟",
    k:"𝙠",l:"𝙡",m:"𝙢",n:"𝙣",o:"𝙤",p:"𝙥",q:"𝙦",r:"𝙧",s:"𝙨",t:"𝙩",
    u:"𝙪",v:"𝙫",w:"𝙬",x:"𝙭",y:"𝙮",z:"𝙯",
    0:"𝟬",1:"𝟭",2:"𝟮",3:"𝟯",4:"𝟰",5:"𝟱",6:"𝟲",7:"𝟳",8:"𝟴",9:"𝟵"
  };

  return String(text)
    .split("")
    .map(char => fontMap[char] || char)
    .join("");
}

module.exports = {
  config: {
    name: "video",
    aliases: ["vid", "yt3"],
    version: "5.1.0",
    author: "AH | 𝑺𝑯𝑰𝑺𝑯𝑰𝑹",
    countDown: 10,
    role: 0,
    shortDescription: {
      en: "Search and download video"
    },
    longDescription: {
      en: "Search YouTube video and send it"
    },
    category: "media",
    guide: {
      en: "{pn} <video name>"
    }
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const query = args.join(" ").trim();

    let statusMessage = null;
    let filePath = null;

    if (!query) {
      return api.sendMessage(
        `╭━━━〔 🎬 ${toBold("VIDEO SEARCH")} 〕━━━╮\n` +
        `┃ ❌ ${toBold("Please provide a video name!")}\n` +
        `┃━━━━━━━━━━━━━━━━━━\n` +
        `┃ 📌 ${toBold("Example:")}\n` +
        `┃ ${toBold("video Alan Walker Faded")}\n` +
        `╰━━━━━━━━━━━━━━━━━━━━╯`,
        threadID,
        messageID
      );
    }

    try {
      statusMessage = await api.sendMessage(
        `╭━━━〔 🔍 ${toBold("VIDEO SEARCH") } 〕━━━╮\n` +
        `┃━━━━━━━━━━━━━━━━━━\n` +
        `┃ 📌 ${toBold("Query:")} ${query}\n` +
        `┃ ⏳ ${toBold("Searching video...")}\n` +
        `╰━━━━━━━━━━━━━━━━━━━━╯`,
        threadID
      );

      const searchApi =
        `https://betadash-search-download.vercel.app/yt?search=${encodeURIComponent(query)}`;

      const searchResponse = await axios.get(searchApi, {
        timeout: 30000,
        headers: {
          "User-Agent": "Mozilla/5.0"
        }
      });

      const searchData = searchResponse.data;

      let video =
        searchData?.[0] ||
        searchData?.results?.[0] ||
        searchData?.data?.[0] ||
        searchData?.result?.[0] ||
        searchData?.result;

      if (!video) {
        throw new Error("No video found!");
      }

      const youtubeUrl =
        video.url ||
        video.link ||
        video.videoUrl ||
        video.video_url;

      if (!youtubeUrl) {
        throw new Error("Video URL not found!");
      }

      if (statusMessage?.messageID) {
        await api.unsendMessage(statusMessage.messageID).catch(() => {});
      }

      statusMessage = await api.sendMessage(
        `╭━━━〔 🎬 ${toBold("VIDEO FOUND")} 〕━━━╮\n` +
        `┃━━━━━━━━━━━━━━━━━━\n` +
        `┃ 📖 ${toBold("Title:")}\n` +
        `┃ ${video.title || query}\n` +
        `┃━━━━━━━━━━━━━━━━━━\n` +
        `┃ ⏳ ${toBold("Preparing video...")}\n` +
        `╰━━━━━━━━━━━━━━━━━━━━╯`,
        threadID
      );

      const downloadApi =
        `https://yt-api-imran.vercel.app/api?url=${encodeURIComponent(youtubeUrl)}`;

      const downloadResponse = await axios.get(downloadApi, {
        timeout: 90000,
        headers: {
          "User-Agent": "Mozilla/5.0",
          "Accept": "application/json"
        }
      });

      const data = downloadResponse.data;

      const downloadUrl =
        data?.downloadUrl ||
        data?.download_url ||
        data?.videoUrl ||
        data?.video_url ||
        data?.url ||
        data?.download ||
        data?.result?.downloadUrl ||
        data?.result?.url ||
        data?.data?.downloadUrl ||
        data?.data?.url;

      if (!downloadUrl || typeof downloadUrl !== "string") {
        throw new Error("Download URL not found!");
      }

      const cacheDir = path.join(process.cwd(), "cache");
      await fs.ensureDir(cacheDir);

      filePath = path.join(
        cacheDir,
        `shishir_video_${Date.now()}.mp4`
      );

      const response = await axios({
        method: "GET",
        url: downloadUrl,
        responseType: "stream",
        timeout: 180000,
        maxContentLength: 50 * 1024 * 1024,
        maxBodyLength: 50 * 1024 * 1024,
        headers: {
          "User-Agent": "Mozilla/5.0",
          "Accept": "*/*"
        }
      });

      const writer = fs.createWriteStream(filePath);

      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        response.data.on("error", reject);
        writer.on("error", reject);
        writer.on("finish", resolve);
      });

      if (!(await fs.pathExists(filePath))) {
        throw new Error("Video file was not created!");
      }

      const stats = await fs.stat(filePath);

      if (!stats.size || stats.size < 10000) {
        throw new Error("Invalid video file!");
      }

      const fileSizeMB = stats.size / (1024 * 1024);

      if (fileSizeMB > 25) {
        throw new Error(
          `Video size is too large (${fileSizeMB.toFixed(1)}MB)`
        );
      }

      if (statusMessage?.messageID) {
        await api.unsendMessage(statusMessage.messageID).catch(() => {});
      }

      await api.sendMessage(
        {
          body:
            `╭━━━〔 🎬 ${toBold("VIDEO READY")} 〕━━━╮\n` +
            `┃━━━━━━━━━━━━━━━━━━\n` +
            `┃ 📖 ${toBold("Title:")}\n` +
            `┃ ${video.title || query}\n` +
            `┃ ⏱ ${toBold("Duration:")} ${video.time || "Unknown"}\n` +
            `┃ 💾 ${toBold("Size:")} ${fileSizeMB.toFixed(1)} MB\n` +
            `┃━━━━━━━━━━━━━━━━━━\n` +
            `┃ 👑 ${toBold("OWNER:")} 𝙎𝙃𝙄𝙎𝙃𝙄𝙍\n` +
            `╰━━━━━━━━━━━━━━━━━━━━╯`,
          attachment: fs.createReadStream(filePath)
        },
        threadID,
        async () => {
          if (filePath && await fs.pathExists(filePath)) {
            await fs.remove(filePath).catch(() => {});
          }
        },
        messageID
      );

    } catch (error) {
      console.error("VIDEO ERROR:", error);

      if (statusMessage?.messageID) {
        await api.unsendMessage(statusMessage.messageID).catch(() => {});
      }

      if (filePath && await fs.pathExists(filePath)) {
        await fs.remove(filePath).catch(() => {});
      }

      return api.sendMessage(
        `╭━━━〔 ❌ ${toBold("VIDEO FAILED")} 〕━━━╮\n` +
        `┃━━━━━━━━━━━━━━━━━━\n` +
        `┃ ⚠️ ${toBold("Error:")}\n` +
        `┃ ${error.message || "Unknown error"}\n` +
        `┃━━━━━━━━━━━━━━━━━━\n` +
        `┃ 💡 ${toBold("Try another video name!")}\n` +
        `┃ 👑 ${toBold("SHISHIR")}\n` +
        `╰━━━━━━━━━━━━━━━━━━━━╯`,
        threadID,
        messageID
      );
    }
  }
};
