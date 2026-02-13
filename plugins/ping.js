module.exports = {
    command: ["ping", ".ping", "بنج"], // أوامر متعددة
    description: "فحص سرعة البوت",
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;

        // وقت البداية
        const start = Date.now();

        // إرسال رسالة مؤقتة
        const sentMsg = await sock.sendMessage(from, { text: "⏳ جاري قياس سرعة البوت..." });

        // حساب التأخير
        const latency = Date.now() - start;

        // حذف الرسالة السابقة وإظهار النتيجة
        await sock.sendMessage(from, {
            text: `🏓 Pong!\nسرعة البوت: ${latency}ms`
        });
    }
};
