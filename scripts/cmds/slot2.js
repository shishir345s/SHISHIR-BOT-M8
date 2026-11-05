const mongoose = require("mongoose");
const { createCanvas, loadImage } = require("canvas");
const fs = require("fs-extra");
const path = require("path");

const bankUserSchema = new mongoose.Schema({
  userID: { type: String, required: true, unique: true },
  balance: { type: Number, default: 0 }
});

const BankUser = mongoose.models.DiabloBankUser || mongoose.model("DiabloBankUser", bankUserSchema);

// Slot Machine Symbols
const symbols = ["🎰", "💎", "7️⃣", "👑", "🍒", "🍋", "🔔"];

// Maximum Bet Limit: 69 Billion
const MAX_BET = 20000000;

module.exports = {
  config: {
    name: "slot2",
    aliases: ["slots", "stlogame", "be11t"],
    version: "1.2.0",
    author: "Protik Shah",
    countDown: 5,
    role: 0,
    shortDescription: "Play Slot Machine Game & Win Bank Money",
    category: "games",
    guide: { en: "{p}slot <bet_amount / 1k / 1m / 1b / max>" }
  },

  formatMoney: function (num) {
    if (num >= 1000000000) return (num / 1000000000).toFixed(1).replace(/\.0$/, "") + "B";
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
    return num.toLocaleString();
  },

  parseBetAmount: function (input, userBalance) {
    if (!input) return null;
    const str = input.toString().trim().toLowerCase();

    if (str === "all" || str === "max") {
      return userBalance;
    }

    const match = str.match(/^(\d+(?:\.\d+)?)\s*([kmb])?$/);
    if (!match) return null;

    let value = parseFloat(match[1]);
    const unit = match[2];

    if (unit === "k") value *= 1000;
    else if (unit === "m") value *= 1000000;
    else if (unit === "b") value *= 1000000000;

    return Math.floor(value);
  },

  onStart: async function ({ api, event, args, message, usersData }) {
    const sendMsg = (txt) => message && typeof message.reply === "function" ? message.reply(txt) : api.sendMessage(txt, event.threadID, event.messageID);
    const { senderID } = event;

    const rawInput = args[0];
    if (!rawInput) {
      return sendMsg("⚠️ 𝗣𝗟𝗘𝗔𝗦𝗘 𝗘𝗡𝗧𝗘𝗥 𝗔 𝗩𝗔𝗟𝗜𝗗 𝗕𝗘𝗧 𝗔𝗠𝗢𝗨𝗡𝗧!\n👉 𝗘𝘅𝗮𝗺𝗽𝗹𝗲: !𝘀𝗹𝗼𝘁 𝟱𝟬𝟬, !𝘀𝗹𝗼𝘁 𝟭𝗸, !𝘀𝗹𝗼𝘁 𝟱𝗺, !𝘀𝗹𝗼𝘁 𝟭𝗯, !𝘀𝗹𝗼𝘁 𝗺𝗮𝘅");
    }

    try {
      let user = await BankUser.findOne({ userID: senderID });
      const currentBalance = user ? user.balance : 0;

      const betAmount = this.parseBetAmount(rawInput, currentBalance);

      if (betAmount === null || isNaN(betAmount) || betAmount <= 0) {
        return sendMsg("⚠️ 𝗜𝗡𝗩𝗔𝗟𝗜𝗗 𝗕𝗘𝗧 𝗙𝗢𝗥𝗠𝗔𝗧!\n👉 𝗨𝘀𝗲 𝗻𝘂𝗺𝗯𝗲𝗿𝘀 𝗼𝗿 𝘀𝘂𝗳𝗳𝗶𝘅𝗲𝘀 𝗹𝗶𝗸𝗲: 𝟭𝗸, 𝟮.𝟱𝗺, 𝟭𝗯, 𝗺𝗮𝘅");
      }

      // Check Max Bet Limit (69 Billion)
      if (betAmount > MAX_BET) {
        return sendMsg(`⚠️ 𝗠𝗔𝗫𝗜𝗠𝗨𝗠 𝗕𝗘𝗧 𝗟𝗜𝗠𝗜𝗧 𝗜𝗦 $${this.formatMoney(MAX_BET)} USD!`);
      }

      if (!user || currentBalance < betAmount) {
        return sendMsg(`❌ 𝗜𝗡𝗦𝗨𝗙𝗙𝗜𝗖𝗜𝗘𝗡𝗧 𝗕𝗔𝗟𝗔𝗡𝗖𝗘!\n💳 𝗬𝗼𝘂𝗿 𝗖𝘂𝗿𝗿𝗲𝗻𝘁 𝗕𝗮𝗹𝗮𝗻𝗰𝗲: $${this.formatMoney(currentBalance)} USD`);
      }

      let userName = senderID;
      if (usersData && typeof usersData.getName === "function") {
        try { userName = await usersData.getName(senderID); } catch (e) {}
      }

      // Spin Logic (3 Random Symbols)
      const slot1 = symbols[Math.floor(Math.random() * symbols.length)];
      const slot2 = symbols[Math.floor(Math.random() * symbols.length)];
      const slot3 = symbols[Math.floor(Math.random() * symbols.length)];

      let winMultiplier = 0;
      let isWin = false;

      if (slot1 === slot2 && slot2 === slot3) {
        winMultiplier = 5; // All 3 match = 5x payout
        isWin = true;
      } else if (slot1 === slot2 || slot2 === slot3 || slot1 === slot3) {
        winMultiplier = 2; // 2 match = 2x payout
        isWin = true;
      }

      const winAmount = isWin ? betAmount * winMultiplier : 0;
      const netChange = isWin ? winAmount - betAmount : -betAmount;
      
      // Update Database Balance
      user.balance += netChange;
      await user.save();

      // Canvas Rendering (Cyber Neon Slot Machine Card)
      const canvas = createCanvas(900, 500);
      const ctx = canvas.getContext("2d");

      // Dark Background
      ctx.fillStyle = "#050a14";
      ctx.fillRect(0, 0, 900, 500);

      // Multi-layer Laser Glow Outer Border
      const laserGlows = [
        { color: isWin ? "rgba(74, 222, 128, 0.2)" : "rgba(239, 68, 68, 0.2)", blur: 35, width: 14 },
        { color: isWin ? "#4ade80" : "#ef4444", blur: 15, width: 4 },
        { color: "#ffffff", blur: 4, width: 2 }
      ];

      laserGlows.forEach(g => {
        ctx.save();
        ctx.shadowColor = g.color;
        ctx.shadowBlur = g.blur;
        ctx.strokeStyle = g.color;
        ctx.lineWidth = g.width;
        ctx.strokeRect(20, 20, 860, 460);
        ctx.restore();
      });

      // Header Banner
      ctx.fillStyle = "#ffffff";
      ctx.font = "900 32px 'Segoe UI', Sans-serif";
      ctx.fillText("🎰 CASINO SLOT MACHINE 🎰", 50, 75);

      ctx.fillStyle = isWin ? "#4ade80" : "#ef4444";
      ctx.font = "bold 15px 'Segoe UI', Sans-serif";
      ctx.fillText(isWin ? `► BIG WIN! YOU WON ${winMultiplier}X MULTIPLIER` : "► BETTER LUCK NEXT TIME!", 52, 102);

      // User Avatar Render
      try {
        const avatarUrl = `https://graph.facebook.com/${senderID}/picture?height=300&width=300&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
        const avatarImg = await loadImage(avatarUrl);

        ctx.save();
        ctx.shadowColor = isWin ? "#4ade80" : "#ef4444";
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(740, 115, 60, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(avatarImg, 680, 55, 120, 120);
        ctx.restore();

        ctx.strokeStyle = isWin ? "#4ade80" : "#ef4444";
        ctx.lineWidth = 4;
        ctx.beginPath(); ctx.arc(740, 115, 60, 0, Math.PI * 2); ctx.stroke();
      } catch (e) {}

      // 3 Slot Reel Boxes
      const reels = [slot1, slot2, slot3];
      const startX = 140;

      for (let i = 0; i < 3; i++) {
        const boxX = startX + (i * 210);
        const boxY = 150;

        // Reel Box Background
        ctx.fillStyle = "rgba(15, 23, 42, 0.8)";
        ctx.beginPath();
        ctx.roundRect(boxX, boxY, 180, 180, 16);
        ctx.fill();

        ctx.strokeStyle = isWin ? "#4ade80" : "rgba(255, 255, 255, 0.15)";
        ctx.lineWidth = 3;
        ctx.stroke();

        // Symbol Render
        ctx.fillStyle = "#ffffff";
        ctx.font = "80px 'Segoe UI Emoji', 'Segoe UI', Sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(reels[i], boxX + 90, boxY + 118);
        ctx.textAlign = "left";
      }

      // Footer Stats Dashboard
      ctx.fillStyle = "#64748b";
      ctx.font = "bold 14px 'Segoe UI', Sans-serif";
      ctx.fillText("PLAYER", 50, 385);
      ctx.fillText("BET AMOUNT", 300, 385);
      ctx.fillText(isWin ? "PROFIT" : "LOSS", 520, 385);
      ctx.fillText("NEW BALANCE", 700, 385);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 20px 'Segoe UI', Sans-serif";
      const shortName = userName.length > 15 ? userName.substring(0, 15) + "..." : userName;
      ctx.fillText(shortName, 50, 415);

      ctx.fillStyle = "#38bdf8";
      ctx.fillText(`$${this.formatMoney(betAmount)}`, 300, 415);

      ctx.fillStyle = isWin ? "#4ade80" : "#ef4444";
      ctx.fillText(`${isWin ? "+" : "-"}$${this.formatMoney(Math.abs(isWin ? winAmount : betAmount))}`, 520, 415);

      ctx.fillStyle = "#f1c40f";
      ctx.fillText(`$${this.formatMoney(user.balance)}`, 700, 415);

      // Save and Send Attachment
      const cacheDir = path.join(__dirname, "cache");
      await fs.ensureDir(cacheDir);
      const cachePath = path.join(cacheDir, `slot_${senderID}_${Date.now()}.png`);
      await fs.writeFile(cachePath, canvas.toBuffer("image/png"));

      const payload = {
        body: isWin 
          ? `🎉 𝗖𝗢𝗡𝗚𝗥𝗔𝗧𝗨𝗟𝗔𝗧𝗜𝗢𝗡𝗦 ${userName.toUpperCase()}!\n💎 𝗬𝗢𝗨 𝗪𝗢𝗡 $${this.formatMoney(winAmount)} USD!` 
          : `💔 𝗕𝗘𝗧𝗧𝗘𝗥 𝗟𝗨𝗖𝗞 𝗡𝗘𝗫𝗧 𝗧𝗜𝗠𝗘 ${userName.toUpperCase()}!\n📉 𝗬𝗢𝗨 𝗟𝗢𝗦𝗧 $${this.formatMoney(betAmount)} USD!`,
        attachment: fs.createReadStream(cachePath)
      };

      const sendCallback = () => { if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath); };
      return message && typeof message.reply === "function" ? message.reply(payload, sendCallback) : api.sendMessage(payload, event.threadID, sendCallback, event.messageID);

    } catch (err) {
      console.error(err);
      return sendMsg("❌ 𝗦𝗟𝗢𝗧 𝗚𝗔𝗠𝗘 𝗘𝗥𝗥𝗢𝗥!");
    }
  }
};
