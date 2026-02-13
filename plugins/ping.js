module.exports = {
    command: "بينج",
    description: "فحص سرعة البوت",
    aliases: ["ping", "بنج", "سرعة"],
    
    async execute(sock, msg, args) {
        const start = Date.now();
        await sock.sendMessage(msg.key.remoteJid, {
            text: "`⏳ ║ جـاري قـيـاس سـرعـة الـبـوت...`"
        });
        
        const latency = Date.now() - start;

        // تحويل وقت التشغيل
        const uptime = process.uptime();
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);

        await sock.sendMessage(msg.key.remoteJid, {
            text:
`╭━━━〔 🏓 𝑷𝑶𝑵𝑮 〕━━━⬣
┃ ⚡ *السـرعـة ↜ ${latency}ms*
┃ ⏱️ *وقـت الـتـشـغـيـل ↜ ${hours}h ${minutes}m ${seconds}s*
┃ 💾 *الـذاكـرة ↜ ${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB*
┃ 🖥️ *الـنـظـام ↜ ${process.platform}*
╰━━━━━━━━━━━━⬣
✦ 𝑻𝑨𝑬𝑯𝑨 𝑩𝑶𝑻 ✦`
        });
    }
};
