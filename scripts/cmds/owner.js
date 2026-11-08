"use strict";

const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
    config: {
        name: "owner",
        version: "4.1.0",
        author: "SHISHIR",
        countDown: 3,
        role: 0,
        shortDescription: "Owner information",
        longDescription: "SHISHIR Owner Information",
        category: "info",
        guide: "{pn}"
    },

    onStart: async function ({ api, event }) {

        const ownerImage = "https://i.imgur.com/Boccigo.jpeg";

        const ownerDetails = `
╭━━━❮ 👑 𝗢𝗪𝗡𝗘𝗥 𝗜𝗡𝗙𝗢𝗥𝗠𝗔𝗧𝗜𝗢𝗡 👑 ❯━━━╮

        ⚡ 𝗦𝗛𝗜𝗦𝗛𝗜𝗥 𝗔𝗛𝗠𝗘𝗗 ⚡
   ───━━━━━───━━━───━━━━━───

👤 𝗣𝗘𝗥𝗦𝗢𝗡𝗔𝗟 𝗜𝗡𝗙𝗢
━━━━━━━━━━━━━━━━━━━━
▸ 𝗙𝘂𝗹𝗹 𝗡𝗮𝗺𝗲 : 𝗦𝗵𝗶𝘀𝗵𝗶𝗿 (শিশির)
▸ 𝗡𝗶𝗰𝗸 𝗡𝗮𝗺𝗲 : YOUR ABBU
▸ 𝗔𝗴𝗲        : 17+
▸ 𝗥𝗲𝗹𝗶𝗴𝗶𝗼𝗻   : 𝗜𝘀𝗹𝗮𝗺
▸ 𝗡𝗮𝘁𝗶𝗼𝗻𝗮𝗹𝗶𝘁𝘆: 𝗕𝗮𝗻𝗴𝗹𝗮𝗱𝗲𝘀𝗵𝗶 🇧🇩

🏡 𝗔𝗗𝗗𝗥𝗘𝗦𝗦 & 𝗟𝗢𝗖𝗔𝗧𝗜𝗢𝗡
━━━━━━━━━━━━━━━━━━━━
▸ 𝗩𝗶𝗹𝗹𝗮𝗴𝗲  : [🙂🙂🙂]
▸ 𝗧𝗵𝗮𝗻𝗮    : [owh owh owh]
▸ 𝗗𝗶𝘀𝘁𝗿𝗶𝗰𝘁 : [🙂🙂🙂]
▸ 𝗗𝗶𝘃𝗶𝘀𝗶𝗼𝗻 : [Dhaka]

💻 𝗣𝗥𝗢𝗙𝗘𝗦𝗦𝗜𝗢𝗡 & 𝗦𝗞𝗜𝗟𝗟𝗦
━━━━━━━━━━━━━━━━━━━━
▸ 𝗢𝗰𝗰𝘂𝗽𝗮𝘁𝗶𝗼𝗻 : 𝗦𝘁𝘂𝗱𝗲𝗻𝘁 & 𝗗𝗲𝘃𝗲𝗹𝗼𝗽𝗲𝗿
▸ 𝗘𝘅𝗽𝗲𝗿𝘁𝗶𝘀𝗲   : 𝗝𝗮𝘃𝗮𝗦𝗰𝗿𝗶𝗽𝘁, 𝗡𝗼𝗱𝗲.𝗷𝘀 & 𝗕𝗼𝘁 𝗠𝗮𝗸𝗶𝗻𝗴
▸ 𝗛𝗼𝗯𝗯𝗶𝗲𝘀     : 𝗖𝗼𝗱𝗶𝗻𝗴, 𝗚𝗮𝗺𝗶𝗻𝗴, 𝗧𝗿𝗮𝘃𝗲𝗹𝗶𝗻𝗴

🌐 𝗖𝗢𝗡𝗧𝗔𝗖𝗧 & 𝗦𝗢𝗖𝗜𝗔𝗟𝗦
━━━━━━━━━━━━━━━━━━━━
▸ 𝗙𝗮𝗰𝗲𝗯𝗼𝗼𝗸  : https://facebook.com/shishir_fb_id
▸ 𝗜𝗻𝘀𝘁𝗮𝗴𝗿𝗮𝗺 : https://instagram.com/shishir_insta
▸ 𝗪𝗵𝗮𝘁𝘀𝗔𝗽𝗽  : +88017493--26
▸ 𝗧𝗲𝗹𝗲𝗴𝗿𝗮𝗺  : https://t.me/shishir_tg
▸ 𝗚𝗶𝘁𝗛𝘂𝗯    : https://github.com/shishir_dev

💬 𝗢𝗪𝗡𝗘𝗥'𝗦 𝗡𝗢𝗧𝗘
━━━━━━━━━━━━━━━━━━━━
"𝙆𝙤𝙣𝙤 𝙥𝙧𝙤𝙗𝙡𝙚𝙢 𝙝𝙤𝙞𝙡𝙚 𝙨𝙤𝙟𝙖
𝙄𝙣𝙗𝙤𝙭 𝙡𝙤𝙟𝙟𝙖 𝙭𝙪𝙙𝙖𝙞𝙮𝙤 😎🔥"

╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
      ✨ 𝗗𝗲𝘃𝗲𝗹𝗼𝗽𝗲𝗱 𝗕𝘆 𝗦𝗛𝗜𝗦𝗛𝗜𝗥 ✨
`;

        const cacheDir = path.join(__dirname, "cache");

        try {
            // Cache folder তৈরি
            await fs.ensureDir(cacheDir);

            // Image download
            const imagePath = path.join(cacheDir, "shishir-owner.jpg");

            const response = await axios({
                method: "GET",
                url: ownerImage,
                responseType: "arraybuffer",
                timeout: 20000,
                headers: {
                    "User-Agent": "Mozilla/5.0"
                }
            });

            await fs.writeFile(imagePath, response.data);

            // Image + Owner Info send
            await api.sendMessage(
                {
                    body: ownerDetails,
                    attachment: fs.createReadStream(imagePath)
                },
                event.threadID,
                event.messageID
            );

            // Temporary image delete
            setTimeout(async () => {
                try {
                    if (await fs.pathExists(imagePath)) {
                        await fs.remove(imagePath);
                    }
                } catch (e) {
                    console.error("OWNER CACHE DELETE ERROR:", e);
                }
            }, 10000);

        } catch (error) {
            console.error("OWNER JS ERROR:", error);

            // Image কাজ না করলে শুধু text পাঠাবে
            try {
                await api.sendMessage(
                    ownerDetails,
                    event.threadID,
                    event.messageID
                );
            } catch (sendError) {
                console.error("OWNER TEXT SEND ERROR:", sendError);
            }
        }
    }
};
