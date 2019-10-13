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
        bot.sendMessage(
            chatId,
            `${chatOpponent}, добрый день! Вас приветсвует автоматичекский помошник в подготовке праздников. Прошу сделать выбор, что вас интересует?`,
            {reply_markup: keyboardDefault}
        )
    }

    if (msg.text.toString() === "Шары 🎈") {
        bot.sendPhoto(chatId, "https://avatars.mds.yandex.net/get-pdb/1681173/b1c1cbe3-c6ef-4662-af9e-fe3db83d1ec8/s1200");
        bot.sendMessage(
            chatId,
            `${chatOpponent}, Вы нажали шары вводная общая информация о услугам`,
            {reply_markup: keyboardBalloons}
        );
    } else if (msg.text.toString() === "Торты 🎂") {

    } else if (msg.text.toString() === "Кэшбэк 💰") {
        bot.sendMessage(chatId, "Вы нажали Кэшбэк")
    } else if (msg.text.toString() === "Корзина 🛒") {
        bot.sendMessage(chatId, "Вы нажали Корзина")
    } else if (msg.text.toString() === "ИНФО") {
        bot.sendMessage(chatId, "Вы нажали ИНФО")
    }
});

bot.on("callback_query", (msg) => {

    console.log(msg);
    const chatValue = msg.message.chat;
    const chatId = chatValue.id;
    const chatOpponent = chatValue.first_name;
    const messageId = msg.message.message_id;

    // bot.sendMessage(chatId,
    //     `${msg.data} -- callbackquery кнопка`,
    //     {reply_markup: {}});



    if (msg.data.toString() === "Шары 🎈") {
        // bot.sendPhoto(chatId, "https://avatars.mds.yandex.net/get-pdb/1681173/b1c1cbe3-c6ef-4662-af9e-fe3db83d1ec8/s1200");
        bot.editMessageText(
            `${chatOpponent}, Вы нажали шары вводная общая информация о услугам`,
            {chat_id: chatId, message_id: messageId, reply_markup: keyboardBalloons}
        );
    } else if (msg.data.toString() === "Торты 🎂") {

    } else if (msg.data.toString() === "Кэшбэк 💰") {
        bot.editMessageText(chatId, "Вы нажали Кэшбэк")
    } else if (msg.data.toString() === "Корзина 🛒") {
        bot.editMessageText(chatId, "Вы нажали Корзина")
    }

    if (msg.data.toString() === "Каталог и цены") {
        // console.log(chatId);
        bot.editMessageText('Вы открыли каталог и цены', {chat_id: chatId, message_id: messageId, reply_markup: priceList});
    } else if (msg.data.toString() === "Стоимость по фото") {
        bot.editMessageText('Пожалуйста загрузите понравившиеся фотографии из интернета. Нажмите отправить и с вами с свяжется специались после подсчета стоимости композиции', {chat_id: chatId, message_id: messageId, reply_markup: priceList});
    } else if (msg.data.toString() === "Кэшбэк 💰") {

    } else if (msg.data.toString() === "Корзина 🛒") {

    } else if (msg.data.toString() === "ИНФО") {

    }
});

bot.on("polling_error", (err) => console.log(err));