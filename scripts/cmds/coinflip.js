// Fullwidth unicode style — distinct from other game commands' fonts
function fw(str) {
  return String(str).replace(/[A-Za-z0-9]/g, ch => {
    const code = ch.codePointAt(0);
    if (ch >= 'A' && ch <= 'Z') return String.fromCodePoint(0xFF21 + (code - 65));
    if (ch >= 'a' && ch <= 'z') return String.fromCodePoint(0xFF41 + (code - 97));
    if (ch >= '0' && ch <= '9') return String.fromCodePoint(0xFF10 + (code - 48));
    return ch;
  });
}

function parseAmount(input) {
  if (typeof input !== "string") return NaN;
  const unit = input.slice(-1).toLowerCase();
  const value = parseFloat(input);
  if (unit === 'k') return value * 1000;
  if (unit === 'm') return value * 1000000;
  if (unit === 'b') return value * 1000000000;
  return value;
}

function normalizeChoice(input) {
  const clean = String(input || "").toLowerCase();
  if (["h", "head", "heads"].includes(clean)) return "heads";
  if (["t", "tail", "tails"].includes(clean)) return "tails";
  return null;
}

const MAX_BET = 15000000;
const rankingSessions = new Map(); // messageID -> { page, pages, entries }

function buildRulesMsg() {
  return `🪙 ${fw("CoinFlip Rules")}
━━━━━━━━━━━━━━━━
• ${fw("Bet an amount and pick heads or tails")}
• ${fw("Win = double your bet back")}
• ${fw("Lose = bet is gone")}
• ${fw("Max bet")}: $${MAX_BET.toLocaleString()}
• ${fw("Win streaks are tracked on the leaderboard")}
━━━━━━━━━━━━━━━━
${fw("Usage")}: !coinflip <amount> <heads/tails>`;
}

async function buildRankingBody(api, page, pageSize) {
  const allUsers = (global.db && global.db.allUserData) || [];
  const ranked = allUsers
    .filter(u => u.data && u.data.coinflipStats && u.data.coinflipStats.wins > 0)
    .map(u => {
      const s = u.data.coinflipStats;
      const total = s.wins + (s.losses || 0);
      const rate = total > 0 ? ((s.wins / total) * 100).toFixed(1) : "0.0";
      return { userID: u.userID, wins: s.wins, rate, streak: s.streak || 0 };
    })
    .sort((a, b) => b.wins - a.wins);

  const totalPages = Math.max(1, Math.ceil(ranked.length / pageSize));
  if (page > totalPages) page = totalPages;
  if (page < 1) page = 1;

  const start = (page - 1) * pageSize;
  const pageItems = ranked.slice(start, start + pageSize);

  let body = `🏅 ${fw("CoinFlip Leaderboard")}\n━━━━━━━━━━━━━━━━\n\n`;

  if (pageItems.length === 0) {
    body += `${fw("No games played yet.")}\n`;
  } else {
    for (let i = 0; i < pageItems.length; i++) {
      const rank = start + i + 1;
      const u = pageItems[i];
      let name = "Unknown";
      try {
        const info = await api.getUserInfo(u.userID);
        name = info?.[u.userID]?.name || "Unknown";
      } catch (err) { /* ignore */ }

      const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `${fw(String(rank))}.`;
      body += `${medal} ${name} — ${fw("Wins")} ${fw(String(u.wins))} (${fw(u.rate)}%) 🔥${fw(String(u.streak))}\n`;
    }
  }

  body += `\n━━━━━━━━━━━━━━━━\n${fw("Page")} ${fw(String(page))}/${fw(String(totalPages))} • ${fw("Reply")} "${fw("next")}" ${fw("or")} "${fw("prev")}"`;

  return { body, page, totalPages };
}

module.exports = {
  config: {
    name: "coinflip",
    aliases: ["cf2", "flip"],
    version: "2.0.0",
    author: "𝑨𝑹𝑰𝒀𝑨𝑵",
    countDown: 3,
    role: 0,
    category: "Game",
    description: "🪙 Heads or tails betting game with leaderboard",
    guide: "{pn} <amount> <heads/tails>\n{pn} rules\n{pn} top"
  },

  onStart: async function ({ args, message, event, usersData, api }) {
    const { senderID } = event;
    const sub = args[0]?.toLowerCase();

    // ───────────── RULES ─────────────
    if (sub === "rules" || sub === "help") {
      return message.reply(buildRulesMsg());
    }

    // ───────────── LEADERBOARD ─────────────
    if (sub === "top" || sub === "leaderboard") {
      const { body, page, totalPages } = await buildRankingBody(api, 1, 10);
      return message.reply(body, (err, info) => {
        if (err || !info) return;
        global.GoatBot.onReply.set(info.messageID, {
          commandName: "coinflip",
          type: "ranking",
          messageID: info.messageID,
          author: senderID,
          page,
          totalPages
        });
        setTimeout(() => {
          if (global.GoatBot.onReply.get(info.messageID)) {
            global.GoatBot.onReply.delete(info.messageID);
          }
        }, 5 * 60 * 1000);
      });
    }

    // ───────────── PLAY (supports "amount choice" or "choice amount") ─────────────
    const userData = await usersData.get(senderID) || {};
    let userMoney = userData.money || 0;

    if (!args[0] || !args[1]) {
      return message.reply(`❌ ${fw("Pick a side and an amount!")}\n${fw("Ex")}: !coinflip 100k heads`);
    }

    let bet = parseAmount(args[0]);
    let choice = normalizeChoice(args[1]);

    if (isNaN(bet) || !choice) {
      // try reversed order: "heads 100k"
      const altBet = parseAmount(args[1]);
      const altChoice = normalizeChoice(args[0]);
      if (!isNaN(altBet) && altChoice) {
        bet = altBet;
        choice = altChoice;
      }
    }

    if (!choice) return message.reply(`❌ ${fw("Choose heads or tails (h / t works too)")}`);
    if (isNaN(bet) || bet <= 0) return message.reply(`❌ ${fw("Invalid bet amount!")}`);
    if (bet > MAX_BET) return message.reply(`🚫 ${fw("Max bet is")} $${MAX_BET.toLocaleString()}`);
    if (bet > userMoney) return message.reply(`💳 ${fw("Not enough balance! You have")}: $${userMoney.toLocaleString()}`);

    if (!userData.data) userData.data = {};
    const isFirstTime = !userData.data.coinflipStats;
    if (!userData.data.coinflipStats) {
      userData.data.coinflipStats = { wins: 0, losses: 0, streak: 0 };
    }
    const stats = userData.data.coinflipStats;

    userMoney -= bet;

    const result = Math.random() < 0.5 ? "heads" : "tails";
    const isWin = result === choice;
    const winnings = isWin ? bet * 2 : 0;
    const finalBalance = userMoney + winnings;

    if (isWin) {
      stats.wins += 1;
      stats.streak += 1;
    } else {
      stats.losses += 1;
      stats.streak = 0;
    }
    const total = stats.wins + stats.losses;
    const rate = ((stats.wins / total) * 100).toFixed(1);

    await usersData.set(senderID, { money: finalBalance, data: userData.data });

    let intro = "";
    if (isFirstTime) {
      const name = (await api.getUserInfo(senderID))?.[senderID]?.name || "there";
      intro = `👋 ${fw("First flip, " + name + "! Max bet")}: $${MAX_BET.toLocaleString()}. ${fw("Type coinflip rules anytime")}.\n\n`;
    }

    const flipEmoji = result === "heads" ? "🪙" : "🌑";
    const resultMsg = intro + (isWin
      ? `🎉 ${fw("WIN")}! ${fw("Landed on")} ${result.toUpperCase()} ${flipEmoji}\n\n💵 ${fw("Bet")}: $${bet.toLocaleString()}\n💰 ${fw("Won")}: +$${bet.toLocaleString()}\n💳 ${fw("Balance")}: $${finalBalance.toLocaleString()}\n📊 ${fw(rate)}% (${stats.wins}/${total}) 🔥${fw(String(stats.streak))}`
      : `💥 ${fw("LOST")}! ${fw("Landed on")} ${result.toUpperCase()} ${flipEmoji}\n\n💵 ${fw("Bet")}: $${bet.toLocaleString()}\n💸 ${fw("Lost")}: -$${bet.toLocaleString()}\n💳 ${fw("Balance")}: $${finalBalance.toLocaleString()}\n📊 ${fw(rate)}% (${stats.wins}/${total}) 🔥0`);

    return message.reply(resultMsg);
  },

  onReply: async function ({ event, api, Reply }) {
    const { senderID, body } = event;
    if (senderID !== Reply.author) return;
    if (Reply.type !== "ranking") return;

    const text = String(body || "").trim().toLowerCase();
    if (text !== "next" && text !== "prev") return;

    let page = Reply.page + (text === "next" ? 1 : -1);
    const result = await buildRankingBody(api, page, 10);

    await api.editMessage(result.body, Reply.messageID);

    global.GoatBot.onReply.set(Reply.messageID, {
      ...Reply,
      page: result.page,
      totalPages: result.totalPages
    });
  }
};
