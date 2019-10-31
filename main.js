const TelegramBot = require('node-telegram-bot-api');
const TOKEN = "869793649:AAGBDwsYi_yCpSQ5V7_qvaTUx08pVkOn2GQ";
const bot = new TelegramBot(TOKEN, {polling: true});
const keyboard = require('./keyboard/inlineKeyboard');
const pool = require('./connectDB').pgPool;
const cTable = require('console.table');

const keyboardDefault = keyboard.keyboardDefault();
const sendVCard = keyboard.sendVCard();
const keyboardBalloons = keyboard.keyboardBalloons();
const priceListKeyboard = keyboard.priceListKeyboard();
const classicBallonsKeyboard = keyboard.classicBallonsKeyboard();
const classicCircleBallonsKeyboard = keyboard.classicCircleBallonsKeyboard();
const foilBallonsKeyboard = keyboard.foilBallonsKeyboard();
const getPriceFromPhotoKeyboard = keyboard.getPriceFromPhotoKeyboard();
const faqKeyboard = keyboard.faqKeyboard();
const cartKeyboard = keyboard.cartKeyboard();
const profileKeyboard = keyboard.profileKeyboard();

let photoList = [];
const adminChatID = '1875888';
let previousMenu = 'Шары 🎈';


//добавление кнопки назад в клавиатуру
function addBackButton(previousMenu, customKeyboard) {
    let customKeyboardArray = customKeyboard.inline_keyboard;
    for (let i = 0; i < customKeyboardArray.length; i++) {
        if (i === customKeyboardArray.length - 1) {
            if (customKeyboardArray[i][0].text !== "⬅ Назад") {
                customKeyboardArray[i].splice(0, 0, {text: "⬅ Назад", callback_data: previousMenu})
            }
        }
    }
    return {inline_keyboard: customKeyboardArray};
}

bot.on('text', (msg) => {
    const chatValue = msg.chat;
    const chatId = msg.chat.id;
    const chatOpponent = chatValue.first_name ? chatValue.first_name : "Дорогой клиент" ;

    console.log(chatOpponent);

    if (msg.text.toString() === "/start") {
        bot.sendMessage(
            chatId,
            `${chatOpponent}, добрый день! Вас приветсвует автоматичекский помошник в подготовке праздников. Прошу сделать выбор, что вас интересует?`,
            {reply_markup: keyboardDefault}
        )
    }

    if (msg.text.toString() === "Шары 🎈") {
        // bot.sendPhoto(chatId, "https://avatars.mds.yandex.net/get-pdb/1681173/b1c1cbe3-c6ef-4662-af9e-fe3db83d1ec8/s1200");
        bot.sendMessage(
            chatId,
            '<a href="https://res.cloudinary.com/sharolandiya/image/upload/v1571498410/TelegramBotSharoladya/sharolandiay_noxiev.png">Шароландия</a>'+`\n${chatOpponent}, вы нажали шары вводная общая информация о услугам`,
            {
                reply_markup: addBackButton(previousMenu, keyboardBalloons),
                parse_mode: "HTML"
            }
        );
        previousMenu = "Шары 🎈";

    } else if (msg.text.toString() === "Торты 🎂") {

    } else if (msg.text.toString() === "Отмена") {
        bot.sendMessage(
            chatId,
            `${chatOpponent}, вы нажали "отмена"`,
            {reply_markup: addBackButton(previousMenu, keyboardBalloons)}
        );
    }
});

bot.on('contact', (msg) => {
    console.log(msg);
    const chatId = msg.chat.id;
    const fromName = msg.from.first_name;
    const fromLastName = msg.from.last_name;
    const fromUsername = msg.from.username;
    const fromContact = msg.contact.phone_number;

    bot.sendMessage(
        chatId,
        `${fromName}, приступаем к расчету...`,
        {reply_markup: addBackButton(previousMenu, keyboardBalloons)}
    );


    bot.sendMessage(
        adminChatID,
        "<b>Босс у нас новый клиент!</b> \nПросит сосчитать стоимость по фото." + `\n\n<b>ФИО:</b> ${fromName} ${fromLastName} \n<b>Ник телеграмм:</b> ${fromUsername} \n<b>Телефон:</b> ${fromContact}`,
        {parse_mode: 'HTML'},
    );
});



bot.on("callback_query", (msg) => {

    // console.log(msg);
    const chatValue = msg.message.chat;
    const chatId = chatValue.id;
    const chatOpponent = chatValue.first_name ? chatValue.first_name : "Дорогой клиент" ;
    const messageId = msg.message.message_id;


    // bot.sendMessage(chatId,
    //     `${msg.data} -------- callbackquery кнопка`,
    //     {reply_markup: {}});


    if (msg.data.toString() === "Шары 🎈") {
        bot.editMessageText(
            '<a href="https://res.cloudinary.com/sharolandiya/image/upload/v1571498410/TelegramBotSharoladya/sharolandiay_noxiev.png">Шароландия</a>'+`\n${chatOpponent}, вы нажали шары вводная общая информация о услугам`,
            {
                chat_id: chatId,
                message_id: messageId,
                reply_markup: addBackButton(previousMenu, keyboardBalloons),
                parse_mode: "HTML"
            });
        previousMenu = "Шары 🎈";

    } else if (msg.data.toString() === "Каталог и цены 🎁") {
        bot.editMessageText(
            '<a href="https://res.cloudinary.com/sharolandiya/image/upload/v1571502686/TelegramBotSharoladya/catalog_ktpfa6.png">Каталог и цены 🎁</a>'+`${chatOpponent}, вы открыли каталог и цены`,
            {
                chat_id: chatId,
                message_id: messageId,
                reply_markup: addBackButton(previousMenu, priceListKeyboard),
                parse_mode: "HTML"
            });
        previousMenu = "Каталог и цены 🎁";

    } else if (msg.data.toString() === "Стоимость по фото 🖼️") {
        bot.editMessageText(
            `${chatOpponent}` + ', пожалуйста прикрепите к сообщению понравившиеся фотографии или композиции, и нажмите отправить. \n\nС вами свяжется специалит для дальнейшей консультаци по стоимости. \n\nПримерное время ответа ответа 30 минут.',
            {
                chat_id: chatId,
                message_id: messageId,
                reply_markup: addBackButton(previousMenu, getPriceFromPhotoKeyboard)
            })
            .then(() => {
                bot.on('photo', (msg) => {
                    const photoObjectList = msg.photo;
                    console.log('list',msg.photo)
                    if (photoObjectList) {
                        // let lowQualityPhotoFileId = photoObjectList[0].file_id;
                        // let middleQualityPhotoFileId = photoObjectList[1].file_id;
                        photoList.length >= 2 ? photoList.push(photoObjectList[1].file_id) : photoList.push(photoObjectList[0].file_id);
                    }

                    if (photoList.length === 1) {
                        bot.sendMessage(
                            msg.chat.id,
                            "Как с вами связаться?",
                            sendVCard)
                    }
                });
                setTimeout(
                    () => {
                        for (let i = 0; i < photoList.length; i++) {
                            let fileId = photoList[i];
                            bot.sendPhoto(adminChatID, fileId);
                        }
                        photoList = [];
                    },
                    60000
                );
            });
        previousMenu = "Стоимость по фото 🖼️";

    } else if (msg.data.toString() === "Вопросы и ответы ❓") {
        bot.editMessageText(
            'Вопросы и ответы',
            {
                chat_id: chatId,
                message_id: messageId,
                reply_markup: addBackButton(previousMenu, faqKeyboard)
            });
        previousMenu = "Вопросы и ответы ❓";

    } else if (msg.data.toString() === "Корзина 📦") {
        let items = false;
        if (items) {
            bot.editMessageText(
                'Список товаров в корзине:',
                {
                    chat_id: chatId,
                    message_id: messageId,
                    reply_markup: addBackButton(previousMenu, cartKeyboard)
                });
        } else {
            bot.editMessageText(
                'Ваша козина пока пуста',
                {
                    chat_id: chatId,
                    message_id: messageId,
                    reply_markup: addBackButton(previousMenu, cartKeyboard)
                });
        }
        previousMenu = "Корзина 📦";

    } else if (msg.data.toString() === "Личный кабинет 💼") {
        bot.editMessageText(
            `Личный кабинет`,
            {
                chat_id: chatId,
                message_id: messageId,
                reply_markup: addBackButton(previousMenu, profileKeyboard)
            });
        previousMenu = "Личный кабинет 💼";

    } else if (msg.data.toString() === "Воздушные шары") {
        bot.editMessageText(
            '<a href="https://res.cloudinary.com/sharolandiya/image/upload/v1571502015/TelegramBotSharoladya/classic_exqdvy.png">Воздушные шары</a>'+`\n${chatOpponent}, вы открыли каталог классических воздушных шаров`,
            {
                chat_id: chatId,
                message_id: messageId,
                reply_markup: addBackButton(previousMenu, classicBallonsKeyboard),
                parse_mode: "HTML"
            });
        previousMenu = "Воздушные шары";

    } else if (msg.data.toString() === "Фольги-нные шары, фигуры") {
        bot.editMessageText(
            '<a href="https://res.cloudinary.com/sharolandiya/image/upload/v1571501721/TelegramBotSharoladya/foil_rhy8vw.png">Фольгированные шары, фигуры</a>'+`\n${chatOpponent}, вы открыли каталог фольгированных шаров`,
            {
                chat_id: chatId,
                message_id: messageId,
                reply_markup: addBackButton(previousMenu, foilBallonsKeyboard),
                parse_mode: "HTML"
            });

        previousMenu = "Фольги-нные шары, фигуры";

    } else if (msg.data.toString() === "Круглые шары") {
        const classicLatexNormalFilter = "SELECT * FROM telegramdb.balloonprice WHERE  material  IN ('латекс') and form_factor IN ('классический') and size_inches IN ('10','12','14','16','18') ORDER BY id_balloon";

        dataBaseQuery(classicLatexNormalFilter, function(result) {
            console.table(result);
            let table = makeString(result);

            bot.editMessageText(
                '<a href="https://res.cloudinary.com/sharolandiya/image/upload/v1571502015/TelegramBotSharoladya/classic_exqdvy.png">Круглые шары</a>' + `\n${chatOpponent}, вы открыли каталог классических латексных воздушных шаров ${table}`,
                {
                    chat_id: chatId,
                    message_id: messageId,
                    reply_markup: addBackButton(previousMenu, classicCircleBallonsKeyboard),
                    parse_mode: "HTML"
                });
            previousMenu = "Круглые шары";
        });
    }
});

bot.on("polling_error", (err) => console.log(err));


// const sql = `SELECT * FROM telegramdb.balloonprice`;
// const foilBalloons = "SELECT * FROM telegramdb.balloonprice WHERE  material  IN ('латекс','баблс') ORDER BY id_balloon";
// const airBalloons = "SELECT * FROM telegramdb.balloonprice WHERE  material  IN ('фольгированные') ORDER BY id_balloon";
// const sql2 = `SELECT NOW()`;//date

function dataBaseQuery(selector, dataBQ){
    pool.query(selector, (err, res) => {
        dataBQ(res.rows);
        if (err) {
            console.log(err);
        }
        else {
            console.log("connected to database");
        }
    });

}

function makeString(data) {

    // {
    //     id_balloon: 15,
    //     material: 'Р»Р°С‚РµРєСЃ',
    //     form_factor: 'РєР»Р°СЃСЃРёС‡РµСЃРєРёР№',
    //     glue: true,
    //     texture_color: 'С…СЂРѕРј',
    //     color: null,
    //     size_inches: 12,
    //     size_sm: 30,
    //     inner_atribut: null,
    //     number_foil: null,
    //     printed_text: 'false',
    //     made_in: null,
    //     price: 110
    // }


    let  description = "Арт: - артикуль товара. \n " +
        "Обр: - обработка шара специальным клеем для продолжительного полета." +
        "Тек: - текстура окраски шара и глубина цвета." +
        "Дюйм - еденица измерения" +
        "См"
    let newString = '\n\n| Арт: | Обработка | Текстура | Дюйм | СМ | Напол. | Цена |\n';
    for (let i = 0; i < data.length; i++) {
        let idBalloon = data[i].id_balloon >= 10 ? data[i].id_balloon : `${data[i].id_balloon}  `;
        let material = data[i].material;
        let formFactor = data[i].form_factor;
        let glue = data[i].glue ? 'Да  ' : 'Нет';
        let textureColor = data[i].texture_color.length > 7 ? data[i].texture_color.slice(0,7) : data[i].texture_color;
        let color = data[i].color;
        let sizeInches = data[i].size_inches;
        let sizeSm = data[i].size_sm;
        let innerAtribut = data[i].inner_atribut ? "Да  " : "Нет";
        let numberFoil = data[i].number_foil;
        let printedText = data[i].printed_text;
        let madeIn = data[i].made_in;
        let price = data[i].price >= 100 ? data[i].price : `${data[i].price}  `;

        newString += `| ${idBalloon} | ${glue} | ${textureColor} | ${sizeInches} д. | ${sizeSm} см. | ${innerAtribut} | ${price} руб. |\n`;
    }
    console.log(newString);
    return newString;
}
