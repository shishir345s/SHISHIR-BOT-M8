const mongoose = require("mongoose");

const BankUser = mongoose.models.DiabloBankUser || mongoose.model("DiabloBankUser", new mongoose.Schema({
userID: { type: String, required: true, unique: true },
balance: { type: Number, default: 1000 }
}));

const LuckyStats = mongoose.models.LuckyStats || mongoose.model("LuckyStats", new mongoose.Schema({
userID: { type: String, required: true, unique: true },
wins: { type: Number, default: 0 },
rounds: { type: Number, default: 0 },
bestWin: { type: Number, default: 0 },
spins: { type: Number, default: 30 },
lastReset: { type: Date, default: Date.now }
}));

let emojis = ["⭐","🔮","💠","✨","👑","💎","🎁","🍀"]

function formatMoney(num) {
if (num >= 1000000000) return (num / 1000000000).toFixed(1).replace(/\.0$/, "") + "B";
if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
return num.toLocaleString();
}

function getTimeLeft(ms) {
let h = Math.floor(ms / 3600000);
let m = Math.floor((ms % 3600000) / 60000);
return `${h}h ${m}m`;
}

module.exports = {
config: {
name: "spin",
aliases: ["spin", "ls"],
version: "2.0",
author: "Sazzad",
countDown: 2,
role: 0,
shortDescription: "Lucky Spin 2H Reset",
category: "game",
guide: { en: "{p}luckyspin\n{p}luckyspin top" }
},

onStart: async function({ api, event, args, message, usersData }) {
const uid = event.senderID;
let user = await BankUser.findOne({ userID: uid }) || await BankUser.create({ userID: uid });
let stats = await LuckyStats.findOne({ userID: uid }) || await LuckyStats.create({ userID: uid });

// 2h reset check
let now = Date.now();
let diff = now - stats.lastReset;
if(diff >= 7200000) { // 2 hours = 7200000ms
stats.spins = 30;
stats.lastReset = now;
await stats.save();
}

if(args[0] == "top") {
let top = await LuckyStats.find().sort({bestWin: -1}).limit(10);
let msg = `👑 𝗟𝗨𝗖𝗞𝗬𝗦𝗣𝗜𝗡 𝗟𝗘𝗔𝗗𝗘𝗥𝗕𝗢𝗔𝗥𝗗 👑\n⇝━━━━━━━━━━⇜\n\n`;
for(let i = 0; i < top.length; i++) {
let name = await usersData.getName(top[i].userID);
msg += `🏅 #${i+1} ${name}\n💎 Best Win: $${formatMoney(top[i].bestWin)}\n🎯 Total Wins: ${top[i].wins}\n\n`;
}
return message.reply(msg);
}

if(stats.spins <= 0) {
let left = 7200000 - diff;
return message.reply(`🎟️ 𝗡𝗢 𝗦𝗣𝗜𝗡𝗦 𝗟𝗘𝗙𝗧!\n⏰ Reset in: ${getTimeLeft(left)}\n\nUse #luckyspin top to see ranking`);
}

stats.spins -= 1;
stats.rounds += 1;

// spin result
let r1 = emojis[Math.floor(Math.random() * emojis.length)];
let r2 = emojis[Math.floor(Math.random() * emojis.length)];
let r3 = emojis[Math.floor(Math.random() * emojis.length)];
let result = [r1, r2, r3];

let win = 0;
let status = "❌ 𝐋𝐎𝐒𝐓!";
let color = "🔴";

if(r1 == r2 && r2 == r3) {
win = Math.floor(Math.random() * 90000000) + 10000000; // 10M - 100M
status = "👑 𝐉𝐀𝐂𝐊𝐏𝐎𝐓!!!";
color = "🟡";
stats.wins += 1;
if(win > stats.bestWin) stats.bestWin = win;
} else if(r1 == r2 || r2 == r3 || r1 == r3) {
win = Math.floor(Math.random() * 9000000) + 1000000; // 1M - 10M
status = "🟢 𝐍𝐈𝐂𝐄 𝐇𝐈𝐓!";
color = "🟢";
stats.wins += 1;
if(win > stats.bestWin) stats.bestWin = win;
}

user.balance += win;
await user.save();
await stats.save();

let winrate = stats.rounds > 0? ((stats.wins/stats.rounds)*100).toFixed(1) : 0;

let reply = `✨ ═══ 𝗟𝗨𝗖𝗞𝗬𝗦𝗣𝗜𝗡 𝗥𝗘𝗦𝗨𝗟𝗧 ═══ ✨
┏━━━━━━━━━┓
┃   ${r1}  │  ${r2}  │  ${r3}   ┃
┗━━━━━━━━━━━━━━━━━┛
${color} ${status}
💰 𝗪𝗢𝗡: $${formatMoney(win)}

📊 𝗬𝗢𝗨𝗥 𝗦𝗧𝗔𝗧𝗦
├ 🏆 Wins: ${stats.wins}
├ 🎯 Rounds: ${stats.rounds}  
├ 📈 Winrate: ${winrate}%
├ 🔥 Best: $${formatMoney(stats.bestWin)}
├ 💎 Balance: $${formatMoney(user.balance)}
└ 🎟️ Spins Left: ${stats.spins}/30

👑 Type #luckyspin top for Global Ranking`;

return message.reply(reply);
}
};
