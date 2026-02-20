const axios = require("axios");
const crypto = require("crypto");
const yts = require("yt-search");
const Jimp = require("jimp");
const fetch = require("node-fetch");
const { prepareWAMessageMedia } = require("baileys-pro");

const IMAGE_URL = "https://files.catbox.moe/9qffq1.jpg";

/*
━━━━━━━━━━━━━━━━━━━━
🎵 أمر تحميل يوتيوب
━━━━━━━━━━━━━━━━━━━━
*/

module.exports = {
    command: ["اغنيه", "اغنية", "song", "yt", "تحميل"],
    aliases: ["music", "play"],
    category: "تحميل",
    description: "تحميل صوت أو فيديو من يوتيوب (MP3 / MP4) مع أنظمة احتياطية",
    usage: ".اغنيه <اسم الأغنية | رابط>\n.اغنيه mp3 <الرابط>\n.اغنيه mp4 <الرابط>",

    async execute({ gintoki, chatId, args, senderId, usedPrefix, m }) {
        try {
            const [first, second] = args;
            const format = first?.toLowerCase();

            // ========= تحميل مباشر من زر =========
            if ((format === "mp3" || format === "mp4") && second) {
                const url = Buffer.from(second, "base64").toString("utf8");

                await gintoki.sendMessage(chatId, { react: { text: "⏳", key: m.key } });
                await gintoki.sendMessage(chatId, { text: "⏳ جاري تجهيز التحميل..." });

                const search = await yts({ videoId: url.match(/([A-Za-z0-9_-]{11})/)?.[1] });
                if (!search) throw new Error("تعذر جلب معلومات الفيديو");

                await gintoki.sendMessage(chatId, {
                    audio: format === "mp3" ? { url } : undefined,
                    video: format === "mp4" ? { url } : undefined,
                    mimetype: format === "mp3" ? "audio/mpeg" : "video/mp4",
                    caption: `🎵 ${search.title}`,
                }, { quoted: m });

                return await gintoki.sendMessage(chatId, { react: { text: "✅", key: m.key } });
            }

            // ========= بحث =========
            const query = args.join(" ");
            if (!query) {
                return gintoki.sendMessage(chatId, {
                    text:
`🎧 *أمر تحميل الأغاني*
━━━━━━━━━━━━━━
📌 الاستخدام:
${usedPrefix}اغنيه Alan Walker
${usedPrefix}اغنيه رابط

⬇️ بعدها تختار MP3 أو MP4`
                }, { quoted: m });
            }

            await gintoki.sendMessage(chatId, { react: { text: "🔍", key: m.key } });

            const search = await yts(query);
            const video = search.videos[0];

            if (!video) {
                return gintoki.sendMessage(chatId, { text: "❌ لم يتم العثور على نتائج." }, { quoted: m });
            }

            const encodedUrl = Buffer.from(video.url).toString("base64");

            const prepared = await prepareWAMessageMedia(
                { image: { url: video.thumbnail || IMAGE_URL } },
                { upload: gintoki.waUploadToServer }
            );

            const caption =
`🎵 *${video.title}*
⏱️ ${video.timestamp}
👁️ ${video.views.toLocaleString()}
👤 ${video.author.name}

⬇️ اختر نوع التحميل`;

            const message = {
                viewOnceMessage: {
                    message: {
                        interactiveMessage: {
                            header: {
                                hasMediaAttachment: true,
                                imageMessage: prepared.imageMessage
                            },
                            body: { text: caption },
                            footer: { text: "『 Gintoki Bot ⚡』" },
                            nativeFlowMessage: {
                                buttons: [
                                    {
                                        name: "quick_reply",
                                        buttonParamsJson: JSON.stringify({
                                            display_text: "🎵 تحميل MP3",
                                            id: `${usedPrefix}اغنيه mp3 ${encodedUrl}`
                                        })
                                    },
                                    {
                                        name: "quick_reply",
                                        buttonParamsJson: JSON.stringify({
                                            display_text: "🎥 تحميل MP4",
                                            id: `${usedPrefix}اغنيه mp4 ${encodedUrl}`
                                        })
                                    }
                                ]
                            }
                        }
                    }
                }
            };

            await gintoki.relayMessage(chatId, message, {});
            await gintoki.sendMessage(chatId, { react: { text: "✅", key: m.key } });

        } catch (err) {
            console.error("❌ خطأ أمر اغنيه:", err);
            await gintoki.sendMessage(chatId, {
                text: `❌ حصل خطأ:\n${err.message}`
            }, { quoted: m });
        }
    }
};
