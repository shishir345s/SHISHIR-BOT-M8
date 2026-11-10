const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");
const sharp = require("sharp");

module.exports = {
config: {
name: "bra",
aliases: ["funbra"],
version: "1.0.0",
author: "SHISHIR",
role: 0,
cooldown: 5,
shortDescription: "Funny meme with profile picture overlay",
longDescription: "Overlay user profile picture on a funny meme template.",
category: "fun",
guide: {
en: "{pn} or {pn} @mention or reply to message"
}
},

onStart: async function ({ api, event, messageID, usersData }) {
const { threadID, senderID, mentions, messageReply } = event;

const cacheDir = path.join(__dirname, "cache");
const filePath = path.join(cacheDir, `bra_${Date.now()}.png`);

await fs.ensureDir(cacheDir);

api.setMessageReaction("😂", messageID, () => {}, true);

// Target Selection: Mention -> Reply -> Random Group Member
let targetID = senderID;

if (mentions && Object.keys(mentions).length > 0) {
  targetID = Object.keys(mentions)[0];
} else if (messageReply) {
  targetID = messageReply.senderID;
} else {
  try {
    const threadInfo = await api.getThreadInfo(threadID);
    const participantIDs = threadInfo.participantIDs || [];

    if (participantIDs.length > 0) {
      targetID =
        participantIDs[
          Math.floor(Math.random() * participantIDs.length)
        ];
    }
  } catch (e) {
    targetID = senderID;
  }
}

const memeMessages = [
  "😂 ভাই, আজকে আপনার স্টাইল একদম আলাদা!",
  "🔥 এই লুক দেখে সবাই অবাক!",
  "😎 ভাইয়ের এন্ট্রি মানেই আলাদা ভাইব!",
  "🤣 আজকের সেরা মজার চরিত্র হাজির!",
  "🕶️ স্টাইল তো পুরাই অন্য লেভেলের!"
];

const randomMsg =
  memeMessages[Math.floor(Math.random() * memeMessages.length)];

try {
  // Base Image URL
  const baseImgUrl = "https://i.imgur.com/0xlXrMR.jpeg";

  const baseResponse = await axios.get(baseImgUrl, {
    responseType: "arraybuffer",
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
    }
  });

  const baseImg = await loadImage(
    Buffer.from(baseResponse.data, "binary")
  );

  const width = baseImg.width;
  const height = baseImg.height;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  ctx.drawImage(baseImg, 0, 0, width, height);

  // Profile Picture Fetching
  let avtBuffer = null;
  const avatarSources = [];

  if (
    usersData &&
    typeof usersData.getAvatarUrl === "function"
  ) {
    try {
      const goatAvatar =
        await usersData.getAvatarUrl(targetID);

      if (goatAvatar) avatarSources.push(goatAvatar);
    } catch (e) {}
  }

  avatarSources.push(
    `https://www.facebook.com/p/a/${targetID}`
  );
  avatarSources.push(
    `https://unavatar.io/facebook/${targetID}`
  );
  avatarSources.push(
    `https://graph.facebook.com/${targetID}/picture?type=large`
  );

  for (const url of avatarSources) {
    try {
      const res = await axios.get(url, {
        responseType: "arraybuffer",
        timeout: 8000,
        headers: {
          "User-Agent": "Mozilla/5.0"
        }
      });

      if (res.data && res.data.byteLength > 500) {
        avtBuffer = Buffer.from(res.data, "binary");
        break;
      }
    } catch (e) {
      continue;
    }
  }

  if (!avtBuffer) {
    api.setMessageReaction("❌", messageID, () => {}, true);

    return api.sendMessage(
      "❌ User-er Profile Picture load kora jayni!",
      threadID,
      messageID
    );
  }

  // Face Position
  const faceX = Math.floor(width * 0.515);
  const faceY = Math.floor(height * 0.175);
  const faceRadius = Math.floor(width * 0.16);

  // Crop Avatar into Circle
  const croppedAvt = await sharp(avtBuffer)
    .resize(faceRadius * 2, faceRadius * 2)
    .composite([
      {
        input: Buffer.from(`
          <svg width="${faceRadius * 2}" height="${faceRadius * 2}">
            <circle
              cx="${faceRadius}"
              cy="${faceRadius}"
              r="${faceRadius}"
              fill="black"
            />
          </svg>
        `),
        blend: "dest-in"
      }
    ])
    .png()
    .toBuffer();

  const userFaceImg = await loadImage(croppedAvt);

  // Draw Profile Picture
  ctx.drawImage(
    userFaceImg,
    faceX - faceRadius,
    faceY - faceRadius,
    faceRadius * 2,
    faceRadius * 2
  );

  // Save Image
  const buffer = canvas.toBuffer("image/png");
  fs.writeFileSync(filePath, buffer);

  return api.sendMessage(
    {
      body: randomMsg,
      attachment: fs.createReadStream(filePath)
    },
    threadID,
    () => {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      if (global.gc) global.gc();
    },
    messageID
  );

} catch (error) {
  console.error(error);

  api.setMessageReaction("❌", messageID, () => {}, true);

  return api.sendMessage(
    `❌ | Error generating bra meme: ${error.message}`,
    threadID,
    messageID
  );
}

}
};
