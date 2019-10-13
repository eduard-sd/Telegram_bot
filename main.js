const TelegramBot = require('node-telegram-bot-api');
const TOKEN = "869793649:AAGBDwsYi_yCpSQ5V7_qvaTUx08pVkOn2GQ";
const bot = new TelegramBot(TOKEN, {polling: true});
const keyboard = require('./keyboard/inlineKeyboard')
const keyboardDefault = keyboard.keyboardDefault();
const keyboardBalloons = keyboard.keyboardBalloons();
const priceList = keyboard.priceList();


bot.on('text', (msg) => {
    const chatValue = msg.chat;
    const chatId = msg.chat.id;
    const chatOpponent = chatValue.first_name;

    if(msg.text.toString() === "/start") {
        bot.sendMessage(chatId,
            `${chatOpponent}, добрый день! Вас приветсвует автоматичекский помошник в подготовке праздников. Прошу сделать выбор, что вас интересует?`,
            keyboardDefault)
    }

    if (msg.text.toString() === "Шары 🎈") {
        bot.sendPhoto(chatId, "https://avatars.mds.yandex.net/get-pdb/1681173/b1c1cbe3-c6ef-4662-af9e-fe3db83d1ec8/s1200");
        bot.sendMessage(
            chatId,
            `${chatOpponent}, Вы нажали шары вводная общая информация о услугам`,
            keyboardBalloons
        );
    } else if (msg.text.toString() === "Торты 🎂") {

    } else if (msg.text.toString() === "Кэшбэк 💰") {
        bot.sendMessage(chatId, "Вы нажали Кэшбэк")
    } else if (msg.text.toString() === "Корзина 🛒") {
        bot.sendMessage(chatId, "Вы нажали Корзина")
    }
});



// bot.on("text", function (reply) {
//     if (reply.text === "Шары 🎈") {
//         bot.sendPhoto(chatId, "https://avatars.mds.yandex.net/get-pdb/1681173/b1c1cbe3-c6ef-4662-af9e-fe3db83d1ec8/s1200");
//         bot.sendMessage(
//             chatId,
//             `${chatOpponent}, Вы нажали шары вводная общая информация о услугам`,
//             {
//                 reply_markup: {
//                     inline_keyboard: [
//                         [{text: "Каталог и цены", callback_data: "Каталог и цены"}, {
//                             text: "Стоимость по фото",
//                             url: "www.google.com"
//                         }],
//                         [{text: "Кэшбэк", url: "www.google.com"}, {text: "Корзина", url: "www.google.com"}],
//                         [{text: "⬅ Назад", url: "www.google.com"}, {text: "ИНФО", url: "www.google.com"}]
//                     ]
//                 }
//             }
//         );
    // } else if (reply.text === "Торты 🎂") {
    //
    // } else if (reply.text === "Кэшбэк 💰") {
    //     bot.sendMessage(chatId, "Вы нажали Кэшбэк")
    // } else if (reply.text === "Корзина 🛒") {
    //     bot.sendMessage(chatId, "Вы нажали Корзина")
    // }
// });




// bot.sendMessage(
//     chatId,
//     `${chatOpponent}, *bold text*_italic text_`,
//     {
//         parse_mode:"markdown",
//         reply_markup: {
//             inline_keyboard: [
//                 [{text: "Каталог и цены",url: "www.google.com"},{text: "Стоимость по фото",url: "www.google.com"}],
//                 [{text: "Кэшбэк",url: "www.google.com"},{text: "Корзина",url: "www.google.com"}],
//                 [{text: "⬅ Назад",url: "www.google.com"},{text: "ИНФО",url: "www.google.com"}]
//             ]
//         }
//     }
// );

bot.on("callback_query", (msg) => {

    console.log(msg);
    const fromId = msg.from.id;
    const chatValue = msg.message.chat;
    const chatId = chatValue.id;
    const chatOpponent = chatValue.first_name;
    const messageId = msg.message.message_id;

    bot.sendMessage(chatId,
        `${msg.data} -- callbackquery кнопка`,
        {reply_markup: {}});



    if (msg.data.toString() === "Шары 🎈") {
        // bot.sendPhoto(chatId, "https://avatars.mds.yandex.net/get-pdb/1681173/b1c1cbe3-c6ef-4662-af9e-fe3db83d1ec8/s1200");
        bot.editMessageText(
            `${chatOpponent}, Вы нажали шары вводная общая информация о услугам`,
            keyboardBalloons
        );
    } else if (msg.data.toString() === "Торты 🎂") {

    } else if (msg.data.toString() === "Кэшбэк 💰") {
        bot.editMessageText(chatId, "Вы нажали Кэшбэк")
    } else if (msg.data.toString() === "Корзина 🛒") {
        bot.editMessageText(chatId, "Вы нажали Корзина")
    }

    if (msg.data === "Каталог и цены") {
        console.log(chatId);
        bot.editMessageText('hi', {chat_id: chatId, message_id: messageId});
        let one = JSON.stringify(priceList);
        bot.editMessageReplyMarkup({chat_id: chatId, message_Id: messageId, one});


        // bot.editMessageText(
        //     {
        //         chatId,
        //         `${chatOpponent}, пожалуйста укажите какие воздушные шары вас интересуют`,
        //          priceList
        //
        // )
    }
});

bot.on("polling_error", (err) => console.log(err));