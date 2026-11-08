const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const baseApiUrl = async () => {
  const response = await axios.get(
    "https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json",
    { timeout: 15000 }
  );

  if (!response.data || !response.data.mahmud) {
    throw new Error("Base API URL not found");
  }

  return String(response.data.mahmud).replace(/\/+$/, "");
};

module.exports = {
  config: {
    name: "tikedit",
    version: "3.0",
    author: "𝑺𝑯𝑰𝑺𝑯𝑰𝑹",
    countDown: 10,
    role: 0,
    description: {
      en: "𝑺𝒆𝒂𝒓𝒄𝒉 𝒂𝒏𝒅 𝒅𝒐𝒘𝒏𝒍𝒐𝒂𝒅 𝑻𝒊𝒌𝑻𝒐𝒌 𝒆𝒅𝒊𝒕𝒔"
    },
    category: "media",
    guide: {
      en: "{pn} naruto edit"
    }
  },

  langs: {
    en: {
      noInput:
        "╭━━━〔 𝑻𝑰𝑲𝑬𝑫𝑰𝑻 〕━━━╮\n" +
        "┃ ⚠️ 𝑬𝒏𝒕𝒆𝒓 𝒂 𝒔𝒆𝒂𝒓𝒄𝒉 𝒌𝒆𝒚𝒘𝒐𝒓𝒅!\n" +
        "┃ 📌 𝑬𝒙𝒂𝒎𝒑𝒍𝒆: tikedit naruto edit\n" +
        "╰━━━━━━━━━━━━━━━━━━╯",
      tooLarge:
        "❌ 𝑽𝒊𝒅𝒆𝒐 𝒊𝒔 𝒍𝒂𝒓𝒈𝒆𝒓 𝒕𝒉𝒂𝒏 25 MB!",
      success:
        "╭━━━〔 🎬 𝑻𝑰𝑲𝑬𝑫𝑰𝑻 〕━━━╮\n" +
        "┃ 🔎 𝑸𝒖𝒆𝒓𝒚: %1\n" +
        "┃\n" +
        "┃ ✅ 𝑫𝒐𝒘𝒏𝒍𝒐𝒂𝒅 𝑪𝒐𝒎𝒑𝒍𝒆𝒕𝒆!\n" +
        "┃ ✨ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑺𝑯𝑰𝑺𝑯𝑰𝑹\n" +
        "╰━━━━━━━━━━━━━━━━━━╯",
      error: "❌ 𝑬𝒓𝒓𝒐𝒓: %1"
    }
  },

  onStart: async function ({ api, event, args, message, getLang }) {
    const keyword = args.join(" ").trim();

    if (!keyword) {
      return message.reply(getLang("noInput"));
    }

    const cacheDir = path.join(__dirname, "cache");
    await fs.ensureDir(cacheDir);

    const videoPath = path.join(
      cacheDir,
      `tikedit_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 8)}.mp4`
    );

    try {
      api.setMessageReaction(
        "⌛",
        event.messageID,
        () => {},
        true
      );

      const baseUrl = await baseApiUrl();

      console.log("TikEdit API:", `${baseUrl}/api/tiksr`);
      console.log("TikEdit Query:", keyword);

      // API থেকে প্রথমে JSON response নেওয়া হচ্ছে
      const apiResponse = await axios.get(
        `${baseUrl}/api/tiksr`,
        {
          params: { sr: keyword },
          timeout: 120000,
          responseType: "arraybuffer"
        }
      );

      const contentType =
        apiResponse.headers["content-type"] || "";

      let videoUrl = null;

      // API সরাসরি ভিডিও পাঠালে সেটি ফাইলে সেভ হবে
      if (contentType.includes("video")) {
        await fs.writeFile(videoPath, apiResponse.data);
      } else {
        // JSON response হলে URL বের করা হবে
        let result;

        try {
          result = JSON.parse(
            Buffer.from(apiResponse.data).toString("utf8")
          );
        } catch (e) {
          throw new Error(
            "API did not return valid JSON or video"
          );
        }

        console.log("TikEdit API Result:", result);

        videoUrl =
          result.video_url ||
          result.videoUrl ||
          result.url ||
          result.data?.video_url ||
          result.data?.videoUrl ||
          result.data?.url;

        if (Array.isArray(result.data)) {
          const item = result.data[0];
          videoUrl =
            item?.video_url ||
            item?.videoUrl ||
            item?.url ||
            videoUrl;
        }

        if (!videoUrl || typeof videoUrl !== "string") {
          throw new Error(
            "Video URL not found in API response"
          );
        }

        // URL থেকে ভিডিও ডাউনলোড
        const videoResponse = await axios.get(videoUrl, {
          responseType: "arraybuffer",
          timeout: 120000,
          maxContentLength: 26214400,
          maxBodyLength: 26214400
        });

        await fs.writeFile(videoPath, videoResponse.data);
      }

      const stats = await fs.stat(videoPath);

      if (stats.size === 0) {
        throw new Error("Downloaded file is empty");
      }

      if (stats.size > 26214400) {
        api.setMessageReaction(
          "❌",
          event.messageID,
          () => {},
          true
        );

        return message.reply(getLang("tooLarge"));
      }

      await message.reply({
        body: getLang("success", keyword),
        attachment: fs.createReadStream(videoPath)
      });

      api.setMessageReaction(
        "✅",
        event.messageID,
        () => {},
        true
      );

    } catch (err) {
      console.error("TikEdit Error:", err);

      api.setMessageReaction(
        "❌",
        event.messageID,
        () => {},
        true
      );

      return message.reply(
        getLang("error", err.message)
      );

    } finally {
      if (await fs.pathExists(videoPath)) {
        try {
          await fs.remove(videoPath);
        } catch (cleanupError) {
          console.error(
            "Cleanup Error:",
            cleanupError.message
          );
        }
      }
    }
  }
};
