const { getTime } = global.utils;

module.exports = {
  config: {
    name: "leave",
    version: "3.0",
    author: "SHISHIR",
    category: "events"
  },

  langs: {
    en: {
      defaultLeaveMessage:
        "╭━━━〔 𝐋𝐄𝐀𝐕𝐄 𝐀𝐋𝐄𝐑𝐓 〕━━━╮\n" +
        "┃ 👤 Member: {userNameTag}\n" +
        "┃ 🚪 Status: {type}\n" +
        "┃ 🕒 Time: {time}\n" +
        "╰━━━━━━━━━━━━━━━━━━╯"
    }
  },

  onStart: async function ({
    threadsData,
    message,
    event,
    api,
    usersData,
    getLang
  }) {
    if (event.logMessageType !== "log:unsubscribe") return;

    try {
      const { threadID, author } = event;
      const data = event.logMessageData || {};
      const leftID = data.leftParticipantFbId;

      if (!leftID) return;

      // Ignore the bot itself
      if (String(leftID) === String(api.getCurrentUserID())) return;

      const threadData = await threadsData.get(threadID);

      if (
        threadData.settings &&
        threadData.settings.sendLeaveMessage === false
      ) return;

      const userName = await usersData.getName(leftID);
      const isKicked =
        author && String(leftID) !== String(author);

      const hours = Number(getTime("HH"));

      let leaveMessage =
        threadData.data?.leaveMessage ||
        getLang("defaultLeaveMessage");

      leaveMessage = leaveMessage
        .replace(/\{userNameTag\}/g, userName)
        .replace(/\{userName\}/g, userName)
        .replace(/\{type\}/g, isKicked ? "was kicked" : "left")
        .replace(/\{time\}/g, String(hours).padStart(2, "0"));

      // Send text message only
      await message.send({
        body: leaveMessage,
        mentions: [{
          tag: userName,
          id: leftID
        }]
      });

      // Auto-add only when the user leaves voluntarily
      if (!isKicked) {
        try {
          await api.addUserToGroup(leftID, threadID);

          await message.send(
            `╭━━━〔 🔄 𝐀𝐔𝐓𝐎 𝐀𝐃𝐃 〕━━━╮\n` +
            `┃ 👤 Member: ${userName}\n` +
            `┃ ✅ Added back successfully!\n` +
            `╰━━━━━━━━━━━━━━━━━━╯`
          );
        } catch (error) {
          console.error("[AUTO ADD ERROR]", error.message);
        }
      }

    } catch (error) {
      console.error("[LEAVE ERROR]", error.message);
    }
  }
};
