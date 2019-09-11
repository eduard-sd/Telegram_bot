
const TelegramBot = require('node-telegram-bot-api');
const TOKEN = "869793649:AAGBDwsYi_yCpSQ5V7_qvaTUx08pVkOn2GQ";
const bot = new TelegramBot(TOKEN, {polling: true});

// bot.onText(/\/echo (.+)/, (msg, match) => {
//     const chatId = msg.chat.id;
//     const resp = match[1];
//     bot.sendMessage(chatId, resp);
// });

const keyboard = {
    reply_markup: {
        inline_keyboard: [
            [
                {
                    text: "Шары",
                    url: "www.google.com"
                },
                {
                    text: "Торты",
                    url: "www.google.com"
                }
            ],
            [
                {
                    text: "Торты2",
                    url: "www.google.com"
                }
            ]
        ]
    }
};


bot.on('message', (msg) => {
    const chatValue = msg.chat;
    const chatId = msg.chat.id;
    const chatOpponent = chatValue.first_name;
    bot.sendMessage(chatId,
        `${chatOpponent}, добрый день! Вас приветсвует автоматичекский помошник ввыборе шаров. Прошу сдлеть выбор чем я могу вам помочь.`,
        keyboard);
});
