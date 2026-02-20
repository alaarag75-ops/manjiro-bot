module.exports = {
    command: ['kick', 'طرد'],
    description: 'طرد عضو من الجروب',
    category: 'group',
    admin: true,
    group: true,
    botAdmin: true,

    async execute(sock, msg) {
        const chatId = msg.key.remoteJid;
        const developerJid = '201063808608@s.whatsapp.net'; // رقم المطور

        // استخراج المنشن
        const mentioned =
            msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];

        const quoted =
            msg.message?.extendedTextMessage?.contextInfo?.participant || null;

        if (!mentioned.length && !quoted) {
            return sock.sendMessage(
                chatId,
                { text: '*مــنشـن الـشـخص !*' },
                { quoted: msg }
            );
        }

        const user = mentioned[0] || quoted;

        // حماية المطور
        if (user === developerJid) {
            return sock.sendMessage(
                chatId,
                {
                    text: '*عايزني أطرد مطوري ليه؟ أنا أحول زيك ولا إيه؟!*',
                    mentions: [developerJid]
                },
                { quoted: msg }
            );
        }

        try {
            await sock.groupParticipantsUpdate(chatId, [user], 'remove');

            await sock.sendMessage(
                chatId,
                {
                    text:
                        `*❍━━━══━━❪🌸❫━━══━━━❍*\n` +
                        `*｢🍨｣⇇تـم طـردك بـنـجـاح*\n` +
                        `*｢🍷｣⇇بـأمـر مـن↜┊@${msg.key.participant.split('@')[0]}┊*\n` +
                        `*❍━━━══━━❪🌸❫━━══━━━❍*`,
                    mentions: [msg.key.participant]
                },
                { quoted: msg }
            );

        } catch (err) {
            console.error(err);
            await sock.sendMessage(
                chatId,
                { text: '❌ حصل خطأ أثناء الطرد' },
                { quoted: msg }
            );
        }
    }
};
