module.exports = {
    botName: "TEAHA-Bot",
    ownerNumber: "201028316330",
    prefix: ".", // البريفكس

    mode: "public", // public / private

    settings: {
        autoRead: true,
        autoTyping: false,
        react: true
    },

    paths: {
        session: "./session",
        plugins: "./plugins",
        data: "./data"
    },

    emojis: {
        done: "✅",
        error: "❌",
        wait: "⏳",
        bot: "🤖"
    }
};
