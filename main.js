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

//создание кнопок из ключей обьекта objectKey прайслиста и склеивание с основной клавиатурой customKeyboard
function addPriceListKeyButtons (objectValue, objectKey) {
    console.log('addPriceListKeyButtons')
    let arrayButtons = [];
    let temp = [];

    for(let k = 0; k < objectValue.length; k++) {
        let data = '';
        if (objectValue[k] && typeof objectValue[k] === 'boolean') {
            data = 'Да';
        } else if (!objectValue[k] && typeof objectValue[k] === 'boolean') {
            data = 'Нет';
        } else {
            data = objectValue[k]
        }

        temp.push({text: data,callback_data: objectKey+'.'+data});
        if((k+1) % 5 === 0) {
            arrayButtons.push(temp);
            temp = []
        } else if(k+1 === objectValue.length ) {
            arrayButtons.push(temp)
        }
    }
    return arrayButtons;
}

//склеивание кнопок в клавиатуру
function concatButtons (fistkeyboard, secondkeyboard) {
    return {inline_keyboard: fistkeyboard.concat(secondkeyboard)};
}


bot.on('text', (msg) => {
    const chatValue = msg.chat;
    const chatId = msg.chat.id;
    const chatOpponent = chatValue.first_name ? chatValue.first_name : "Дорогой клиент";

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
            '<a href="https://res.cloudinary.com/sharolandiya/image/upload/v1571498410/TelegramBotSharoladya/sharolandiay_noxiev.png">Шароландия</a>' + `\n${chatOpponent}, вы нажали шары вводная общая информация о услугам`,
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
    } else if (msg.text.toString().length >= 4 && msg.text.toString().length <= 8) {
        let message = msg.text.toString();
        checkDashInString();

        function checkDashInString() {
            let dash = 0;
            for (let i = 0; i < message.length; i++) {
                if (message[i] === "-") {
                    dash++
                }
            }

            if (dash === 2) {
                let messageArray = message.split("-");
                checkNumberNotZero(messageArray);
            } else {
                console.log('Wrong type of message')
            }
        }

        function checkNumberNotZero(messageArray) {
            console.log(messageArray);
            for (let i = 0; i < messageArray.length; i++) {
                if (i === 0) {
                    if (!parseInt(messageArray[i]) || isNaN(messageArray[i])) {
                        console.log('Wrong article, cant be empty or with letters');
                    } else if (parseInt(messageArray[i]) === 0) {
                        console.log(isNaN(messageArray[i]), 'Article cant be zero');
                    }
                } else if (i === 1) {
                    if (!parseInt(messageArray[i]) || isNaN(messageArray[i])) {
                        console.log('Wrong color, cant be empty or with letters');
                    } else if (parseInt(messageArray[i]) === 0) {
                        console.log(isNaN(messageArray[i]), 'Color cant be zero');
                    }
                } else if (i === 2) {
                    if (!parseInt(messageArray[i]) || isNaN(messageArray[i])) {
                        console.log('Wrong count, cant be empty or with letters');
                    } else if (parseInt(messageArray[i]) === 0) {
                        console.log(isNaN(messageArray[i]), 'Count cant be zero');
                    }
                }
            }
        }

    } else {
        console.log('Wrong type of message')
    }
});


//для расчета по фото
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

//полный прайс лист
// let priceList = [];
//
// dataBaseQuery("SELECT * FROM telegramdb.balloonprice ORDER BY id_balloon", function (result) {
//     // console.log(result);
//     priceList = result.slice();
//     arrayFromPriceListKeys(priceList);
// });


let newAddingBalloon = {
    glue: [],
    texture_color: [],
    // color: [], //return  color: [ null ]
    size_inches: [],
    size_sm: [],
    inner_atribut: [],
    // number_foil: [], //return  number_foil: [ null ]
    printed_text: [],
    made_in: [],
};


//получить все значение возможные в прайс листе по каждлому шару для кнопок и уточнений от клиента
function arrayFromPriceListKeys (priceList) {
    let element = {
        glue: [],
        texture_color: [],
        // color: [], //return  color: [ null ]
        size_inches: [],
        size_sm: [],
        inner_atribut: [],
        // number_foil: [], //return  number_foil: [ null ]
        printed_text: [],
        made_in: [],
    };
    let elementKeysList = Object.keys(element); //массив ключей []

    for (let j = 0; j < priceList.length; j++) {
        for (let i = 0; i < elementKeysList.length; i++) {
            element[elementKeysList[i]].push(priceList[j][elementKeysList[i]])
        }
    }

    for (let i = 0; i < elementKeysList.length; i++) {
        let unique  = new Set(element[elementKeysList[i]]);
        element[elementKeysList[i]] = Array.from(unique).sort();
        if (element[elementKeysList[i]].length < 2 && element[elementKeysList[i]][0] === null) {
            delete element[elementKeysList[i]];
        }
    }
    // console.log(element);

    return element;
};

//прайс листы по категориям
let cleanOrPaintedFoil = [];
let figureFlyFoil = [];
let numberFoil = [];
let letterFoil = [];
let floorMoveFoil = [];

let classic = [];
let heart = [];
let bigSize = [];
let babbles = [];
let withPaint = [];
// let modelBalloon = [];

const cleanOrPaintedFoilFilter = "SELECT * FROM telegramdb.balloonprice WHERE  material  IN ('сердце','звезда','круг') ORDER BY id_balloon";
const figureFlyFoilFilter = "SELECT * FROM telegramdb.balloonprice WHERE  material  IN ('фигуры') ORDER BY id_balloon";
const numberFoilFilter = "SELECT * FROM telegramdb.balloonprice WHERE  material  IN ('цифра') ORDER BY id_balloon";
const letterFoilFilter = "SELECT * FROM telegramdb.balloonprice WHERE  material  IN ('буква') ORDER BY id_balloon";
const floorMoveFoilFilter = "SELECT * FROM telegramdb.balloonprice WHERE  material  IN ('напольные') ORDER BY id_balloon";

const classicFilter = "SELECT * FROM telegramdb.balloonprice WHERE  material  IN ('латекс') and form_factor IN ('классический') and size_inches IN ('10','12','14','16','18') ORDER BY id_balloon";
const heartFilter = "SELECT * FROM telegramdb.balloonprice WHERE  material  IN ('латекс') and form_factor IN ('сердце') ORDER BY id_balloon";
const bigSizeFilter = "SELECT * FROM telegramdb.balloonprice WHERE  material  IN ('латекс') and form_factor IN ('классический') and size_inches IN ('24','26','27','30','36','40') ORDER BY id_balloon";
const babblesFilter = "SELECT * FROM telegramdb.balloonprice WHERE  material  IN ('баблс') and form_factor IN ('шар') ORDER BY id_balloon";
const withPaintFilter = "SELECT * FROM telegramdb.balloonprice WHERE  material  IN ('латекс') and form_factor IN ('классический') and texture_color IN ('дизайн') ORDER BY id_balloon";
// const modelBalloonFilter = "SELECT * FROM telegramdb.balloonprice WHERE  material  IN ('латекс') and form_factor IN ('моделирование') ORDER BY id_balloon";


//фольга запрашиваем обьект прайс листа по категориям
dataBaseQuery(cleanOrPaintedFoilFilter, function (result) {
    cleanOrPaintedFoil = result.slice();
});


dataBaseQuery(figureFlyFoilFilter, function (result) {
    figureFlyFoil = result.slice();
});


dataBaseQuery(numberFoilFilter, function (result) {
    numberFoil = result.slice();
});

dataBaseQuery(letterFoilFilter, function (result) {
    letterFoil = result.slice();
});

dataBaseQuery(floorMoveFoilFilter, function (result) {
    floorMoveFoil = result.slice();
});


//латекс запрашиваем обьект прайс листа по категориям
dataBaseQuery(classicFilter, function (result) {
    classic = result.slice();
});

dataBaseQuery(heartFilter, function (result) {
    heart = result.slice();
});

dataBaseQuery(bigSizeFilter, function (result) {
    bigSize = result.slice();
});

dataBaseQuery(babblesFilter, function (result) {
    babbles = result.slice();
});

dataBaseQuery(withPaintFilter, function (result) {
    withPaint = result.slice();
});

// dataBaseQuery(modelBalloonFilter, function (result) {
//     modelBalloon = result.slice();
// });



bot.on("callback_query", (msg) => {

    // console.log(msg);
    const chatValue = msg.message.chat;
    const chatId = chatValue.id;
    const chatOpponent = chatValue.first_name ? chatValue.first_name : "Дорогой клиент";
    const messageId = msg.message.message_id;


    // bot.sendMessage(chatId,
    //     `${msg.data} -------- callbackquery кнопка`,
    //     {reply_markup: {}});


    if (msg.data.toString() === "Шары 🎈") {
        bot.editMessageText(
            '<a href="https://res.cloudinary.com/sharolandiya/image/upload/v1571498410/TelegramBotSharoladya/sharolandiay_noxiev.png">Шароландия</a>' + `\n${chatOpponent}, вы нажали шары вводная общая информация о услугам`,
            {
                chat_id: chatId,
                message_id: messageId,
                reply_markup: addBackButton(previousMenu, keyboardBalloons),
                parse_mode: "HTML"
            });
        previousMenu = "Шары 🎈";

    } else if (msg.data.toString() === "Каталог и цены 🎁") {
        bot.editMessageText(
            '<a href="https://res.cloudinary.com/sharolandiya/image/upload/v1571502686/TelegramBotSharoladya/catalog_ktpfa6.png">Каталог и цены 🎁</a>' + `${chatOpponent}, вы открыли каталог и цены`,
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
                    console.log('list', msg.photo)
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

    } else if (msg.data.toString() === "Как заказать ❓") {
        bot.editMessageText(
            'Как заказать ❓',
            {
                chat_id: chatId,
                message_id: messageId,
                reply_markup: addBackButton(previousMenu, faqKeyboard)
            });
        previousMenu = "Как заказать ❓";

    } else if (msg.data.toString() === "Доставка 🚚") {
        bot.editMessageText(
            'Доставка 🚚',
            {
                chat_id: chatId,
                message_id: messageId,
                reply_markup: addBackButton(previousMenu, faqKeyboard)
            });
        previousMenu = "Доставка 🚚";

    } else if (msg.data.toString() === "Адреса") {
        bot.editMessageText(
            'Адреса',
            {
                chat_id: chatId,
                message_id: messageId,
                reply_markup: addBackButton(previousMenu, faqKeyboard)
            });
        previousMenu = "Адреса";

    } else if (msg.data.toString() === "Гарантии 👍") {
        bot.editMessageText(
            'Гарантии 👍',
            {
                chat_id: chatId,
                message_id: messageId,
                reply_markup: addBackButton(previousMenu, faqKeyboard)
            });
        previousMenu = "Гарантии 👍";

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
                'Ваша корзина пока пуста',
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
            '<a href="https://res.cloudinary.com/sharolandiya/image/upload/v1571502015/TelegramBotSharoladya/classic_exqdvy.png">Воздушные шары</a>' + `\n${chatOpponent}, вы открыли каталог классических воздушных шаров`,
            {
                chat_id: chatId,
                message_id: messageId,
                reply_markup: addBackButton(previousMenu, classicBallonsKeyboard),
                parse_mode: "HTML"
            });
        previousMenu = "Воздушные шары";

    } else if (msg.data.toString() === "Фольги-нные шары, фигуры") {
        bot.editMessageText(
            '<a href="https://res.cloudinary.com/sharolandiya/image/upload/v1571501721/TelegramBotSharoladya/foil_rhy8vw.png">Фольгированные шары, фигуры</a>' + `\n${chatOpponent}, вы открыли каталог фольгированных шаров`,
            {
                chat_id: chatId,
                message_id: messageId,
                reply_markup: addBackButton(previousMenu, foilBallonsKeyboard),
                parse_mode: "HTML"
            });

        previousMenu = "Фольги-нные шары, фигуры";

    } else if (msg.data.toString() === "Фигуры") {
        arrayFromPriceListKeys(figureFlyFoil);

        bot.editMessageText(
            '<a href="https://res.cloudinary.com/sharolandiya/image/upload/v1571501721/TelegramBotSharoladya/foil_rhy8vw.png">Фигуры</a>' + `\n${chatOpponent}, вы открыли каталог фольгированных фигуры`,
            {
                chat_id: chatId,
                message_id: messageId,
                reply_markup: addBackButton(previousMenu, foilBallonsKeyboard),
                parse_mode: "HTML"
            });

        previousMenu = "Фигуры";

    } else if (msg.data.toString() === "Цифры") {
        arrayFromPriceListKeys(numberFoil);

        bot.editMessageText(
            '<a href="https://res.cloudinary.com/sharolandiya/image/upload/v1571501721/TelegramBotSharoladya/foil_rhy8vw.png">Цифры</a>' + `\n${chatOpponent}, вы открыли каталог фольгированных цифр`,
            {
                chat_id: chatId,
                message_id: messageId,
                reply_markup: addBackButton(previousMenu, foilBallonsKeyboard),
                parse_mode: "HTML"
            });

        previousMenu = "Цифры";

    } else if (msg.data.toString() === "Фольга с рисунком") {
        arrayFromPriceListKeys(cleanOrPaintedFoil);

        bot.editMessageText(
            '<a href="https://res.cloudinary.com/sharolandiya/image/upload/v1571501721/TelegramBotSharoladya/foil_rhy8vw.png">Фольга с рисунком</a>' + `\n${chatOpponent}, вы открыли каталог фольгированных шары с рисунком`,
            {
                chat_id: chatId,
                message_id: messageId,
                reply_markup: addBackButton(previousMenu, foilBallonsKeyboard),
                parse_mode: "HTML"
            });

        previousMenu = "Фольга с рисунком";

    } else if (msg.data.toString() === "Фольга без рисунком") {
        arrayFromPriceListKeys(cleanOrPaintedFoil);

        bot.editMessageText(
            '<a href="https://res.cloudinary.com/sharolandiya/image/upload/v1571501721/TelegramBotSharoladya/foil_rhy8vw.png">Фольга без рисунком</a>' + `\n${chatOpponent}, вы открыли каталог фольгированных шаров без рисунка`,
            {
                chat_id: chatId,
                message_id: messageId,
                reply_markup: addBackButton(previousMenu, foilBallonsKeyboard),
                parse_mode: "HTML"
            });

        previousMenu = "Фольга без рисунком";

    } else if (msg.data.toString() === "Буквы") {
        arrayFromPriceListKeys(letterFoil);


        bot.editMessageText(
            '<a href="https://res.cloudinary.com/sharolandiya/image/upload/v1571501721/TelegramBotSharoladya/foil_rhy8vw.png">Буквы</a>' + `\n${chatOpponent}, вы открыли каталог фольгированных букв`,
            {
                chat_id: chatId,
                message_id: messageId,
                reply_markup: addBackButton(previousMenu, foilBallonsKeyboard),
                parse_mode: "HTML"
            });

        previousMenu = "Буквы";

    } else if (msg.data.toString() === "Ходилки") {
        arrayFromPriceListKeys(floorMoveFoil);

        bot.editMessageText(
            '<a href="https://res.cloudinary.com/sharolandiya/image/upload/v1571501721/TelegramBotSharoladya/foil_rhy8vw.png">Фигуры</a>' + `\n${chatOpponent}, вы открыли каталог фольгированных ходилок`,
            {
                chat_id: chatId,
                message_id: messageId,
                reply_markup: addBackButton(previousMenu, foilBallonsKeyboard),
                parse_mode: "HTML"
            });

        previousMenu = "Ходилки";

    } else if (msg.data.toString() === "Круглые шары") {


        interview(classic);
        // bot.editMessageText(
        //     '<a href="https://res.cloudinary.com/sharolandiya/image/upload/v1572645575/TelegramBotSharoladya/Frame_1_mey6ns.png">Круглые шары</a>' + `\n${chatOpponent}, вы открыли каталог классических латексных воздушных шаров.`,
        //     {
        //         chat_id: chatId,
        //         message_id: messageId,
        //         reply_markup: addBackButton(previousMenu, classicCircleBallonsKeyboard),
        //         parse_mode: "HTML"
        //     });

        previousMenu = "Круглые шары";

    } else if (msg.data.toString() === "Шары для моделирования") {
        // arrayFromPriceListKeys(modelBalloon);

        bot.editMessageText(
            '<a href="https://res.cloudinary.com/sharolandiya/image/upload/v1572645575/TelegramBotSharoladya/Frame_1_mey6ns.png">Шары для моделирования</a>' + `\n${chatOpponent}, вы открыли каталог шаров для моделирования.`,
            {
                chat_id: chatId,
                message_id: messageId,
                reply_markup: addBackButton(previousMenu, classicCircleBallonsKeyboard),
                parse_mode: "HTML"
            });

        previousMenu = "Шары для моделирования";

    } else if (msg.data.toString() === "Сердца") {
        arrayFromPriceListKeys(heart);

        bot.editMessageText(
            '<a href="https://res.cloudinary.com/sharolandiya/image/upload/v1572645575/TelegramBotSharoladya/Frame_1_mey6ns.png">Сердца</a>' + `\n${chatOpponent}, вы открыли каталог шаров сердца.`,
            {
                chat_id: chatId,
                message_id: messageId,
                reply_markup: addBackButton(previousMenu, classicCircleBallonsKeyboard),
                parse_mode: "HTML"
            });

        previousMenu = "Сердца";

    } else if (msg.data.toString() === "Большие шары") {
        arrayFromPriceListKeys(bigSize);

        bot.editMessageText(
            '<a href="https://res.cloudinary.com/sharolandiya/image/upload/v1572645575/TelegramBotSharoladya/Frame_1_mey6ns.png">Большие шары</a>' + `\n${chatOpponent}, вы открыли каталог больших шаров.`,
            {
                chat_id: chatId,
                message_id: messageId,
                reply_markup: addBackButton(previousMenu, classicCircleBallonsKeyboard),
                parse_mode: "HTML"
            });

        previousMenu = "Большие шары";

    } else if (msg.data.toString() === "Баблс") {
        arrayFromPriceListKeys(babbles);

        bot.editMessageText(
            '<a href="https://res.cloudinary.com/sharolandiya/image/upload/v1572645575/TelegramBotSharoladya/Frame_1_mey6ns.png">Баблс</a>' + `\n${chatOpponent}, вы открыли каталог баблс.`,
            {
                chat_id: chatId,
                message_id: messageId,
                reply_markup: addBackButton(previousMenu, classicCircleBallonsKeyboard),
                parse_mode: "HTML"
            });

        previousMenu = "Баблс";

    } else if (msg.data.toString() === "Шары с рисунком") {
        arrayFromPriceListKeys(withPaint);

        bot.editMessageText(
            '<a href="https://res.cloudinary.com/sharolandiya/image/upload/v1572645575/TelegramBotSharoladya/Frame_1_mey6ns.png">Шары с рисунком</a>' + `\n${chatOpponent}, вы открыли каталог шаров с рисунком.`,
            {
                chat_id: chatId,
                message_id: messageId,
                reply_markup: addBackButton(previousMenu, classicCircleBallonsKeyboard),
                parse_mode: "HTML"
            });

        previousMenu = "Шары с рисунком";

    } else if (msg.data.toString() === "опрос") {
        //запуск функции
        interview()
    }

    //опрос покупателя по часто повторяющимся справшиваемым вопросам по шарам
    // с динамической генерацией клавиатуры и вопросов в зависимости от категории
    function interview(data) {
        console.log('interview');
        let arrayValuesForEachKey = arrayFromPriceListKeys(data);
        // const keysArray = Object.keys(arrayFromPriceListKeys).sort();

        if (arrayValuesForEachKey.hasOwnProperty('glue')) {
            if (arrayValuesForEachKey.glue.length > 0 && newAddingBalloon.glue.length < 1) {
                let standartKeyboard = addBackButton(previousMenu, classicCircleBallonsKeyboard);
                let dynamicKeyboard = addPriceListKeyButtons(arrayValuesForEachKey.glue, "glue");

                bot.editMessageText(
                    '<a href="">Обработка </a>' + `Для чего нужна обработка шара: Вам шар обработкой ?`,
                    {
                        chat_id: chatId,
                        message_id: messageId,
                        reply_markup: concatButtons(dynamicKeyboard, standartKeyboard.inline_keyboard),
                        parse_mode: "HTML"
                    });
            }
            // Do things here
        }
        else if (arrayValuesForEachKey.hasOwnProperty('texture_color')) {
            if (arrayValuesForEachKey.texture_color.length > 0 && newAddingBalloon.texture_color.length < 1) {
                let standartKeyboard = addBackButton(previousMenu, classicCircleBallonsKeyboard);
                let dynamicKeyboard = addPriceListKeyButtons(arrayValuesForEachKey.glue, "texture_color");

                bot.editMessageText(
                    '<a href="">Обработка</a>' + `У воздушных шаров бывает ращличная текстура цвета. Шары с сложным цветом чуть дороше простых. Какая текстура вам нужна?`,
                    {
                        chat_id: chatId,
                        message_id: messageId,
                        reply_markup: concatButtons(dynamicKeyboard, standartKeyboard.inline_keyboard),
                        parse_mode: "HTML"
                    });
            }
            // Do things here
        }
    }
});




bot.on("polling_error", (err) => console.log(err));

//подключение к дб
function dataBaseQuery(selector, dataBQ) {
    pool.query(selector, (err, res) => {
        dataBQ(res.rows);
        if (err) {
            console.log(err);
        } else {
            console.log("connected to database");
        }
    });

}









// else if (msg.data.toString() === "Круглые шары") {//под замену колбек
//     console.log(priceList);
//     const classicLatexNormalFilter = "SELECT * FROM telegramdb.balloonprice WHERE  material  IN ('латекс') and form_factor IN ('классический') and size_inches IN ('10','12','14','16','18') ORDER BY id_balloon";
//
//     dataBaseQuery(classicLatexNormalFilter, function (result) {
//         let table = makeString(result);
//         bot.editMessageText(
//             '<a href="https://res.cloudinary.com/sharolandiya/image/upload/v1572645575/TelegramBotSharoladya/Frame_1_mey6ns.png">Круглые шары</a>' + `\n${chatOpponent}, вы открыли каталог классических латексных воздушных шаров.\n\n${table}`,
//             {
//                 chat_id: chatId,
//                 message_id: messageId,
//                 reply_markup: addBackButton(previousMenu, classicCircleBallonsKeyboard),
//                 parse_mode: "HTML"
//             });
//         previousMenu = "Круглые шары";
//     });
// }



//создание текста
function makeString(data) {

    // {
    //     id_balloon: 15,
    //     material: 'каучук',
    //     form_factor: 'класические',
    //     glue: true,
    //     texture_color: '4 вида ',
    //     color: '72 вида',
    //     size_inches: 12,
    //     size_sm: 30,
    //     inner_atribut: null,
    //     number_foil: null,
    //     printed_text: 'false',
    //     made_in: null,
    //     price: 110
    // }
    let instruction = "<strong>Инструкция добавления в корзину:\n</strong>" +
        "1) Выберите актикуль шара, номер цвета, определитесь с количеством\n" +
        "2) Отправьте сообщение (цифрами, через тире, без пробела):\n " +
        "артикуль-цвет-количество\n" +
        "Пример сообщения:\nхх-хх-хх\n";

    let terms = "<strong>Сокращения:</strong>\n" +
        "<strong>\"Ар\"</strong> - артикуль товара.\n " +
        "<strong>\"Об\"</strong> - обработка шара.\n" +
        "<strong>\"Тек\"</strong> - текстура цвета (пастель, прозрачные, металик, с дизайном, хром, агат).\n" +
        "<strong>\"Д.\"</strong> - дюймов в диаметре.\n" +
        "<strong>\"См\"</strong> - сантиметров в диаметре.\n" +
        "<strong>\"Нап\"</strong> - наполнитель конфетти или краски.\n" +
        "<strong>\"Цен\"</strong> - стомость в рублях.\n\n ";

    let catalog = "<strong>Прайс-лист:</strong>\n" +
        "\n| Ар | Об | Тек | Д. | См | Нап | Цен |\n";

    for (let i = 0; i < data.length; i++) {
        let idBalloon = data[i].id_balloon >= 10 ? data[i].id_balloon : `${data[i].id_balloon}  `;
        let material = data[i].material;
        let formFactor = data[i].form_factor;
        let glue = data[i].glue ? 'да ' : 'нет';
        let textureColor = data[i].texture_color.length > 3 ? data[i].texture_color.slice(0, 3) : data[i].texture_color;
        let color = data[i].color;
        let sizeInches = data[i].size_inches;
        let sizeSm = data[i].size_sm;
        let innerAtribut = data[i].inner_atribut ? "да  " : "нет";
        let numberFoil = data[i].number_foil;
        let printedText = data[i].printed_text;
        let madeIn = data[i].made_in;
        let price = data[i].price >= 100 ? data[i].price : ` ${data[i].price} `;

        catalog += `|  ${idBalloon} | ${glue} | ${textureColor}  | ${sizeInches} | ${sizeSm} |  ${innerAtribut} | ${price} |\n`;
    }
    let textMessage = catalog + "\n" + terms + instruction;
    return textMessage;
}
