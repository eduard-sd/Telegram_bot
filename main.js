const TelegramBot = require('node-telegram-bot-api');
const TOKEN = "869793649:AAGBDwsYi_yCpSQ5V7_qvaTUx08pVkOn2GQ";
const bot = new TelegramBot(TOKEN, {polling: true});


//кнопочная клавиатура привествия
const keyboardDefault = {
    reply_markup: {
        keyboard: [
            [{text: "Шары 🎈"},{text: "Торты 🎂"}],
            [{text: "Кэшбэк 💰"},{text: "Корзина 🛒"}],

        ],
        resize_keyboard: true,
        one_time_keyboard: true
    }
};

//инлайн клавиатура Шары
// const keyboardInline = {
//     reply_markup: {
//         inline_keyboard: [
//             [{text: "Каталог и цены",url: "www.google.com"},{text: "Стоимость по фото",url: "www.google.com"}],
//             [{text: "Кэшбэк",url: "www.google.com"},{text: "Корзина",url: "www.google.com"}],
//             [{text: "⬅ Назад",url: "www.google.com"},{text: "ИНФО",url: "www.google.com"}]
//         ]
//     }
// };


bot.on('text', (msg) => {
    const chatValue = msg.chat;
    const chatId = msg.chat.id;
    const chatOpponent = chatValue.first_name;


    if(msg.text.toString() === "/start") {
        bot.sendMessage(chatId,
            `${chatOpponent}, добрый день! Вас приветсвует автоматичекский помошник в подготовке праздников. Прошу сделать выбор, что вас интересует?`,
            keyboardDefault)
            .then(function () {
                bot.once("message", function (reply) {
                    if (reply.text === "Шары 🎈") {
                        bot.sendPhoto(chatId,"https://avatars.mds.yandex.net/get-pdb/1681173/b1c1cbe3-c6ef-4662-af9e-fe3db83d1ec8/s1200");
                        bot.sendMessage(
                            chatId,
                            `${chatOpponent}, Вы нажали шары вводная общая информация о услугам`,
                            {
                                reply_markup: {
                                    inline_keyboard: [
                                        [{text: "Каталог и цены",url: "www.google.com"},{text: "Стоимость по фото",url: "www.google.com"}],
                                        [{text: "Кэшбэк",url: "www.google.com"},{text: "Корзина",url: "www.google.com"}],
                                        [{text: "⬅ Назад",url: "www.google.com"},{text: "ИНФО",url: "www.google.com"}]
                                    ]
                                }
                            }
                        )
                    } else if (reply.text === "Торты 🎂") {
                        bot.sendMessage(
                            chatId,
                            `${chatOpponent}, *bold text*_italic text_`,
                            {
                                parse_mode:"markdown",
                                reply_markup: {
                                    inline_keyboard: [
                                        [{text: "Каталог и цены",url: "www.google.com"},{text: "Стоимость по фото",url: "www.google.com"}],
                                        [{text: "Кэшбэк",url: "www.google.com"},{text: "Корзина",url: "www.google.com"}],
                                        [{text: "⬅ Назад",url: "www.google.com"},{text: "ИНФО",url: "www.google.com"}]
                                    ]
                                }
                            }
                        )
                    } else if (reply.text === "Кэшбэк 💰") {
                        bot.sendMessage(chatId, "Вы нажали Кэшбэк")
                    } else if (reply.text === "Корзина 🛒") {
                        bot.sendMessage(chatId, "Вы нажали Корзина")
                    }
                });
            })
    }
})
