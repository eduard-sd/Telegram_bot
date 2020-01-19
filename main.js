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
const addItemInCart = keyboard.addItemInCart();

let photoList = [];
const adminChatID = '1875888';
let previousMenuList = [];
let previousMenu = '';
let arrayValuesForEachKey = [];
let currentCategory = '';

//Заполняем объект нового шара опрашивая клиента
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

let itemListInCart = []; //корзина - массив обьектов шара с количеством
let filteredByConstructor = []; //найденный по фильтру обьекты шаров
let filteredSelector = '';

//очистки обьекта шара, при переключении категории
function cleanNewAddingBalloon () {
    console.log('function cleanNewAddingBalloon');
    for (let i in newAddingBalloon){
        if (newAddingBalloon.hasOwnProperty(i)){
            delete newAddingBalloon[i];
        }
    }
}

//функций редактирования запроса к базе по фильтру - новому обьекту шара newAddingBalloon
function selectorBuilder(selector) {
    if (newAddingBalloon.size_inches) {
        let tempFilter = selector.slice(0, -20); //обрезаем шаблонный селектор к базе для дальнейшей подстановке параметров

        for (let i in newAddingBalloon) {
            if (newAddingBalloon.hasOwnProperty(i) && newAddingBalloon[i] !== 'null') {
                tempFilter += ` and ${i} IN ('${newAddingBalloon[i]}')`
            } else if (newAddingBalloon.hasOwnProperty(i) && newAddingBalloon[i] === 'null') {
                tempFilter += ` and ${i}`+' IS NULL'
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


//создание кнопок из ключей обьекта objectKey прайслиста и склеивание с основной клавиатурой customKeyboard
function addPriceListKeyButtons (objectValue, objectKey) {
    console.log('function addPriceListKeyButtons');

    let arrayButtons = [];
    let temp = [];

    for(let k = 0; k < objectValue.length; k++) {
        let data = '';
        if (objectValue[k] && typeof objectValue[k] === 'boolean' || objectValue[k] === 'true') {
            data = 'Да';
        } else if (!objectValue[k] && typeof objectValue[k] === 'boolean' || objectValue[k] === 'false') {
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
        {reply_markup: keyboardBalloons}
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

    return element;
};


//функция добавления предыдущей вкладки меню в лист
function checkAndPush(data) {
    // console.log("--------------");
    if (previousMenuList[previousMenuList.length-1] !== data && previousMenu !== data) {
        previousMenuList.push(data)
    }
    // console.log("[list]", previousMenuList);
    // console.log("[last]", previousMenu);
    // console.log("--------------");
}


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
            '<a href="https://res.cloudinary.com/sharolandiya/image/upload/v1579467751/TelegramBotSharoladya/%D0%93%D1%80%D1%83%D0%BF%D0%BF%D0%B0_1%D0%B0-light_fwbv3n.png">Шароландия</a>' + `\n${chatOpponent}, добро пожаловать к вашим услугам каталог и личный кабинет приятных покупок!`,
            {
                reply_markup: keyboardBalloons,
                parse_mode: "HTML"
            }
        );
        checkAndPush("Шары 🎈");

    } else if (msg.text.toString() === "Торты 🎂") {

    } else if (msg.text.toString() === "Отмена") {
        bot.sendMessage(
            chatId,
            `${chatOpponent}, вы нажали "отмена"`,
            {reply_markup: keyboardDefault}
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
    const chatValue = msg.message.chat;
    const chatId = chatValue.id;
    const chatOpponent = chatValue.first_name ? chatValue.first_name : "Дорогой клиент";
    const messageId = msg.message.message_id;
    let answer = msg.data.toString();


    // bot.sendMessage(chatId,
    //     `${msg.data} -------- callbackquery кнопка`,
    //     {reply_markup: {}});

    //если приходит колбек назад запускаю метод поп и меняю колбек

    if (answer === '⬅ Назад') {
        if (previousMenuList.length >= 2) {
            previousMenuList.pop();

            if (previousMenuList[previousMenuList.length-1] === 'Фольги-нные шары, фигуры опрос') {
                previousMenuList.pop();
            } else if (previousMenuList[previousMenuList.length-1] === 'Воздушные шары опрос') {
                previousMenuList.pop();
            }

            answer = previousMenuList[previousMenuList.length-1];
            previousMenu = answer;
        } else {
            answer = 'Шары 🎈';
        }
    }

    //опрашиваем клиента что он хочет от воздушного шара
    //запоняем обьект нового шара параметрами
    let interviewAnswer = msg.data.toString().split('.');
    if (interviewAnswer[1] && interviewAnswer[2]) {
        newAddingBalloon[interviewAnswer[1]] = interviewAnswer[2];
        // console.log(newAddingBalloon[interviewAnswer[1]],'----- in to object')
    }


    if (answer === "Шары 🎈") {
        bot.editMessageText(
            '<a href="https://res.cloudinary.com/sharolandiya/image/upload/v1571498410/TelegramBotSharoladya/sharolandiay_noxiev.png">Шароландия</a>' + `\n${chatOpponent}, вы нажали шары вводная общая информация о услугам`,
            {
                chat_id: chatId,
                message_id: messageId,
                reply_markup: keyboardBalloons,
                parse_mode: "HTML"
            });
        checkAndPush("Шары 🎈");

    } else if (answer === "Каталог и цены 🎁") {
        bot.editMessageText(
            '<a href="https://res.cloudinary.com/sharolandiya/image/upload/v1571502686/TelegramBotSharoladya/catalog_ktpfa6.png">Каталог и цены 🎁</a> \n' + `${chatOpponent}, вы открыли каталог и цены`+' \n\nАкция! 📣\nОформи заказ с помощью бота 🤖 и получите бонусы спасибо. \nЗа каждые потраченные 10₽ начислим 1 балл.\n1 балл = 1 рублю 💸\n\n🔺В акции не участвует услуга «цена по фото».',
            {
                chat_id: chatId,
                message_id: messageId,
                reply_markup: priceListKeyboard,
                parse_mode: "HTML"
            });
        checkAndPush("Каталог и цены 🎁");

    } else if (answer === "Цена по фото 📸") {
        bot.editMessageText(
            `${chatOpponent}` + ', пожалуйста прикрепите к сообщению понравившиеся фотографии или композиции, и нажмите отправить. \n\n📲 С вами свяжется специалит для дальнейшей консультаци по стоимости. \n\n⏱ Примерное время ответа ответа 30 минут.',
            {
                chat_id: chatId,
                message_id: messageId,
                reply_markup: getPriceFromPhotoKeyboard
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
        checkAndPush("Цена по фото 📸");

    } else if (answer === "Вопросы ❓") {
        bot.editMessageText(
            'Вопросы и ответы',
            {
                chat_id: chatId,
                message_id: messageId,
                reply_markup: faqKeyboard
            });
        checkAndPush("Вопросы ❓");

    } else if (answer === "Как заказать ❓") {
        bot.editMessageText(
            'Как заказать ❓',
            {
                chat_id: chatId,
                message_id: messageId,
                reply_markup: faqKeyboard
            });
        checkAndPush("Как заказать ❓");

    } else if (answer === "Доставка 🚚") {
        bot.editMessageText(
            'Доставка 🚚',
            {
                chat_id: chatId,
                message_id: messageId,
                reply_markup: faqKeyboard
            });
        checkAndPush("Доставка 🚚");

    } else if (answer === "Адреса") {
        bot.editMessageText(
            'Адреса',
            {
                chat_id: chatId,
                message_id: messageId,
                reply_markup: faqKeyboard
            });
        checkAndPush("Адреса");

    } else if (answer === "Гарантии 👍") {
        bot.editMessageText(
            'Гарантии 👍',
            {
                chat_id: chatId,
                message_id: messageId,
                reply_markup: faqKeyboard
            });
        checkAndPush("Гарантии 👍");

    } else if (answer === "Корзина 📦") {
        let tempStr = ''
        let items = itemListInCart.forEach(i => {tempStr + makeString(i) +'/n'});
        console.log(items);
        if (itemListInCart.length >= 1) {
            bot.editMessageText(
                'Список товаров в корзине:',
                {
                    chat_id: chatId,
                    message_id: messageId,
                    reply_markup: cartKeyboard
                });
        } else {
            bot.editMessageText(
                'Ваша корзина пока пуста',
                {
                    chat_id: chatId,
                    message_id: messageId,
                    reply_markup: cartKeyboard
                });
        }
        checkAndPush("Корзина 📦");

    } else if (answer === "Мой кабинет 💼") {
        bot.editMessageText(
            `Мой кабинет`,
            {
                chat_id: chatId,
                message_id: messageId,
                reply_markup: profileKeyboard
            });
        checkAndPush("Мой кабинет 💼");

    } else if (answer === "Воздушные шары") {
        bot.editMessageText(
            '<a href="https://res.cloudinary.com/sharolandiya/image/upload/v1571502015/TelegramBotSharoladya/classic_exqdvy.png">Воздушные шары</a>' + `\n${chatOpponent}, вы открыли каталог классических воздушных шаров`,
            {
                chat_id: chatId,
                message_id: messageId,
                reply_markup: classicBallonsKeyboard,
                parse_mode: "HTML"
            });
        checkAndPush("Воздушные шары");

    } else if (answer === "Фольги-нные шары, фигуры") {
        bot.editMessageText(
            '<a href="https://res.cloudinary.com/sharolandiya/image/upload/v1571501721/TelegramBotSharoladya/foil_rhy8vw.png">Фольгированные шары, фигуры</a>' + `\n${chatOpponent}, вы открыли каталог фольгированных шаров`,
            {
                chat_id: chatId,
                message_id: messageId,
                reply_markup: foilBallonsKeyboard,
                parse_mode: "HTML"
            });

        checkAndPush("Фольги-нные шары, фигуры");

    } else if (answer === "Фигуры") {
        cleanNewAddingBalloon();
        currentCategory = figureFlyFoilFilter;
        interview();
        checkAndPush("Фольги-нные шары, фигуры опрос");

    } else if (answer === "Цифры") {
        cleanNewAddingBalloon();
        currentCategory = numberFoilFilter;
        interview();
        checkAndPush("Фольги-нные шары, фигуры опрос");


    } else if (answer === "Фольга с рисунком") {
        cleanNewAddingBalloon();
        currentCategory = paintedFoilFilter;
        interview();
        checkAndPush("Фольги-нные шары, фигуры опрос");

    } else if (answer === "Фольга без рисунка") {
        cleanNewAddingBalloon();
        currentCategory = cleanFoilFilter;
        interview();
        checkAndPush("Фольги-нные шары, фигуры опрос");

    } else if (answer === "Буквы") {
        cleanNewAddingBalloon();
        currentCategory = letterFoilFilter;
        interview();
        checkAndPush("Фольги-нные шары, фигуры опрос");

    } else if (answer === "Ходилки") {
        cleanNewAddingBalloon();
        currentCategory = floorMoveFoilFilter;
        interview();
        checkAndPush("Фольги-нные шары, фигуры опрос");

    } else if (answer === "Круглые шары") {
        cleanNewAddingBalloon();
        currentCategory = classicFilter;
        interview();
        checkAndPush("Воздушные шары опрос");

    } else if (answer === "Шары для моделирования") {
        cleanNewAddingBalloon();
        currentCategory = modelBalloonFilter;
        interview();
        checkAndPush("Воздушные шары опрос");

    } else if (answer === "Сердца") {
        cleanNewAddingBalloon();
        currentCategory = heartFilter;
        interview();
        checkAndPush("Воздушные шары опрос");

    } else if (answer === "Большие шары") {
        cleanNewAddingBalloon();
        currentCategory = bigSizeFilter;
        interview();
        checkAndPush("Воздушные шары опрос");

    } else if (answer === "Сферы Баблс") {
        cleanNewAddingBalloon();
        currentCategory = babblesFilter;
        interview();
        checkAndPush("Воздушные шары опрос");

    } else if (answer === "Шары с рисунком") {
        cleanNewAddingBalloon();
        currentCategory = withPaintFilter;
        interview();
        checkAndPush("Воздушные шары опрос");

    } else if (interviewAnswer[0] === "опрос") {
        interview();

    } else if (interviewAnswer[0] === "Добавить в корзину ➕") {
        itemListInCart.push(newAddingBalloon);
    }




    //опрос покупателя по часто повторяющимся справшиваемым вопросам по шарам
    // с динамической генерацией клавиатуры и вопросов в зависимости от категории
    function interview() {
        console.log('function interview');

        filteredSelector = selectorBuilder(currentCategory);//отправить объект нового шара для выборки
        // console.log(filteredSelector);
        dataBaseQuery(filteredSelector, function (result) {
            filteredByConstructor = result.slice();
            // console.log(filteredByConstructor);
            arrayValuesForEachKey = arrayFromPriceListKeys(filteredByConstructor);

            if (arrayValuesForEachKey.size_inches &&
                arrayValuesForEachKey.size_inches.length > 1 &&
                !newAddingBalloon.size_inches) {
                let dynamicKeyboard = addPriceListKeyButtons(arrayValuesForEachKey.size_inches, "size_inches");
                let fotoLink = '';
                if (currentCategory.includes('фольгированные')) {
                    fotoLink = '<a href="https://res.cloudinary.com/sharolandiya/image/upload/v1579445428/TelegramBotSharoladya/foil-size_rmwkjw.jpg">Размеры шаров</a>';
                } else if (currentCategory.includes('шар для моделирования')) {
                    fotoLink ='<a href="https://res.cloudinary.com/sharolandiya/image/upload/v1579445429/TelegramBotSharoladya/SHDM-size_vckam7.jpg">Размеры шаров</a>';
                } else {
                    fotoLink ='<a href="https://res.cloudinary.com/sharolandiya/image/upload/v1579445429/TelegramBotSharoladya/razmery_sharov-1_d55lpj.jpg">Размеры шаров</a>';
                }

                bot.editMessageText(
                    `${fotoLink}`+' \n\nКакого размера вам нужен шар?',
                    {
                        chat_id: chatId,
                        message_id: messageId,
                        reply_markup: concatButtons(dynamicKeyboard, classicCircleBallonsKeyboard.inline_keyboard),
                        parse_mode: "HTML"
                    });
            } else if (arrayValuesForEachKey.texture_color &&
                arrayValuesForEachKey.texture_color.length > 1 &&
                !newAddingBalloon.texture_color) {

                let dynamicKeyboard = addPriceListKeyButtons(arrayValuesForEachKey.texture_color, "texture_color");

                bot.editMessageText(
                    '<a href="https://res.cloudinary.com/sharolandiya/image/upload/v1579467186/TelegramBotSharoladya/texture_mafizy.png">Окрас шаров</a> \n\nВарианты текстур воздушных шаров:\nагат, \nметалик, \nхром, \nпастель, \nпрозрачный \n\nКакая текстура вам нужна?',
                    {
                        chat_id: chatId,
                        message_id: messageId,
                        reply_markup: concatButtons(dynamicKeyboard, classicCircleBallonsKeyboard.inline_keyboard),
                        parse_mode: "HTML"
                    });
            } else if (arrayValuesForEachKey.glue &&
                arrayValuesForEachKey.glue.length > 1 &&
                !newAddingBalloon.glue) {

                let dynamicKeyboard = addPriceListKeyButtons(arrayValuesForEachKey.glue, "glue");

                bot.editMessageText(
                    '<a href="https://res.cloudinary.com/sharolandiya/image/upload/v1579445430/TelegramBotSharoladya/glue_myv5zw.jpg">Время полета</a> \n\nСколько вы хотите чтоб летал ваш шарик? \nдо 10-12 часов  👉  Нет \nдо 3-7 дней  👉  Да\n',
                    {
                        chat_id: chatId,
                        message_id: messageId,
                        reply_markup: concatButtons(dynamicKeyboard, classicCircleBallonsKeyboard.inline_keyboard),
                        parse_mode: "HTML"
                    });
            } else if (arrayValuesForEachKey.inner_atribut &&
                arrayValuesForEachKey.inner_atribut.length > 1 &&
                !newAddingBalloon.inner_atribut) {

                let dynamicKeyboard = addPriceListKeyButtons(arrayValuesForEachKey.inner_atribut, "inner_atribut");

                bot.editMessageText(
                    '<a href="https://res.cloudinary.com/sharolandiya/image/upload/v1579466933/TelegramBotSharoladya/inner-atribut_ezhs29.png">Наполнитель</a> \n\nВы можете дополнить ваш шарик: \n🎊конфетти, \n🕊искусственными перьями, \n✨светодиодами. \n\nУкажите наполнитель?',
                    {
                        chat_id: chatId,
                        message_id: messageId,
                        reply_markup: concatButtons(dynamicKeyboard, classicCircleBallonsKeyboard.inline_keyboard),
                        parse_mode: "HTML"
                    });
            } else if (arrayValuesForEachKey.printed_text &&
                arrayValuesForEachKey.printed_text.length > 1 &&
                !newAddingBalloon.printed_text) {

                let dynamicKeyboard = addPriceListKeyButtons(arrayValuesForEachKey.printed_text, "printed_text");


                bot.editMessageText(
                    '<a href="https://res.cloudinary.com/sharolandiya/image/upload/v1579452458/TelegramBotSharoladya/balloon-with-text_1_xrjkzj.png">Текст на шаре</a>' + `\n\nНужен ли вам свой текст на воздушном шаре?✏️`,
                    {
                        chat_id: chatId,
                        message_id: messageId,
                        reply_markup: concatButtons(dynamicKeyboard, classicCircleBallonsKeyboard.inline_keyboard),
                        parse_mode: "HTML"
                    });
            } else if (arrayValuesForEachKey.made_in &&
                arrayValuesForEachKey.made_in.length > 1 &&
                !newAddingBalloon.made_in) {

                let dynamicKeyboard = addPriceListKeyButtons(arrayValuesForEachKey.made_in, "made_in");

                bot.editMessageText(
                    '<a href="">Обработка</a> \n\nВыберите производителя? Китай - немного дешевле США но уступает покачеству.',
                    {
                        chat_id: chatId,
                        message_id: messageId,
                        reply_markup: concatButtons(dynamicKeyboard, classicCircleBallonsKeyboard.inline_keyboard),
                        parse_mode: "HTML"
                    });
            } else {
                // console.log('filtered positions = ',filteredByConstructor.length);

                bot.editMessageText(
                    '<a href=""></a>' + ` ${makeString(filteredByConstructor)}`,
                    {
                        chat_id: chatId,
                        message_id: messageId,
                        reply_markup: addItemInCart,
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
        let glue = data[0].glue === 'true' ? `Обработка: да, ` : `Обработка: нет, `;
        let textureColor = data[0].texture_color ?`Текстура: ${data[0].texture_color}, ` : ``;
        let sizeInches = data[0].size_inches ? `Дюймов: ${data[0].size_inches}, ` : ``;
        let sizeSm = data[0].size_sm ? `Сантиметров: ${data[0].size_sm}, ` : ``;
        let innerAtribut = data[0].inner_atribut === null ? `Наполнитель: нет, ` : `Наполнитель: ${data[0].inner_atribut}, `;
        let printedText = data[0].printed_text === 'true' ? `Свой текст: да, ` : `Свой текст: нет, `;
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






