const TelegramBot = require('node-telegram-bot-api');
const TOKEN = "869793649:AAE8dpx4Ek7y3v2bShrGTvp55G2Gw49iwho";
const bot = new TelegramBot(TOKEN, {polling: true});
const keyboard = require('./keyboard/inlineKeyboard');
const pool = require('./connectDB').pgPool;
const cTable = require('console.table');

const keyboardDefault = keyboard.keyboardDefault();
const sendVCard = keyboard.sendVCard();
const keyboardBalloons = keyboard.keyboardBalloons();
const priceListKeyboard = keyboard.priceListKeyboard();
const classicBalloonsKeyboard = keyboard.classicBalloonsKeyboard();
const classicCircleBalloonsKeyboard = keyboard.classicCircleBalloonsKeyboard();
const foilBalloonsKeyboard = keyboard.foilBalloonsKeyboard();
const getPriceFromPhotoKeyboard = keyboard.getPriceFromPhotoKeyboard();
const faqKeyboard = keyboard.faqKeyboard();
const cartKeyboard = keyboard.cartKeyboard();
const profileKeyboard = keyboard.profileKeyboard();
const addItemInCart = keyboard.addItemInCart();
const colorsList = keyboard.colorsList();
const agatColorsKeyboard = keyboard.agatColorsKeyboard();
const chromColorsKeyboard = keyboard.chromColorsKeyboard();
const metalicColorsKeyboard = keyboard.metalicColorsKeyboard();
const pastelColorsKeyboard = keyboard.pastelColorsKeyboard();



//'+`${imageLinks.balloonWithTextImg}`+'
const imageLinks = {
    mainMenuImg: '<a href="https://res.cloudinary.com/sharolandiya/image/upload/v1579467751/TelegramBotSharoladya/%D0%93%D1%80%D1%83%D0%BF%D0%BF%D0%B0_1%D0%B0-light_fwbv3n.png">Шароландия</a>',
    priceListImg: '<a href="https://res.cloudinary.com/sharolandiya/image/upload/v1579638704/TelegramBotSharoladya/catalog_ydggjb.png">Каталог и цены 🎁</a>',
    classicBalloonsImg: '<a href="https://res.cloudinary.com/sharolandiya/image/upload/v1579638705/TelegramBotSharoladya/classic_o9nta7.png">Воздушные шары</a>',
    foilBalloonsImg: '<a href="https://res.cloudinary.com/sharolandiya/image/upload/v1579638705/TelegramBotSharoladya/foil_eplatq.png">Фольгированные шары, фигуры</a>',
    foilSizeImg: '<a href="https://res.cloudinary.com/sharolandiya/image/upload/v1579445428/TelegramBotSharoladya/foil-size_rmwkjw.jpg">Размеры шаров</a>',
    shdmSizeImg: '<a href="https://res.cloudinary.com/sharolandiya/image/upload/v1579445429/TelegramBotSharoladya/SHDM-size_vckam7.jpg">Размеры шаров</a>',
    classicBalloonsSizeImg: '<a href="https://res.cloudinary.com/sharolandiya/image/upload/v1579445429/TelegramBotSharoladya/razmery_sharov-1_d55lpj.jpg">Размеры шаров</a>',
    textureColorImg: '<a href="https://res.cloudinary.com/sharolandiya/image/upload/v1579467186/TelegramBotSharoladya/texture_mafizy.png">Окрас шаров</a>',
    glueImg: '<a href="https://res.cloudinary.com/sharolandiya/image/upload/v1579445430/TelegramBotSharoladya/glue_myv5zw.jpg">Время полета</a>',
    innerAttributImg: '<a href="https://res.cloudinary.com/sharolandiya/image/upload/v1579466933/TelegramBotSharoladya/inner-atribut_ezhs29.png">Наполнитель</a>',
    balloonWithTextImg: '<a href="https://res.cloudinary.com/sharolandiya/image/upload/v1579452458/TelegramBotSharoladya/balloon-with-text_1_xrjkzj.png">Текст на шаре</a>',
    agatColorImg: '<a href="https://res.cloudinary.com/sharolandiya/image/upload/v1579984086/TelegramBotSharoladya/agat_color_thpxen.png">Палитра агат</a>',
    pastelColorImg: '<a href="https://res.cloudinary.com/sharolandiya/image/upload/v1579984086/TelegramBotSharoladya/pastel_color_pspppo.png">Палитра</a>',
    chromColorImg: '<a href="https://res.cloudinary.com/sharolandiya/image/upload/v1579984086/TelegramBotSharoladya/chrom_color_t2ojho.png">Палитра хром</a>',
    metalicColorImg: '<a href="https://res.cloudinary.com/sharolandiya/image/upload/v1579984086/TelegramBotSharoladya/metalic_color_na5ufe.png">Палитра металик</a>',
    foilFormWithPainImg: '<a href="https://res.cloudinary.com/sharolandiya/image/upload/v1580057526/TelegramBotSharoladya/foil_form_with_pain_zmhj6d.png">Форма шаров с рисунком</a>',
    foilFormImg: '<a href="https://res.cloudinary.com/sharolandiya/image/upload/v1580056744/TelegramBotSharoladya/foil_form_without_pain_obcx82.png">Форма шаров без рисунком</a>',

};
const socialLinks = {
    vk:{
        name: 'VKontakte: ',
        link:''
    },
    inst:{
        name: 'Instagram: ',
        link: '<a href="https://www.instagram.com/sharolandiya_kzn/">sharolandiya_kzn</a>'
    },
}

let photoList = [];
const adminChatID = '1875888';
let previousMenuList = [];
let previousMenu = '';
let arrayValuesForEachKey = [];
let currentCategory = '';

//Заполняем объект нового шара опрашивая клиента, используется для определения какие вопросы задавать
let newAddingBalloon = {
    glue: '',
    texture_color: '',
    size_inches: '',
    inner_atribut: '',
    printed_text: '',
    form_factor: '',
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




//склеивание кнопок в клавиатуру
function concatButtons (fistkeyboard, secondkeyboard) {
    return {inline_keyboard: fistkeyboard.concat(secondkeyboard)};
}


//создание кнопок из масива значений objectValue, для склеивания с основной клавиатурой customKeyboard
//objectValue - массив значений по ключу
//objectKey - ключ
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
        form_factor: [],
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


//функция добавления предыдущей вкладки меню в лист истории
function checkAndPush(data) {
    // console.log("--------------");
    if (previousMenuList[previousMenuList.length-1] !== data && previousMenu !== data) {
        previousMenuList.push(data)
    }
    console.log("[list]", previousMenuList);
    console.log("[last]", previousMenu);
    console.log("--------------");
}

bot.on('text', (msg) => {
    const chatValue = msg.chat;
    const chatId = msg.chat.id;
    const chatOpponent = chatValue.first_name ? chatValue.first_name : "Дорогой клиент";

    if (msg.text.toString() === "/start" || msg.text.toString() === "start") {
        bot.sendMessage(
            chatId,
            `${chatOpponent}, добрый день! Вас приветсвует автоматичекский помошник в подготовке праздников. Прошу сделать выбор, что вас интересует?`,
            {reply_markup: keyboardDefault}
        )
    }

    if (msg.text.toString() === "Шары 🎈" || msg.text.toString() === "🎈" || msg.text.toString() === "/balloons" || msg.text.toString() === "Шары") {
        bot.sendMessage(
            chatId,
            `${imageLinks.mainMenuImg}\n${chatOpponent}, добро пожаловать к вашим услугам каталог для ознакомления с ценами. Здесь вы можете узнать сколько будет стоить конктретный шарик, выбрав его по параметрам или прислав нам фото композиции для подсчета стоимости. Приятных покупок!`,
            {
                reply_markup: keyboardBalloons,
                parse_mode: "HTML"
            }
        );
        checkAndPush("Шары 🎈");

    } else if (msg.text.toString() === "Соц сети 👤" || msg.text.toString() === "👤" || msg.text.toString() === "Соц сети" || msg.text.toString() === "/socialnets") {
        bot.sendMessage(
            chatId,
            `${imageLinks.mainMenuImg}\n${chatOpponent}, добро пожаловать, заходите так же к нам в социальных сетях!` +
            `\n${socialLinks.inst.name} ${socialLinks.inst.link}` +
            `\n${socialLinks.vk.name} ${socialLinks.vk.link}`,
            {
                reply_markup: keyboardBalloons,
                parse_mode: "HTML"
            }
        );
        checkAndPush("Шары 🎈");

    } else if (msg.text.toString() === "Отмена") {
        bot.sendMessage(
            chatId,
            `${chatOpponent}, вы нажали "отмена"`,
            {reply_markup: keyboardDefault}
        );
    } else {
        console.log('Wrong type of message')
        bot.sendMessage(
            chatId,
            `${chatOpponent}, к сожалению в моей базе данных нет доступных команд по вашему слову `+`${msg.text.toString()}`+' \n\nВарианты доступных текстовых команд:\nstart \nШары 🎈 \nСоц сети 👤',
            {reply_markup: keyboardDefault}
        );
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
    // if (newAddingBalloon.hasOwnProperty(interviewAnswer[1]) && interviewAnswer[1] && interviewAnswer[2]) {
    if (interviewAnswer[1] && interviewAnswer[2]) {
        newAddingBalloon[interviewAnswer[1]] = interviewAnswer[2];
        // console.log(newAddingBalloon[interviewAnswer[1]],'----- in to object')
    }


    if (answer === "Шары 🎈") {
        bot.editMessageText(
            '<a href='+`${imageLinks.mainMenuImg}`+'>Шароландия</a>' + `\n${chatOpponent}, вы нажали шары вводная общая информация о услугам`,
            {
                chat_id: chatId,
                message_id: messageId,
                reply_markup: keyboardBalloons,
                parse_mode: "HTML"
            });
        checkAndPush("Шары 🎈");

    } else if (answer === "Каталог и цены 🎁") {
        bot.editMessageText(
            `${imageLinks.priceListImg}\n${chatOpponent}, вы открыли каталог и цены`+' \n\nАкция! 📣\nОформи заказ с помощью бота 🤖 и получите бонусы спасибо. \nЗа каждые потраченные 10₽ начислим 1 балл.\n1 балл = 1 рублю 💸\n\n🔺В акции не участвует услуга «цена по фото».',
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
            'Доставка 🚚\n' +
            '\nДоставка воздушных шаров осуществляется ежедневно и круглосуточно. Минимальная сумма заказа - 1000 руб. (без учета стоимости доставки).\n' +
            'С 9.00 до 22.00 стоимость доставки в г. Казани - 250 рублей.\n' +
            '\nДоставка до пункта выдачи по одному из адресов осуществляется - бесплатно' +
            '\n🎯Казань ​ул. ​Солдатская д.8​, 402 офис, БЦ На Солдатской' +
            '\n🎯Казань ул. Ямашева д.103​, пункт выдачи' +
            '\n🎯Казань ул. ​Альберта Камалеева д.28​, пункт выдачи' +
            '\n\nМы доставляем шары в часовом интервале от вашего времени, т.е. если заказываете шары к определенному времени то от этого времени + - 30 мин. ',
            {
                chat_id: chatId,
                message_id: messageId,
                reply_markup: faqKeyboard
            });
        checkAndPush("Доставка 🚚");

    } else if (answer === "Адреса") {
        bot.editMessageText(
            'Список адресов пунктов выдачи воздушных шаров: \n' +
            '\n🎯Казань ​ул. ​Солдатская д.8​, 402 офис, БЦ На Солдатской ' +
            '\n🎯Казань ул. Ямашева д.103​, пункт выдачи ' +
            '\n🎯Казань ул. ​Альберта Камалеева д.28​, пункт выдачи ' +
            '\n\n📲 8(917)870-83-70',
            {
                chat_id: chatId,
                message_id: messageId,
                reply_markup: faqKeyboard
            });
        checkAndPush("Адреса");

    } else if (answer === "Гарантии 👍") {
        bot.editMessageText(
            'Гарантии 👍 \n\nЕсли по каким-либо причинам Вы остались недовольны исполнением Вашего заказа, мы произведем повторную доставку или вернем деньги.\n' +
            '\nГарантия на полет воздушных шаров с гелием 3 дня (72 часа) с момента получения заказа. Гарантия распространяется на латексные, фольгированные и светящиея шарики с гелием.\n' +
            '\nГарантийные случаи\n' +
            '\nЕсли до истечения гарантийного срока ( 3 дня с момента получения ) Вы обнаружите, что более 10% воздушных шаров сдулись или потеряли более 50% объема от первоначального, то есть сдулись, то Вам необходимо сделать фото шаров и прислать нам в Telegram по телефону: +7(967)367‒71‒97\n' +
            '\n' +
            'Мы постараемся максимально быстро в течение 24 часов заменить воздушные шары на новые или вернуть денежные средства как удобнее заказчику.\n' +
            '\n' +
            'Негарантийные случаи\n' +
            '\n' +
            'Гарантия на воздушные шары не распространяется, если сдутие шаров произошло по вине клиента - по причине механического или прокола, а так же хранение на холоде, оптимальная температура от 20 до 23 градусов. Просим Вас быть осторожными, шарики требуют бережного обращения.',
            {
                chat_id: chatId,
                message_id: messageId,
                reply_markup: faqKeyboard
            });
        checkAndPush("Гарантии 👍");

    } else if (answer === "Корзина 📦") {
        let tempStr = '';
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
            `${imageLinks.classicBalloonsImg}\n${chatOpponent}, вы открыли каталог классических воздушных шаров`,
            {
                chat_id: chatId,
                message_id: messageId,
                reply_markup: classicBalloonsKeyboard,
                parse_mode: "HTML"
            });
        checkAndPush("Воздушные шары");

    } else if (answer === "Фольги-нные шары, фигуры") {
        bot.editMessageText(
            `${imageLinks.foilBalloonsImg}\n${chatOpponent}, вы открыли каталог фольгированных шаров`,
            {
                chat_id: chatId,
                message_id: messageId,
                reply_markup: foilBalloonsKeyboard,
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
        console.log(interviewAnswer);
        interview();

    } else if (interviewAnswer[0] === "Добавить в корзину ➕") {
        itemListInCart.push(newAddingBalloon);
    }


    //опрос покупателя по часто повторяющимся справшиваемым вопросам по шарам
    // с динамической генерацией клавиатуры и вопросов в зависимости от категории
    function interview() {
        console.log('function interview');
        console.log(!newAddingBalloon.color);

        filteredSelector = selectorBuilder(currentCategory);//отправить объект нового шара для выборки
        console.log(filteredSelector);
        dataBaseQuery(filteredSelector, function (result) {
            filteredByConstructor = result.slice();
            console.log(filteredByConstructor);
            arrayValuesForEachKey = arrayFromPriceListKeys(filteredByConstructor);

            if (arrayValuesForEachKey.size_inches &&
                arrayValuesForEachKey.size_inches.length > 1 &&
                !newAddingBalloon.size_inches) {
                let dynamicKeyboard = addPriceListKeyButtons(arrayValuesForEachKey.size_inches, "size_inches");
                let fotoLink = '';
                if (currentCategory.includes('фольгированные')) {
                    fotoLink = imageLinks.foilSizeImg;
                } else if (currentCategory.includes('шар для моделирования')) {
                    fotoLink = imageLinks.shdmSizeImg;
                } else {
                    fotoLink = imageLinks.classicBalloonsSizeImg;
                }

                bot.editMessageText(
                    `${fotoLink} \n\nКакого размера вам нужен шар?`,
                    {
                        chat_id: chatId,
                        message_id: messageId,
                        reply_markup: concatButtons(dynamicKeyboard, classicCircleBalloonsKeyboard.inline_keyboard),
                        parse_mode: "HTML"
                    });
            } else if (arrayValuesForEachKey.texture_color &&
                arrayValuesForEachKey.texture_color.length > 1 &&
                !newAddingBalloon.texture_color) {

                let dynamicKeyboard = addPriceListKeyButtons(arrayValuesForEachKey.texture_color, "texture_color");

                bot.editMessageText(
                    `${imageLinks.textureColorImg} \n\nВарианты текстур воздушных шаров:\nагат, \nметалик, \nхром, \nпастель, \nпрозрачный \n\nКакая текстура вам нужна?`,
                    {
                        chat_id: chatId,
                        message_id: messageId,
                        reply_markup: concatButtons(dynamicKeyboard, classicCircleBalloonsKeyboard.inline_keyboard),
                        parse_mode: "HTML"
                    });
            } else if (arrayValuesForEachKey.glue &&
                arrayValuesForEachKey.glue.length > 1 &&
                !newAddingBalloon.glue) {

                let dynamicKeyboard = addPriceListKeyButtons(arrayValuesForEachKey.glue, "glue");

                bot.editMessageText(
                    `${imageLinks.glueImg} \n\nСколько вы хотите чтоб летал ваш шарик? \nдо 10-12 часов  👉  Нет \nдо 3-7 дней  👉  Да\n`,
                    {
                        chat_id: chatId,
                        message_id: messageId,
                        reply_markup: concatButtons(dynamicKeyboard, classicCircleBalloonsKeyboard.inline_keyboard),
                        parse_mode: "HTML"
                    });
            } else if (arrayValuesForEachKey.inner_atribut &&
                arrayValuesForEachKey.inner_atribut.length > 1 &&
                !newAddingBalloon.inner_atribut) {

                let dynamicKeyboard = addPriceListKeyButtons(arrayValuesForEachKey.inner_atribut, "inner_atribut");

                bot.editMessageText(
                    `${imageLinks.innerAttributImg} \n\nВы можете дополнить ваш шарик: \n🎊конфетти, \n🕊искусственными перьями, \n✨светодиодами. \n\nУкажите наполнитель?`,
                    {
                        chat_id: chatId,
                        message_id: messageId,
                        reply_markup: concatButtons(dynamicKeyboard, classicCircleBalloonsKeyboard.inline_keyboard),
                        parse_mode: "HTML"
                    });
            } else if (arrayValuesForEachKey.printed_text &&
                arrayValuesForEachKey.printed_text.length > 1 &&
                !newAddingBalloon.printed_text) {

                let dynamicKeyboard = addPriceListKeyButtons(arrayValuesForEachKey.printed_text, "printed_text");


                bot.editMessageText(
                    `${imageLinks.balloonWithTextImg}\n\nНужен ли вам свой текст на воздушном шаре?✏️`,
                    {
                        chat_id: chatId,
                        message_id: messageId,
                        reply_markup: concatButtons(dynamicKeyboard, classicCircleBalloonsKeyboard.inline_keyboard),
                        parse_mode: "HTML"
                    });
            } else if (arrayValuesForEachKey.form_factor &&
                arrayValuesForEachKey.form_factor.length > 1 &&
                !newAddingBalloon.form_factor) {

                let fotoLink = '';
                let dynamicKeyboard = addPriceListKeyButtons(arrayValuesForEachKey.form_factor, "form_factor");
                if (currentCategory.includes('звезда с рисунком') ||
                    currentCategory.includes('сердце с рисунком') ||
                    currentCategory.includes('круг с рисунком')) {
                    fotoLink = imageLinks.foilFormWithPainImg;
                } else {
                    fotoLink = imageLinks.foilFormImg;
                }

                bot.editMessageText(
                    `${fotoLink} \n\nВыберите форму шара?`,
                    {
                        chat_id: chatId,
                        message_id: messageId,
                        reply_markup: concatButtons(dynamicKeyboard, classicCircleBalloonsKeyboard.inline_keyboard),
                        parse_mode: "HTML"
                    });
            } else if (arrayValuesForEachKey.made_in &&
                arrayValuesForEachKey.made_in.length > 1 &&
                !newAddingBalloon.made_in) {

                let dynamicKeyboard = addPriceListKeyButtons(arrayValuesForEachKey.made_in, "made_in");

                bot.editMessageText(
                    '<a href="">Производитель</a> \n\nВыберите производителя? Китай - немного дешевле США но уступает покачеству.',
                    {
                        chat_id: chatId,
                        message_id: messageId,
                        reply_markup: concatButtons(dynamicKeyboard, classicCircleBalloonsKeyboard.inline_keyboard),
                        parse_mode: "HTML"
                    });
            } else if (filteredByConstructor.length === 1 && interviewAnswer[1] !== 'выбрать-цвет') {

                bot.editMessageText(
                    '<a href=""></a>' + ` ${makeString(filteredByConstructor)}`,
                    {
                        chat_id: chatId,
                        message_id: messageId,
                        reply_markup: colorsList,
                        parse_mode: "HTML"
                    });

            } else if (filteredByConstructor.length === 1 && interviewAnswer[1] === 'выбрать-цвет') {
                let fotoLink = '';
                let dynamicKeyboard;

                if (newAddingBalloon.texture_color === 'агат') {
                    fotoLink = imageLinks.agatColorImg;
                    // dynamicKeyboard = agatColorsKeyboard.inline_keyboard;
                    dynamicKeyboard = agatColorsKeyboard;

                } else if (newAddingBalloon.texture_color === 'хром') {
                    fotoLink = imageLinks.chromColorImg;
                    // dynamicKeyboard = chromColorsKeyboard.inline_keyboard;
                    dynamicKeyboard = chromColorsKeyboard;

                } else if (newAddingBalloon.texture_color === 'металик') {
                    fotoLink = imageLinks.metalicColorImg;
                    // dynamicKeyboard = metalicColorsKeyboard.inline_keyboard;
                    dynamicKeyboard = metalicColorsKeyboard;

                } else {
                    fotoLink = imageLinks.pastelColorImg;
                    // dynamicKeyboard = pastelColorsKeyboard.inline_keyboard;
                    dynamicKeyboard = pastelColorsKeyboard;
                }

                bot.sendMessage(
                    chatId,
                    `${fotoLink} Выберите цвет`,
                    {
                        reply_markup: dynamicKeyboard,
                        parse_mode: "HTML",
                    }
                );

                // let fotoLink = '';
                // let dynamicKeyboard;
                //
                // if (newAddingBalloon.texture_color === 'агат') {
                //     fotoLink = imageLinks.agatColorImg;
                //     dynamicKeyboard = agatColorsKeyboard.inline_keyboard;
                //
                // } else if (newAddingBalloon.texture_color === 'хром') {
                //     fotoLink = imageLinks.chromColorImg;
                //     dynamicKeyboard = chromColorsKeyboard.inline_keyboard;
                //
                // } else if (newAddingBalloon.texture_color === 'металик') {
                //     fotoLink = imageLinks.metalicColorImg;
                //     dynamicKeyboard = metalicColorsKeyboard.inline_keyboard;
                //
                // } else {
                //     fotoLink = imageLinks.pastelColorImg;
                //     dynamicKeyboard = pastelColorsKeyboard.inline_keyboard;
                // }
                //
                // bot.editMessageText(
                //     `${fotoLink} Выберите цвет`,
                //     {
                //         chat_id: chatId,
                //         message_id: messageId,
                //         reply_markup: concatButtons(dynamicKeyboard, classicCircleBalloonsKeyboard.inline_keyboard),
                //         parse_mode: "HTML"
                //     });
            } else {
                console.log('miss')
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






