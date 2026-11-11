const login = require("facebook-chat-api");
const ytsr = require("ytsr");
const fs = require("fs");

// ╔══════════════════════════════╗
//        🎵 𝗦𝗛𝗜𝗦𝗛𝗜𝗥 𝗕𝗢𝗧
// ╚══════════════════════════════╝

// ────────── 🔐 APPSTATE ──────────
if (!fs.existsSync("./appstate.json")) {
console.log("❌ | 𝗔𝗣𝗣𝗦𝗧𝗔𝗧𝗘.𝗝𝗦𝗢𝗡 𝗡𝗢𝗧 𝗙𝗢𝗨𝗡𝗗!");
process.exit(1);
}

let appState;

try {
appState = JSON.parse(
fs.readFileSync("./appstate.json", "utf8")
);
} catch (error) {
console.log("❌ | 𝗔𝗣𝗣𝗦𝗧𝗔𝗧𝗘 𝗥𝗘𝗔𝗗 𝗙𝗔𝗜𝗟𝗘𝗗!");
process.exit(1);
}

// ────────── 🔤 FONT ──────────
const bold = (text = "") => {
const map = {
A:"𝗔",B:"𝗕",C:"𝗖",D:"𝗗",E:"𝗘",F:"𝗙",G:"𝗚",
H:"𝗛",I:"𝗜",J:"𝗝",K:"𝗞",L:"𝗟",M:"𝗠",N:"𝗡",
O:"𝗢",P:"𝗣",Q:"𝗤",R:"𝗥",S:"𝗦",T:"𝗧",U:"𝗨",
V:"𝗩",W:"𝗪",X:"𝗫",Y:"𝗬",Z:"𝗭",

a:"𝗮",b:"𝗯",c:"𝗰",d:"𝗱",e:"𝗲",f:"𝗳",g:"𝗴",
h:"𝗵",i:"𝗶",j:"𝗷",k:"𝗸",l:"𝗹",m:"𝗺",n:"𝗻",
o:"𝗼",p:"𝗽",q:"𝗾",r:"𝗿",s:"𝘀",t:"𝘁",u:"𝘂",
v:"𝘃",w:"𝘄",x:"𝘅",y:"𝘆",z:"𝘇"

};

return String(text)
.split("")
.map(x => map[x] || x)
.join("");
};

// ────────── 🔐 LOGIN ──────────
login(
{
appState,
forceLogin: true
},
(err, api) => {

if (err) {
  console.log("❌ | 𝗟𝗢𝗚𝗜𝗡 𝗙𝗔𝗜𝗟𝗘𝗗!");
  console.log(err);
  return;
}

console.log(`

╔══════════════════════════════╗
🤖 𝗦𝗛𝗜𝗦𝗛𝗜𝗥 𝗕𝗢𝗧
╠══════════════════════════════╣
✅ 𝗕𝗢𝗧 𝗜𝗦 𝗢𝗡𝗟𝗜𝗡𝗘
🎵 𝗦𝗢𝗡𝗚 𝗦𝗘𝗔𝗥𝗖𝗛 𝗥𝗘𝗔𝗗𝗬
👑 𝗢𝗪𝗡𝗘𝗥: 𝗦𝗛𝗜𝗦𝗛𝗜𝗥
╚══════════════════════════════╝
`);

api.setOptions({
  listenEvents: true,
  selfListen: false,
  logLevel: "silent"
});

// ────────── 🎧 LISTENER ──────────
api.listenMqtt(async (err, event) => {

  if (err) {
    console.log("❌ | 𝗟𝗜𝗦𝗧𝗘𝗡 𝗘𝗥𝗥𝗢𝗥:", err);
    return;
  }

  try {

    // শুধু Message Event
    if (
      !event ||
      event.type !== "message" ||
      !event.body
    ) return;

    // নিজের Message Ignore
    if (
      event.senderID === api.getCurrentUserID()
    ) return;

    const text = event.body.trim();
    const threadID = event.threadID;

    // ────────── 🎵 SONG COMMAND ──────────
    if (!text.toLowerCase().startsWith(".song")) {
      return;
    }

    const query = text
      .slice(5)
      .trim();

    // ────────── ❌ NO QUERY ──────────
    if (!query) {

      return api.sendMessage(

"╭━━━〔 🎵 𝗦𝗢𝗡𝗚 𝗦𝗘𝗔𝗥𝗖𝗛 〕━━━╮ ┃ ┃ 📝 𝗨𝗦𝗔𝗚𝗘: ┃ ➤ .song <song name> ┃ ┃ 💡 𝗘𝗫𝗔𝗠𝗣𝗟𝗘: ┃ ➤ .song tum hi ho ┃ ╰━━━━━━━━━━━━━━━━━━╯ 👑 𝗕𝗢𝗧 𝗕𝗬: 𝗦𝗛𝗜𝗦𝗛𝗜𝗥",
threadID
);
}

    // ────────── 🔍 SEARCHING ──────────
    api.sendMessage(

"╭━━━〔 🔎 𝗦𝗘𝗔𝗥𝗖𝗛𝗜𝗡𝗚 〕━━━╮ ┃ ┃ 🎵 𝗚𝗮𝗻 𝗸𝗵𝗼𝗷𝗮 𝗵𝗼𝗰𝗰𝗵𝗲... ┃ ⏳ 𝗣𝗹𝗲𝗮𝘀𝗲 𝘄𝗮𝗶𝘁! ┃ ╰━━━━━━━━━━━━━━━━━━╯",
threadID
);

    // ────────── 🔎 YOUTUBE SEARCH ──────────
    const results = await ytsr(query, {
      limit: 5
    });

    const video = results.items.find(
      item =>
        item &&
        item.type === "video" &&
        item.title &&
        item.url
    );

    // ────────── ❌ NOT FOUND ──────────
    if (!video) {

      return api.sendMessage(

"╭━━━〔 ❌ 𝗡𝗢𝗧 𝗙𝗢𝗨𝗡𝗗 〕━━━╮ ┃ ┃ 😔 𝗚𝗮𝗻 𝗽𝗮𝘄𝗮 𝗷𝗮𝘆𝗻𝗶! ┃ 🔄 𝗔𝗯𝗮𝗿 𝘁𝗿𝘆 𝗸𝗼𝗿𝗼। ┃ ╰━━━━━━━━━━━━━━━━━━╯ 👑 𝗦𝗛𝗜𝗦𝗛𝗜𝗥 𝗕𝗢𝗧",
threadID
);
}

    // ────────── 📋 VIDEO INFO ──────────
    const title = bold(video.title || "Unknown");

    const channel = bold(
      video.author?.name ||
      video.author?.channelName ||
      "Unknown"
    );

    const duration =
      video.duration || "Unknown";

    // ────────── 📤 SEND RESULT ──────────
    const message =

`╭━━━〔 🎵 𝗧𝗥𝗔𝗖𝗞 𝗙𝗢𝗨𝗡𝗗 〕━━━╮
┃
┃ 📌 𝗧𝗜𝗧𝗟𝗘:
┃ ${title}
┃
┃ 👤 𝗖𝗛𝗔𝗡𝗡𝗘𝗟:
┃ ${channel}
┃
┃ ⏱️ 𝗗𝗨𝗥𝗔𝗧𝗜𝗢𝗡:
┃ ${duration}
┃
╰━━━━━━━━━━━━━━━━━━╯

🔗 𝗬𝗢𝗨𝗧𝗨𝗕𝗘 𝗟𝗜𝗡𝗞:
${video.url}

╭━━━━━━━━━━━━━━━━━━╮
┃ 👑 𝗕𝗢𝗧 𝗕𝗬: 𝗦𝗛𝗜𝗦𝗛𝗜𝗥
╰━━━━━━━━━━━━━━━━━━╯`;

    api.sendMessage(
      message,
      threadID
    );

  } catch (error) {

    console.log(
      "❌ | 𝗦𝗢𝗡𝗚 𝗘𝗥𝗥𝗢𝗥:",
      error
    );

    if (event?.threadID) {

      api.sendMessage(

`╭━━━〔 ⚠️ 𝗘𝗥𝗥𝗢𝗥 〕━━━╮
┃
┃ 😔 𝗦𝗢𝗠𝗘𝗧𝗛𝗜𝗡𝗚 𝗪𝗘𝗡𝗧 𝗪𝗥𝗢𝗡𝗚!
┃ 🔄 𝗔𝗚𝗔𝗜𝗡 𝗧𝗥𝗬 𝗟𝗔𝗧𝗘𝗥।
┃
╰━━━━━━━━━━━━━━━━━━╯

👑 𝗦𝗛𝗜𝗦𝗛𝗜𝗥 𝗕𝗢𝗧`,
event.threadID
);

    }
  }

});

}
);
