const axios = require("axios");

module.exports = {
  config: {
    name: "footballgame",
    aliases: ["football2"],
    version: "2.0",
    author: "ARIYAN AI", // ← তোমার নাম এখানে
    countDown: 10,
    role: 0,
    category: "game",
    guide: "{pn}"
  },

  /* ================= START ================= */
  onStart: async function ({ api, event }) {
    try {
      const { senderID, threadID, messageID } = event;

      // API direct use (no external baseApi fetch = less memory use)
      const response = await axios.get("https://api-samir.onrender.com/api/football");
      const { name, image } = response.data;

      const correctAnswers = Array.isArray(name) ? name : [name];

      const imgStream = await axios({
        url: image,
        method: "GET",
        responseType: "stream"
      });

      api.sendMessage(
        {
          body: "⚽ A famous footballer appeared!\nReply with his name.\n⏳ 40 seconds time.",
          attachment: imgStream.data
        },
        threadID,
        (err, info) => {
          if (err) return;

          global.GoatBot.onReply.set(info.messageID, {
            commandName: this.config.name,
            author: senderID,
            answers: correctAnswers
          });

          // Auto delete after 40s
          setTimeout(() => {
            api.unsendMessage(info.messageID);
            global.GoatBot.onReply.delete(info.messageID);
          }, 40000);
        },
        messageID
      );

    } catch (err) {
      console.log(err);
      api.sendMessage("❌ API error.", event.threadID, event.messageID);
    }
  },

  /* ================= REPLY ================= */
  onReply: async function ({ api, event, Reply, usersData }) {
    if (event.senderID !== Reply.author) return;

    const reply = event.body.trim().toLowerCase();
    const isCorrect = Reply.answers.some(
      ans => ans.toLowerCase() === reply
    );

    const rewardCoin = 500;
    const rewardExp = 120;

    const userData = await usersData.get(event.senderID) || {};
    const currentMoney = userData.money || 0;
    const currentExp = userData.exp || 0;

    if (isCorrect) {
      await usersData.set(event.senderID, {
        money: currentMoney + rewardCoin,
        exp: currentExp + rewardExp
      });

      return api.sendMessage(
        `✅ Correct!\n💰 +${rewardCoin} coins\n⭐ +${rewardExp} exp`,
        event.threadID,
        event.messageID
      );
    } else {
      return api.sendMessage(
        `❌ Wrong!\nCorrect answer: ${Reply.answers.join(" / ")}`,
        event.threadID,
        event.messageID
      );
    }
  }
};
