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
let arrayValuesForEachKey = [];
let currentCategory = '';

//объект нового шара для опроса
let newAddingBalloon = {
    glue: '',
    texture_color: '',
    // color: [], //return  color: [ null ]
    size_inches: '',
    // size_sm: '',
    inner_atribut: '',
    // number_foil: [], //return  number_foil: [ null ]
    printed_text: '',
    made_in: '',
};

//очистки обькта шара, при переключении категории
function cleanNewAddingBalloon () {
    console.log('function cleanNewAddingBalloon');
    for (let i in newAddingBalloon){
        if (newAddingBalloon.hasOwnProperty(i)){
            delete newAddingBalloon[i];
        }
    }
    console.log(newAddingBalloon)
}

let filteredByConstructor = []; //найденный по фильтру обьект шара или шаров
let filteredSelector = '';

//функций редактирования запроса к базе по фильтру - новому обьекту шара newAddingBalloon
function selectorBuilder(selector) {
    console.log('function selectorBuilder');
    if (newAddingBalloon.size_inches) {
        let tempFilter = selector.slice(0, -20);
        for (let i in newAddingBalloon) {
            if (newAddingBalloon.hasOwnProperty(i)) {
                tempFilter += ` and ${i} IN ('${newAddingBalloon[i]}')`
            }
        }
        return tempFilter + " ORDER BY id_balloon";
    } else {
        return selector;
    }
}

//фольга селектор по категориям
const cleanFoilFilter = "SELECT * FROM telegramdb.balloonprice WHERE  material IN ('фольгированные') and form_factor IN ('сердце','звезда','круг') ORDER BY id_balloon";
const paintedFoilFilter = "SELECT * FROM telegramdb.balloonprice WHERE  material IN ('фольгированные') and form_factor IN ('сердце с рисунком', 'звезда с рисунком', 'круг с рисунком') ORDER BY id_balloon";
const figureFlyFoilFilter = "SELECT * FROM telegramdb.balloonprice WHERE  material IN ('фольгированные') and form_factor IN ('фигура летающая') ORDER BY id_balloon";
const numberFoilFilter = "SELECT * FROM telegramdb.balloonprice WHERE  material IN ('фольгированные') and form_factor IN ('цифра') ORDER BY id_balloon";
const letterFoilFilter = "SELECT * FROM telegramdb.balloonprice WHERE  material IN ('фольгированные') and form_factor IN ('буква') ORDER BY id_balloon";
const floorMoveFoilFilter = "SELECT * FROM telegramdb.balloonprice WHERE  material IN ('фольгированные') and form_factor IN ('фигура напольная') ORDER BY id_balloon";

//латекс селектор по категориям
const classicFilter = "SELECT * FROM telegramdb.balloonprice WHERE  material  IN ('латекс') and form_factor IN ('классический') and size_inches IN ('10','12','14','16','18') ORDER BY id_balloon";
const heartFilter = "SELECT * FROM telegramdb.balloonprice WHERE  material  IN ('латекс') and form_factor IN ('сердце') ORDER BY id_balloon";
const bigSizeFilter = "SELECT * FROM telegramdb.balloonprice WHERE  material  IN ('латекс') and form_factor IN ('классический') and size_inches IN ('24','26','27','30','36','40') ORDER BY id_balloon";
const babblesFilter = "SELECT * FROM telegramdb.balloonprice WHERE  material  IN ('баблс') and form_factor IN ('шар') ORDER BY id_balloon";
const withPaintFilter = "SELECT * FROM telegramdb.balloonprice WHERE  material  IN ('латекс') and form_factor IN ('классический c рисунком') ORDER BY id_balloon";
const modelBalloonFilter = "SELECT * FROM telegramdb.balloonprice WHERE  material  IN ('латекс') and form_factor IN ('шар для моделирования') ORDER BY id_balloon";


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
    console.log('function addPriceListKeyButtons');

    let arrayButtons = [];
    let temp = [];

    for(let k = 0; k < objectValue.length; k++) {
        let data = '';
        if (objectValue[k] && typeof objectValue[k] === 'boolean') {
            data = 'Да';
        } else if (!objectValue[k] && typeof objectValue[k] === 'boolean') {
            data = 'Нет';
        } else if (!objectValue[k] && typeof objectValue[k] === 'object') {
            data = 'Нет';
        } else {
            data = objectValue[k]
        }

        temp.push({text: data,callback_data: 'опрос.'+objectKey+'.'+objectValue[k]});
        if((k+1) % 4 === 0) {
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

//для расчета стоимости по фото
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


//получить все значение возможные в прайс листе по каждому шару для кнопок и уточнений от клиента
function arrayFromPriceListKeys (priceList) {
    console.log('function arrayFromPriceListKeys ');
    let element = {
        glue: [],
        texture_color: [],
        // color: [], //return  color: [ null ]
        size_inches: [],
        // size_sm: [],
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
    console.log(element);

    return element;
};


bot.on('text', (msg) => {
    const chatValue = msg.chat;
    const chatId = msg.chat.id;
    const chatOpponent = chatValue.first_name ? chatValue.first_name : "Дорогой клиент";

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


bot.on("callback_query", (msg) => {

    // console.log(msg);
    console.log("[]", previousMenu);
    const chatValue = msg.message.chat;
    const chatId = chatValue.id;
    const chatOpponent = chatValue.first_name ? chatValue.first_name : "Дорогой клиент";
    const messageId = msg.message.message_id;


    // bot.sendMessage(chatId,
    //     `${msg.data} -------- callbackquery кнопка`,
    //     {reply_markup: {}});

    //запоняем обьект нового шара параметрами
    let interviewAnswer = msg.data.toString().split('.');

    if (interviewAnswer[1] && interviewAnswer[2]) {
        newAddingBalloon[interviewAnswer[1]] = interviewAnswer[2];
        console.log(newAddingBalloon[interviewAnswer[1]],'----- in to object')
    }


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
            '<a href="https://res.cloudinary.com/sharolandiya/image/upload/v1571502686/TelegramBotSharoladya/catalog_ktpfa6.png">Каталог и цены 🎁</a> \n' + `${chatOpponent}, вы открыли каталог и цены`,
            {
                chat_id: chatId,
                message_id: messageId,
                reply_markup: addBackButton(previousMenu, priceListKeyboard),
                parse_mode: "HTML"
            });
        previousMenu = "Каталог и цены 🎁";

    } else if (msg.data.toString() === "Стоимость по фото 🖼️") {
        bot.editMessageText(
            `${chatOpponent}` + ', пожалуйста прикрепите к сообщению понравившиеся фотографии или композиции, и нажмите отправить. \n\n📲 С вами свяжется специалит для дальнейшей консультаци по стоимости. \n\n⏱ Примерное время ответа ответа 30 минут.',
            {
                chat_id: chatId,
                message_id: messageId,
                reply_markup: addBackButton(previousMenu, getPriceFromPhotoKeyboard)
            })
            .then(() => {
                bot.on('photo', (msg) => {
                    const photoObjectList = msg.photo;
                    console.log('list', msg.photo);
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
        cleanNewAddingBalloon();
        currentCategory = figureFlyFoilFilter;
        interview();
        previousMenu = "Фольги-нные шары, фигуры";

    } else if (msg.data.toString() === "Цифры") {
        cleanNewAddingBalloon();
        currentCategory = numberFoilFilter;
        interview();
        previousMenu = "Фольги-нные шары, фигуры";


    } else if (msg.data.toString() === "Фольга с рисунком") {
        cleanNewAddingBalloon();
        currentCategory = paintedFoilFilter;
        interview();
        previousMenu = "Фольги-нные шары, фигуры";

    } else if (msg.data.toString() === "Фольга без рисунка") {
        cleanNewAddingBalloon();
        currentCategory = cleanFoilFilter;
        interview();
        previousMenu = "Фольги-нные шары, фигуры";

    } else if (msg.data.toString() === "Буквы") {
        cleanNewAddingBalloon();
        currentCategory = letterFoilFilter;
        interview();
        previousMenu = "Фольги-нные шары, фигуры";

    } else if (msg.data.toString() === "Ходилки") {
        cleanNewAddingBalloon();
        currentCategory = floorMoveFoilFilter;
        interview();
        previousMenu = "Фольги-нные шары, фигуры";

    } else if (msg.data.toString() === "Круглые шары") {
        cleanNewAddingBalloon();
        currentCategory = classicFilter;
        interview();
        previousMenu = "Воздушные шары";

    } else if (msg.data.toString() === "Шары для моделирования") {
        cleanNewAddingBalloon();
        currentCategory = modelBalloonFilter;
        interview();
        previousMenu = "Воздушные шары";

    } else if (msg.data.toString() === "Сердца") {
        cleanNewAddingBalloon();
        currentCategory = heartFilter;
        interview();
        previousMenu = "Воздушные шары";

    } else if (msg.data.toString() === "Большие шары") {
        cleanNewAddingBalloon();
        currentCategory = bigSizeFilter;
        interview();
        previousMenu = "Воздушные шары";

    } else if (msg.data.toString() === "Сферы Баблс") {
        cleanNewAddingBalloon();
        currentCategory = babblesFilter;
        interview();
        previousMenu = "Воздушные шары";

    } else if (msg.data.toString() === "Шары с рисунком") {
        cleanNewAddingBalloon();
        currentCategory = withPaintFilter;
        interview();
        previousMenu = "Воздушные шары";

    } else if (interviewAnswer[0] === "опрос") {
        interview();
        previousMenu = "Воздушные шары";
    }




    //опрос покупателя по часто повторяющимся справшиваемым вопросам по шарам
    // с динамической генерацией клавиатуры и вопросов в зависимости от категории
    function interview() {
        console.log('function interview');

        filteredSelector = selectorBuilder(currentCategory);//отправить объект нового шара для выборки
        console.log(filteredSelector);
        dataBaseQuery(filteredSelector, function (result) {
            filteredByConstructor = result.slice();
            console.log(filteredByConstructor);
            arrayValuesForEachKey = arrayFromPriceListKeys(filteredByConstructor);

            if (arrayValuesForEachKey.size_inches &&
                arrayValuesForEachKey.size_inches.length > 1 &&
                !newAddingBalloon.size_inches) {

                let standartKeyboard = addBackButton(previousMenu, classicCircleBallonsKeyboard);
                let dynamicKeyboard = addPriceListKeyButtons(arrayValuesForEachKey.size_inches, "size_inches");


                bot.editMessageText(
                    '<a href="https://res.cloudinary.com/sharolandiya/image/upload/v1575313729/TelegramBotSharoladya/razmery_sharov-1_y7rheq.jpg">Размеры шаров</a> \n\nПожалуйста укажите, какого размера вам нужен шар?',
                    {
                        chat_id: chatId,
                        message_id: messageId,
                        reply_markup: concatButtons(dynamicKeyboard, standartKeyboard.inline_keyboard),
                        parse_mode: "HTML"
                    });
            } else if (arrayValuesForEachKey.texture_color &&
                arrayValuesForEachKey.texture_color.length > 1 &&
                !newAddingBalloon.texture_color) {


                let standartKeyboard = addBackButton(previousMenu, classicCircleBallonsKeyboard);
                let dynamicKeyboard = addPriceListKeyButtons(arrayValuesForEachKey.texture_color, "texture_color");


                bot.editMessageText(
                    '<a href="https://res.cloudinary.com/sharolandiya/image/upload/v1572645575/TelegramBotSharoladya/Frame_1_mey6ns.png">Текстура и доступная палитра цветов</a> \n\nВоздушные шары бывают различной текстуры и оттенка. Агат, металик, хром дороже пастельных оттенков (примерно на 20 - 40 руб в зависимости от размера).  \n\nПожалуйста укажите, какая текстура вам нужна?',
                    {
                        chat_id: chatId,
                        message_id: messageId,
                        reply_markup: concatButtons(dynamicKeyboard, standartKeyboard.inline_keyboard),
                        parse_mode: "HTML"
                    });
            } else if (arrayValuesForEachKey.glue &&
                arrayValuesForEachKey.glue.length > 1 &&
                !newAddingBalloon.glue) {

                let standartKeyboard = addBackButton(previousMenu, classicCircleBallonsKeyboard);
                let dynamicKeyboard = addPriceListKeyButtons(arrayValuesForEachKey.glue, "glue");

                bot.editMessageText(
                    '<a href="https://res.cloudinary.com/sharolandiya/image/upload/v1575315719/TelegramBotSharoladya/hifloat_kvzf7x.png">🎬 В чём разница у шаров с обработкой Hi-Float и без?</a> \n\nШары без обработки летают 10-12 часов, с обработкой время полёта значительно увеличивается до 3-7 дней (в зависимости от типа шарика и внешних условий). В идеальных условиях шарик с обработкой может "жить" до месяца! \n\nЧтобы ответить на него наиболее наглядно мы сняли это видео. https://youtu.be/1fhV798ay1k \n\nПожалуйста укажите, вам шар с обработкой ?\n',
                    {
                        chat_id: chatId,
                        message_id: messageId,
                        reply_markup: concatButtons(dynamicKeyboard, standartKeyboard.inline_keyboard),
                        parse_mode: "HTML"
                    });
            } else if (arrayValuesForEachKey.inner_atribut &&
                arrayValuesForEachKey.inner_atribut.length > 1 &&
                !newAddingBalloon.inner_atribut) {

                let standartKeyboard = addBackButton(previousMenu, classicCircleBallonsKeyboard);
                let dynamicKeyboard = addPriceListKeyButtons(arrayValuesForEachKey.inner_atribut, "inner_atribut");


                bot.editMessageText(
                    '<a href="">Наполнитель</a> \n\nНекоторые шары можно украсить различными атрибутами: конфети, перьями, светодиодами или даже игрушками. \n\nПожалуйста укажите, Нужен ли вам наполнитель?',
                    {
                        chat_id: chatId,
                        message_id: messageId,
                        reply_markup: concatButtons(dynamicKeyboard, standartKeyboard.inline_keyboard),
                        parse_mode: "HTML"
                    });
            } else if (arrayValuesForEachKey.printed_text &&
                arrayValuesForEachKey.printed_text.length > 1 &&
                !newAddingBalloon.printed_text) {

                let standartKeyboard = addBackButton(previousMenu, classicCircleBallonsKeyboard);
                let dynamicKeyboard = addPriceListKeyButtons(arrayValuesForEachKey.printed_text, "printed_text");

                console.log(arrayValuesForEachKey.made_in);
                bot.editMessageText(
                    '<a href="">Текст на шаре</a>' + `\n\nНужен ли вам идивидуальный напечатанный текст на воздушном шаре?`,
                    {
                        chat_id: chatId,
                        message_id: messageId,
                        reply_markup: concatButtons(dynamicKeyboard, standartKeyboard.inline_keyboard),
                        parse_mode: "HTML"
                    });
            } else if (arrayValuesForEachKey.made_in &&
                arrayValuesForEachKey.made_in.length > 1 &&
                !newAddingBalloon.made_in) {

                let standartKeyboard = addBackButton(previousMenu, classicCircleBallonsKeyboard);
                let dynamicKeyboard = addPriceListKeyButtons(arrayValuesForEachKey.made_in, "made_in");


                bot.editMessageText(
                    '<a href="">Обработка</a> \n\nПожалуйста укажите производителя? Китай - немного дешевле США но уступает покачеству.',
                    {
                        chat_id: chatId,
                        message_id: messageId,
                        reply_markup: concatButtons(dynamicKeyboard, standartKeyboard.inline_keyboard),
                        parse_mode: "HTML"
                    });
            } else {
                console.log('position price');

                //[{}] искать по массиву обьектов совпадения с обьектом {}
                //1 найти для ключа 1 создать массив
                //в массиве 1 найти ключи 2 создать массив 2
                //в
                // let newArray = [];
                // for (let key in newAddingBalloon){
                //     if (newAddingBalloon[key]) {
                //         for (let i = 0; i < category.length; i++) {
                //             if (category[i][key] === newAddingBalloon[key]) {
                //                 newArray = [].push(category[i])
                //             }
                //         }
                //     }
                // }
                let standartKeyboard = addBackButton(previousMenu, classicCircleBallonsKeyboard);
                console.log(filteredByConstructor.length);

                bot.editMessageText(
                    '<a href=""></a>' + ` ${makeString(filteredByConstructor)}`,
                    {
                        chat_id: chatId,
                        message_id: messageId,
                        reply_markup: standartKeyboard,
                        parse_mode: "HTML"
                    });

            }
        });
    }
});




bot.on("polling_error", (err) => console.log(err));

//подключение к дб
function dataBaseQuery(selector, dataBQ) {
    pool.query(selector, (err, res) => {

        try {
            dataBQ(res.rows);
            console.log("connected to database");
        } catch (e) {
            console.log(e);
        }

        if (err) {
            console.log(err);
        }
    });

}


//создание текста
function makeString(data) {
    console.log('function makeString');
    if (data[0]) {
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

        let selected = "\n<strong>🛎Подобранный шар:</strong> \n";
        let productInfo = "\n<strong>📋 Описание</strong> \n";

        let idBalloon = data[0].id_balloon ? `\n<strong>📝 Артикуль:</strong> №${data[0].id_balloon}\n` : ``;

        let material = data[0].material ? `Материал: ${data[0].material}, ` : ``;
        let formFactor = data[0].form_factor ? `Форма: ${data[0].form_factor}, ` : ``;
        let glue = data[0].glue ? `Обработка: ${data[0].glue}\n` : ``;
        let textureColor = data[0].texture_color ?`Текстура: ${data[0].texture_color}, ` : ``;
        let sizeInches = data[0].size_inches ? `Дюймов: ${data[0].size_inches}, ` : ``;
        let sizeSm = data[0].size_sm ? `Сантиметров: ${data[0].size_sm}, ` : ``;
        let innerAtribut = data[0].inner_atribut ? `Наполнитель: ${data[0].inner_atribut}, ` : ``;
        let printedText = data[0].printed_text ? `Свой текст: ${data[0].printed_text}, ` : ``;
        let madeIn = data[0].made_in ? `Произведено: ${data[0].made_in} ` : ``;

        let price = data[0].price ? `<strong>💵 Цена (1шт):</strong> ${data[0].price} рублей\n` : ``;

        // let color = data[0].color ? `<strong>Цвет:</strong> ${}\n` : ``;
        // let pieces = data[0].pieces ? `<strong>Количество:</strong> ${}\n` : ``;
        // let total = data[0].total ? `<strong>Сумма:</strong> ${} рублей\n` : ``;

        // for (let i = 0; i < data.length; i++) {
        //     let idBalloon = data[i].id_balloon >= 10 ? data[i].id_balloon : `${data[i].id_balloon}  `;
        //     let material = data[i].material;
        //     let formFactor = data[i].form_factor;
        //     let glue = data[i].glue ? 'да ' : 'нет';
        //     let textureColor = data[i].texture_color.length > 3 ? data[i].texture_color.slice(0, 3) : data[i].texture_color;
        //     let color = data[i].color;
        //     let sizeInches = data[i].size_inches;
        //     let sizeSm = data[i].size_sm;
        //     let innerAtribut = data[i].inner_atribut ? "да  " : "нет";
        //     let numberFoil = data[i].number_foil;
        //     let printedText = data[i].printed_text;
        //     let madeIn = data[i].made_in;
        //     let price = data[i].price >= 100 ? data[i].price : ` ${data[i].price} `;
        //
        //     catalog += `|  ${idBalloon} | ${glue} | ${textureColor}  | ${sizeInches} | ${sizeSm} |  ${innerAtribut} | ${price} |\n`;
        // }
        let textMessage = selected + productInfo +
            "("+material + formFactor + glue+textureColor + sizeInches+sizeSm + innerAtribut + printedText + madeIn +")" +
            idBalloon +
            price
            // color +
            // pieces +
            // total
        ;
        return textMessage;
    } else {
        console.log("error: data == false (function makeString)")
    }
}
