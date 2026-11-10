const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");

module.exports = {
  config: {
    name: "jolpori",
    aliases: ["mermaid", "jolpori", "jp"],
    version: "2.0",
    author: "SHISHIR",
    countDown: 5,
    role: 0,

    shortDescription: {
      en: "Create a mermaid picture"
    },

    description: {
      en: "Reply to a message to create a mermaid picture"
    },

    category: "fun"
  },

  onStart: async function ({ api, event }) {
    try {
      const threadID = event.threadID;
      const messageID = event.messageID;

      // ==============================
      // 🧜‍♀️ JOLPORI BACKGROUND IMAGE
      // ==============================
      const MERMAID_IMAGE_URL =
        "https://i.imgur.com/0FeUWva.jpeg";

      // ==============================
      // 👤 USER ID
      // ==============================
      let userID = event.senderID;

      // Reply করলে যাকে reply করা হয়েছে তার ছবি নেবে
      if (
        event.type === "message_reply" &&
        event.messageReply &&
        event.messageReply.senderID
      ) {
        userID = event.messageReply.senderID;
      }

      // ==============================
      // 👤 PROFILE PICTURE
      // ==============================
      const avatarURL =
        `https://graph.facebook.com/${userID}/picture?width=500&height=500`;

      // ==============================
      // 🎨 CANVAS
      // ==============================
      const width = 800;
      const height = 800;

      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");

      // ==============================
      // 🖼️ LOAD IMAGES
      // ==============================
      const background = await loadImage(MERMAID_IMAGE_URL);
      const avatar = await loadImage(avatarURL);

      // ==============================
      // 🧜‍♀️ DRAW BACKGROUND
      // ==============================
      ctx.drawImage(
        background,
        0,
        0,
        width,
        height
      );

      // ==============================
      // 👤 PROFILE PIC POSITION
      // ==============================
      const faceX = 340;
      const faceY = 145;
      const faceSize = 125;

      // গোল profile picture
      ctx.save();

      ctx.beginPath();

      ctx.arc(
        faceX + faceSize / 2,
        faceY + faceSize / 2,
        faceSize / 2,
        0,
        Math.PI * 2
      );

      ctx.closePath();
      ctx.clip();

      ctx.drawImage(
        avatar,
        faceX,
        faceY,
        faceSize,
        faceSize
      );

      ctx.restore();

      // ==============================
      // 📁 CACHE FOLDER
      // ==============================
      const cacheDir = path.join(
        __dirname,
        "cache"
      );

      await fs.ensureDir(cacheDir);

      // ==============================
      // 💾 OUTPUT FILE
      // ==============================
      const outputPath = path.join(
        cacheDir,
        `jolpori_${userID}.png`
      );

      fs.writeFileSync(
        outputPath,
        canvas.toBuffer("image/png")
      );

      // ==============================
      // 📤 SEND IMAGE
      // ==============================
      api.sendMessage(
        {
          body:
            "🧜‍♀️ 𝗝𝗢𝗟𝗣𝗢𝗥𝗜 𝗠𝗢𝗗𝗘 🧜‍♀️\n\n✨ এই নাও তোমার জলপরী রূপ! 💙",
          attachment: fs.createReadStream(outputPath)
        },
        threadID,
        () => {
          // ==============================
          // 🗑️ DELETE CACHE
          // ==============================
          try {
            if (fs.existsSync(outputPath)) {
              fs.unlinkSync(outputPath);
            }
          } catch (deleteError) {
            console.log(
              "Cache delete error:",
              deleteError.message
            );
          }
        },
        messageID
      );

    } catch (error) {
      console.error(
        "JOLPORI ERROR:",
        error
      );

      api.sendMessage(
        "⚠️ জলপরীর ছবি তৈরি করতে সমস্যা হয়েছে!\n\n🔧 আবার চেষ্টা করো।",
        event.threadID,
        event.messageID
      );
    }
  }
};
