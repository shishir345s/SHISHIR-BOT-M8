const fs = require("fs-extra");
module.exports = {
  config: {
    name: "appstate",
    version: "1.0",
    author: "SHISHIR",
    role: 2,
    countDown: 5,
    shortDescription: "Get appstate.json"
  },
  onStart: async function({ api, event }) {
    try {
      const appState = api.getAppState();
      await fs.writeJson(process.cwd() + "/appstate.json", appState, { spaces: 2 });
      return api.sendMessage(`✅ Done! appstate.json saved\nCookies: ${appState.length}`, event.threadID, event.messageID);
    } catch (e) {
      return api.sendMessage(`❌ ${e.message}`, event.threadID, event.messageID);
    }
  }
};
