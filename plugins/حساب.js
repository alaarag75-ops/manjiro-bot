const fs = require('fs');
const path = require('path');

const BANK_FILE = path.join(__dirname, '../bank.json');

function loadBank() {
  if (!fs.existsSync(BANK_FILE)) return {};
  try {
    return JSON.parse(fs.readFileSync(BANK_FILE, 'utf-8'));
  } catch {
    return {};
  }
}

function saveBank(data) {
  fs.writeFileSync(BANK_FILE, JSON.stringify(data, null, 2));
}

function normalize(id) {
  return id.replace(/@.+/, '@lid');
}

module.exports = {
  command: 'حساب',
  description: 'إنشاء/تعديل/حذف حساب بنكي باسم مخصص',
  usage: '.حساب <اسم | تعديل اسم_جديد | حذف>',
  category: 'البنك',

  async execute(sock, msg) {
    const text = msg.message?.conversation ||
                 msg.message?.extendedTextMessage?.text || '';

    const args = text.trim().split(' ').slice(1);
    const id = msg.key.participant || msg.key.remoteJid;
    const normId = normalize(id);

    const action = args[0];
    const name = args.slice(1).join(' ');

    if (!action) {
      return sock.sendMessage(msg.key.remoteJid, {
        text: '❗ اكتب:\n`.حساب اسم` لإنشاء حساب\n`.حساب تعديل اسم` لتعديل الاسم\n`.حساب حذف` لحذف الحساب'
      }, { quoted: msg });
    }

    let bank = loadBank();
    let replyText = '';

    // تعديل
    if (action === 'تعديل') {
      if (!bank[normId]) {
        replyText = '⚠️ لا تملك حسابًا لتعديله.';
      } else if (!name) {
        replyText = '❗ اكتب الاسم الجديد بعد كلمة تعديل.';
      } else {
        const nameTaken = Object.values(bank).some(acc => acc.name === name);
        if (nameTaken) {
          replyText = '❌ الاسم مستخدم من قبل حساب آخر.';
        } else {
          bank[normId].name = name;
          saveBank(bank);
          replyText = `✅ تم تعديل اسم حسابك إلى *${name}* بنجاح.`;
        }
      }

    // حذف
    } else if (action === 'حذف') {
      if (!bank[normId]) {
        replyText = '⚠️ لا يوجد لديك حساب لحذفه.';
      } else {
        delete bank[normId];
        saveBank(bank);
        replyText = '🗑️ تم حذف حسابك بنجاح.';
      }

    // إنشاء
    } else {
      const accountName = args.join(' ');

      if (!accountName) {
        replyText = '❗ يجب كتابة اسم بعد الأمر.';
      } else if (bank[normId]) {
        replyText = '⚠️ لديك حساب مسجل مسبقًا.';
      } else {
        const nameTaken = Object.values(bank).some(acc => acc.name === accountName);
        if (nameTaken) {
          replyText = '❌ هذا الاسم مستخدم من قبل حساب آخر.';
        } else {
          bank[normId] = {
            name: accountName,
            rank: 'مبتدئ',
            points: 0,
            gold: 0,
            xp: 0,
            level: 1
          };

          saveBank(bank);

          replyText = `
*『💳┇تم فتح الحساب┇💳』*

👤 الاسم: ${accountName}
🎖 الرتبة: مبتدئ
💰 النقاط: 0
🪙 الذهب: 0
💡 الخبرة: 0
🎰 المستوى: 1

> اهلا ${accountName} استخدم \`.اوامر\` لرؤية قسم البنك`.trim();
        }
      }
    }

    await sock.sendMessage(msg.key.remoteJid, {
      text: replyText
    }, { quoted: msg });
  }
};
