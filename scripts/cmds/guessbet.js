module.exports = {
  config: {
    name: "guessbet",
    aliases: ["gb", "guess2"],
    version: "5.1",
    author: "Sazzad",
    countDown: 5,
    role: 0,
    shortDescription: "Bet kore number guess",
    longDescription: "1B jitle, -100m harle",
    category: "game",
    guide: { en: "{p}guessbet start | {p}guessbet 50" }
  },

  onStart: async function ({ api, event, args, message, usersData }) {
    const sendMsg = (txt) => message.reply(txt);
    const threadID = event.threadID;
    const userID = event.senderID;

    if (!balances[userID]) balances[userID] = 1000000;

    if (!args[0] || args[0] === "start") {
      if (balances[userID] < 100000000) {
        return sendMsg(`💸 Balance kom! Khelte minimum 100M lagbe\nTor balance: ${balances[userID].toLocaleString()} TK`);
      }
      const number = Math.floor(Math.random() * 100) + 1;
      games[threadID] = { number, tries: 0, player: userID };
      return sendMsg(`🎰 BET GAME START\nBet: 100M\nJitle: +1B 🔥\nHarle: -100M 💀\n\n1-100 er moddhe guess koro: #guessbet 50`);
    }

    if (!games[threadID] || games[threadID].player!== userID) {
      return sendMsg(`Age #guessbet start koro`);
    }

    const guess = parseInt(args[0]);
    if (isNaN(guess) || guess < 1 || guess > 100) {
      return sendMsg(`1-100 er moddhe number dao`);
    }

    games[threadID].tries++;
    const correct = games[threadID].number;

    if (guess === correct) {
      balances[userID] += 1000000000;
      const tries = games[threadID].tries;
      delete games[threadID];
      global.money = balances;
      return sendMsg(`🎉 JITE GESOS! 🎉\nNumber: ${correct}\nTry: ${tries}\n\n💰 +1,000,000,000 TK\nNew Balance: ${balances[userID].toLocaleString()} TK`);
    }

    if (games[threadID].tries >= 5) {
      balances[userID] -= 100000;
      delete games[threadID];
      global.money = balances;
      return sendMsg(`💀 HARSO! 💀\nNumber chilo: ${correct}\n\n💸 -100,000,000 TK\nNew Balance: ${balances[userID].toLocaleString()} TK`);
    }

    if (guess < correct) {
      return sendMsg(`⬆️ Beshi hobe! ${guess} er theke boro\nTry: ${games[threadID].tries}/5`);
    } else {
      return sendMsg(`⬇️ Kom hobe! ${guess} er theke choto\nTry: ${games[threadID].tries}/5`);
    }
  }
};
