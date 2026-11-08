module.exports = {
  config: {
    name: "race",
    version: "1.0.0",
    author: "Mr.king",
    countDown: 10,
    role: 0,
    shortDescription: "Play exciting emoji racing betting game",
    category: "game",
    guide: "{pn} [amount] [1-4]"
  },

  onStart: async function ({ api, message, event, args, usersData }) {
    const { senderID } = event;
    const userData = await usersData.get(senderID) || {};
    const money = userData.money || 0;
    const name = userData.name || "User";

    if (!args[0] || !args[1]) {
      return message.reply(
`R A C I N G  M E N U
━━━━━━━━━━━━━━━━━━
Baby, usage: race [amount] [runner 1-4]
Example: race 1M 2

Runners:
1. 🏎️ Car (3x payout)
2. 🐎 Horse (3x payout)
3. 🐆 Cheetah (4x payout)
4. 🐢 Turtle (5x lucky payout)
━━━━━━━━━━━━━━━━━━
Maintainer : Ahmed shishir`
      );
    }

    const betAmount = parseSmartAmount(args[0]);
    const choice = parseInt(args[1]);

    const maxBet = 20000000; // 20M limit
    if (isNaN(betAmount) || betAmount <= 0) {
      return message.reply("Baby, enter a valid bet amount!");
    }
    if (betAmount > maxBet) {
      return message.reply(`Baby, the maximum race limit is $${formatNumber(maxBet)}!`);
    }
    if (betAmount > money) {
      return message.reply(`Baby, you only have $${formatNumber(money)}!`);
    }
    if (isNaN(choice) || choice < 1 || choice > 4) {
      return message.reply("Baby, please choose a valid runner number between 1 and 4!");
    }

    const runners = [
      { id: 1, name: "Car", emoji: "🏎️", multiplier: 3 },
      { id: 2, name: "Horse", emoji: "🐎", multiplier: 3 },
      { id: 3, name: "Cheetah", emoji: "🐆", multiplier: 4 },
      { id: 4, name: "Turtle", emoji: "🐢", multiplier: 5 }
    ];

    // Randomized winner selection
    const randomIndex = Math.floor(Math.random() * runners.length);
    const winner = runners[randomIndex];

    const chosenRunner = runners.find(r => r.id === choice);
    const isWin = choice === winner.id;

    let balanceChange = 0;
    if (isWin) {
      balanceChange = betAmount * (winner.multiplier - 1);
    } else {
      balanceChange = -betAmount;
    }

    await usersData.set(senderID, {
      money: money + balanceChange
    });

    const resultMsg = isWin ? 
`R A C I N G  V I C T O RＹ
━━━━━━━━━━━━━━━━━━
User : ${name}
Your Choice : ${chosenRunner.emoji} ${chosenRunner.name}
Winner : ${winner.emoji} ${winner.name}
Status : WINNER!
Reward : +$${formatNumber(betAmount * winner.multiplier)} (${winner.multiplier}x)
━━━━━━━━━━━━━━━━━━
Maintainer : shishir` :
`R A C I N G  G A M E  O V EＲ
━━━━━━━━━━━━━━━━━━
User : ${name}
Your Choice : ${chosenRunner.emoji} ${chosenRunner.name}
Winner : ${winner.emoji} ${winner.name}
Status : LOST!
Loss : -$${formatNumber(betAmount)}
━━━━━━━━━━━━━━━━━━
Maintainer : Ahmed shishir`;

    return message.reply(resultMsg);
  }
};

function parseSmartAmount(str) {
  if (typeof str !== 'string') return parseFloat(str);
  const units = { k: 1e3, m: 1e6, b: 1e9, t: 1e12 };
  const match = str.toLowerCase().match(/^(\d+(?:\.\d+)?)([kmbt]?)$/);
  if (!match) return parseFloat(str);
  return parseFloat(match[1]) * (units[match[2]] || 1);
}

function formatNumber(num) {
  if (num >= 1e12) return (num / 1e12).toFixed(2) + "T";
  if (num >= 1e9) return (num / 1e9).toFixed(2) + "B";
  if (num >= 1e6) return (num / 1e6).toFixed(2) + "M";
  if (num >= 1e3) return (num / 1e3).toFixed(2) + "K";
  return num.toLocaleString();
      }
