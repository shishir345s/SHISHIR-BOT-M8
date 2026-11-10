"use strict";

const axios = require("axios");

const videos = [
    "https://files.catbox.moe/64j2e9.mp4",
    "https://files.catbox.moe/rmmylk.mp4",
    "https://files.catbox.moe/hzjhf3.mp4",
    "https://files.catbox.moe/940m54.mp4",
    "https://files.catbox.moe/vqwv4v.mp4",
    "https://files.catbox.moe/ar4jwu.mp4",
    "https://files.catbox.moe/1klhhk.mp4",
    "https://files.catbox.moe/7cp9ni.mp4",
    "https://files.catbox.moe/bpoajx.mp4",
    "https://files.catbox.moe/gzu6cv.mp4",
    "https://files.catbox.moe/pj1r2a.mp4",
    "https://files.catbox.moe/vzhgip.mp4",
    "https://files.catbox.moe/zvc83c.mp4",
    "https://files.catbox.moe/8m3s8o.mp4",
    "https://files.catbox.moe/t3kqch.mp4",
    "https://files.catbox.moe/0181ap.mp4",
    "https://files.catbox.moe/08h7s2.mp4",
    "https://files.catbox.moe/44wboe.mp4",
    "https://files.catbox.moe/48uaca.mp4"
];

module.exports = {
    config: {
        name: "mtgirls",
        version: "1.0.0",
        author: "SHISHIR",
        countDown: 5,
        role: 0,
        shortDescription: "Random video",
        longDescription: "Send random video from Catbox",
        category: "media",
        guide: "{pn}"
    },

    onStart: async function ({ message }) {
        try {
            const video =
                videos[Math.floor(Math.random() * videos.length)];

            const response = await axios.get(video, {
                responseType: "stream"
            });

            return message.reply({
                body:
                    "╭━━━『 𝐌𝐓 𝐆𝐈𝐑𝐋𝐒 』━━━╮\n\n" +
                    "   ✨ 𝐑𝐚𝐧𝐝𝐨𝐦 𝐕𝐢𝐝𝐞𝐨\n" +
                    "   👑 𝐌𝐀𝐃𝐄 𝐁𝐘 𝐒𝐇𝐈𝐒𝐇𝐈𝐑\n\n" +
                    "╰━━━━━━━━━━━━━━━━╯",
                attachment: response.data
            });

        } catch (error) {
            return message.reply("❌ Video পাঠানো যায়নি!");
        }
    }
};
