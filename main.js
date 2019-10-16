const TelegramBot = require('node-telegram-bot-api');
const TOKEN = "869793649:AAGBDwsYi_yCpSQ5V7_qvaTUx08pVkOn2GQ";
const bot = new TelegramBot(TOKEN, {polling: true});
const keyboard = require('./keyboard/inlineKeyboard')

const keyboardDefault = keyboard.keyboardDefault();
const keyboardBalloons = keyboard.keyboardBalloons();
const priceListKeyboard = keyboard.priceListKeyboard();
const getPriceFromPhotoKeyboard = keyboard.getPriceFromPhotoKeyboard();
const faqKeyboard = keyboard.faqKeyboard();
const cartKeyboard = keyboard.cartKeyboard();
const profileKeyboard = keyboard.profileKeyboard();

let previousMenu = 'Шары 🎈';
const adminChatID = '1875888';


function addBackButton(previousMenu, customKeyboard) {
    let customKeyboardArray = customKeyboard.inline_keyboard;
    for (let i = 0; i < customKeyboardArray.length; i++) {
        if(i === customKeyboardArray.length-1) {
            if(customKeyboardArray[i][0].text !== "⬅ Назад") {
                customKeyboardArray[i].splice(0, 0, {text: "⬅ Назад", callback_data: previousMenu})
            }
        }
    }
    return {inline_keyboard: customKeyboardArray};
}

bot.on('photo', (msg) => {
    console.log(msg.photo.length);
        console.log(msg);
    //получено от
    const photoList = msg.photo;
    const fromName= msg.from.first_name;
    const fromLastName= msg.from.last_name;
    const fromId = msg.from.id;
    const fromUsername= msg.from.username;

    bot.sendMessage(
        adminChatID,
        `
            <b>Босс у нас новый клиент!</b>
        Просит сосчитать стоимость по фото.

        <b>ФИО:</b> ${fromName} ${fromLastName}
        <b>Ник телеграмм:</b> ${fromUsername}
        <b>Фото:</b> ${fromId}
        `,
        {parse_mode:'HTML'},
    );

    // for (let i = 0; i < photoList.length ; i++) {
    //     let fileId = photoList[i].file_id;
    //     bot.sendPhoto(adminChatID,fileId);
    //
    // }


    let fileId = photoList.shift().file_id;
    console.log(fileId);
    bot.sendPhoto(adminChatID,fileId);
});

// function resendFoto (object) {
//     console.log(msg);
//     //получено от
//     const photoList = msg.photo;
//     const fromName= msg.from.first_name;
//     const fromLastName= msg.from.last_name;
//     const fromUsername= msg.from.username;
//
//     bot.sendMessage(
//         adminChatID,
//         `
//             <b>Босс у нас новый клиент!</b>
//         Просит сосчитать стоимость по фото.
//
//         <b>ФИО:</b> ${fromName} ${fromLastName}
//         <b>Ник телеграмм:</b> ${fromUsername}
//         <b>Фото:</b>
//         `,
//         {parse_mode:'HTML'},
//     );
//
//     // for (let i = 0; i < photoList.length ; i++) {
//     //     let fileId = photoList[i].file_id;
//     //     bot.sendPhoto(adminChatID,fileId);
//     //
//     // }
//
//
//     let fileId = photoList.shift().file_id;
//     console.log(fileId);
//     bot.sendPhoto(adminChatID,fileId);
// };



bot.on('text', (msg) => {
    const chatValue = msg.chat;
    const chatId = msg.chat.id;
    const chatOpponent = chatValue.first_name;

    // console.log(msg);

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
            {reply_markup: addBackButton(previousMenu, keyboardBalloons)}
        );
        previousMenu = "Шары 🎈";
    } else if (msg.text.toString() === "Торты 🎂") {

    }
});

bot.on("callback_query", (msg) => {

    // console.log(msg);
    const chatValue = msg.message.chat;
    const chatId = chatValue.id;
    const chatOpponent = chatValue.first_name;
    const messageId = msg.message.message_id;



    // bot.sendMessage(chatId,
    //     `${msg.data} -------- callbackquery кнопка`,
    //     {reply_markup: {}});


    if (msg.data.toString() === "Шары 🎈") {
        bot.sendPhoto(chatId, "https://avatars.mds.yandex.net/get-pdb/1681173/b1c1cbe3-c6ef-4662-af9e-fe3db83d1ec8/s1200");
        bot.editMessageText(
            `${chatOpponent}, Вы нажали шары вводная общая информация о услугам`,
            {
                chat_id: chatId,
                message_id: messageId,
                reply_markup: addBackButton(previousMenu,keyboardBalloons)});

        previousMenu = "Шары 🎈";

    } else if (msg.data.toString() === "Каталог и цены 🎁") {
        bot.editMessageText(
            'Вы открыли каталог и цены',
            {
                chat_id: chatId,
                message_id: messageId,
                reply_markup: addBackButton(previousMenu,priceListKeyboard)});

        previousMenu = "Каталог и цены 🎁";

    } else if (msg.data.toString() === "Стоимость по фото 🖼️") {
        bot.editMessageText(
            `Пожалуйста загрузите понравившиеся фотографии из интернета. Нажмите отправить и с вами с свяжется специалит после подсчета стоимости композиции.
            Примерное время ответа ответа 30 минут.`,
            {
                chat_id: chatId,
                message_id: messageId,
                reply_markup: addBackButton(previousMenu,getPriceFromPhotoKeyboard)});

        previousMenu = "Стоимость по фото 🖼️";

    } else if (msg.data.toString() === "Вопросы и ответы ❓") {
        bot.editMessageText(
            'Вопросы и ответы',
            {
                chat_id: chatId,
                message_id: messageId,
                reply_markup: addBackButton(previousMenu,faqKeyboard)});
        previousMenu = "Вопросы и ответы ❓";

    } else if (msg.data.toString() === "Корзина 📦") {
        let items = false;
        if(items){
            bot.editMessageText(
                'Список товаров в корзине:',
                {
                    chat_id: chatId,
                    message_id: messageId,
                    reply_markup: addBackButton(previousMenu,cartKeyboard)});
        } else {
            bot.editMessageText(
                'Ваша козина пока пуста',
                {
                    chat_id: chatId,
                    message_id: messageId,
                    reply_markup: addBackButton(previousMenu,cartKeyboard)});
        }

        previousMenu = "Корзина 📦";

    } else if (msg.data.toString() === "Личный кабинет 💼") {
        bot.editMessageText(
            `Личный кабинет`,
            {
                chat_id: chatId,
                message_id: messageId,
                reply_markup: addBackButton(previousMenu,profileKeyboard)});

        previousMenu = "Личный кабинет 💼";
    }
});

bot.on("polling_error", (err) => console.log(err));