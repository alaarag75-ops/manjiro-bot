module.exports = {
  command: 'التقويم',
  description: 'عرض التقويم اليومي',
  category: 'الأدوات',

  async execute(sock, msg) {
    try {
      const chatId = msg.key.remoteJid;

      const التاريخ = new Date();

      const اليوم = new Intl.DateTimeFormat('ar-EG', {
        weekday: 'long',
        timeZone: 'Africa/Cairo'
      }).format(التاريخ);

      const نص_التاريخ = new Intl.DateTimeFormat('ar-EG', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'Africa/Cairo'
      }).format(التاريخ);

      const caption = `*❐═━━━═╊⊰🐍⊱╉═━━━═❐*
『الـتـقويـم الـيـومـي』
*❐═━━━═╊⊰🐍⊱╉═━━━═❐*
🗒 اليوم: ${اليوم}
📆 التاريخ: ${نص_التاريخ}
🕰️ المنطقة الزمنية: مصر
*❐═━━━═╊⊰🐍⊱╉═━━━═❐*`;

      await sock.sendMessage(chatId, {
        text: caption
      }, { quoted: msg });

    } catch (e) {
      console.error('❌ خطأ في أمر التقويم:', e);
      await sock.sendMessage(msg.key.remoteJid, {
        text: '⚠️ حدث خطأ أثناء جلب البيانات!'
      }, { quoted: msg });
    }
  }
};
