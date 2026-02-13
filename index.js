process.on("uncaughtException", console.error);
process.on("unhandledRejection", console.error);

const fs = require("fs");
const path = require("path");

const pluginsPath = path.join(__dirname, "plugins");
let plugins = [];

// تحميل الإضافات
function loadPlugins() {
  plugins = [];
  if (!fs.existsSync(pluginsPath)) return;

  const files = fs.readdirSync(pluginsPath).filter(f => f.endsWith(".js"));

  for (const file of files) {
    try {
      const plugin = require(path.join(pluginsPath, file));
      if (plugin?.command && plugin?.execute) {
        plugins.push(plugin);
        console.log(`✅ تم تحميل ${file}`);
      }
    } catch (err) {
      console.log(`❌ فشل تحميل ${file}`);
      console.error(err);
    }
  }
}

async function start() {
  console.log("🚀 بدء تشغيل النظام...");
  loadPlugins();

  const startBot = require("./main");
  const sock = await startBot();

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const from = msg.key.remoteJid;
    const text =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      "";

    const command = text.split(" ")[0];

    for (const plugin of plugins) {
      if (plugin.command === command || plugin.command?.includes?.(command)) {
        try {
          await plugin.execute(sock, msg, text.split(" ").slice(1));
        } catch (err) {
          console.error("❌ ERROR CMD:", err);
          await sock.sendMessage(from, { text: "❌ حصل خطأ في الأمر" });
        }
      }
    }
  });
}

start();
