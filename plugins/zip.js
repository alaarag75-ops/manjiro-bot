const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FileType = require('file-type');

module.exports = {
    command: ['تحميل', 'download'],
    description: 'تحميل أي ملف من رابط مباشر وإرساله على واتساب',

    async execute(sock, msg, args) {
        const jid = msg.key.remoteJid;

        if (!args[0]) {
            return sock.sendMessage(jid, {
                text: '❌ ابعت الرابط بعد الأمر\nمثال:\n.تحميل https://site.com/file'
            });
        }

        const url = args[0];

        try {
            await sock.sendMessage(jid, {
                text: '⏳ جاري فحص الرابط وتحميل المحتوى...'
            });

            const response = await axios.get(url, {
                responseType: 'arraybuffer',
                timeout: 30000,
                headers: {
                    'User-Agent': 'Mozilla/5.0'
                }
            });

            const buffer = Buffer.from(response.data);
            const type = await FileType.fromBuffer(buffer);

            // لو معرفش النوع نخليه ملف عام
            const mime = type ? type.mime : 'application/octet-stream';
            const ext = type ? type.ext : 'bin';

            const fileName = `file_${Date.now()}.${ext}`;
            const filePath = path.join(__dirname, fileName);

            fs.writeFileSync(filePath, buffer);

            let message;

            if (mime.startsWith('image/')) {
                message = { image: buffer, caption: '🖼️ تم التحميل' };
            } else if (mime.startsWith('video/')) {
                message = { video: buffer, caption: '🎬 تم التحميل' };
            } else if (mime.startsWith('audio/')) {
                message = { audio: buffer, mimetype: mime };
            } else {
                message = {
                    document: buffer,
                    fileName,
                    mimetype: mime
                };
            }

            await sock.sendMessage(jid, message);

            fs.unlinkSync(filePath);

        } catch (error) {
            console.error(error);
            await sock.sendMessage(jid, {
                text: '❌ فشل التحميل\nتأكد أن الرابط مباشر وقابل للتحميل'
            });
        }
    }
};
