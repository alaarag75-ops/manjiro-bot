const fs = require('fs');
const path = require('path');

const RATINGS_FILE = path.join(__dirname, '../rating.json');

function loadRatings() {
  if (!fs.existsSync(RATINGS_FILE)) return {};
  try {
    return JSON.parse(fs.readFileSync(RATINGS_FILE, 'utf-8'));
  } catch {
    return {};
  }
}

function saveRatings(data) {
  fs.writeFileSync(RATINGS_FILE, JSON.stringify(data, null, 2));
}

module.exports = {
  command: 'متوسط_التقييم',
  description: 'يعرض متوسط تقييم الجروب للبوت',
  usage: '.متوسط_التقييم',
  category: 'البوت',

  execute: async (sock, msg, args) => {
    try {
      const jid = msg.key.remoteJid;
      const ratings = loadRatings();
      const groupRatings = ratings[jid];

      if (!groupRatings || Object.keys(groupRatings).length === 0) {
        return await sock.sendMessage(jid, {
          text: '❌ لم يتم تسجيل أي تقييم لهذا الجروب بعد.'
        }, { quoted: msg });
      }

      const totalStars = Object.values(groupRatings).reduce((a, b) => a + b, 0);
      const numRatings = Object.values(groupRatings).length;
      const average = (totalStars / numRatings).toFixed(2);

      const fullStars = Math.floor(average);
      const halfStar = average - fullStars >= 0.5 ? '⭐️' : '';
      const starsDisplay = '⭐️'.repeat(fullStars) + halfStar;

      const reply = `
*❐═━━━═╊⊰🐍⊱╉═━━━═❐*
💻 متوسط تقييم بوت تايها لهذا الجروب
*❐═━━━═╊⊰🐍⊱╉═━━━═❐*

🌟 متوسط التقييم: ${average} من 5
🌟 النجوم التقريبية: ${starsDisplay}

*❐═━━━═╊⊰🐍⊱╉═━━━═❐*
𝒎𝒂𝒅𝒆 𝒃𝒚 𝑻𝑨𝑬𝑯𝑨 𝑩𝑶𝑻🍭`;

      await sock.sendMessage(jid, { text: reply }, { quoted: msg });

    } catch (error) {
      console.error('❌ خطأ في تنفيذ أمر متوسط_التقييم:', error);
      await sock.sendMessage(msg.key.remoteJid, {
        text: '❌ حدث خطأ أثناء تنفيذ الأمر.'
      }, { quoted: msg });
    }
  }
};
