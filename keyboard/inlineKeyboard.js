const questionsAndAnswers = "Вопросы ❓";
const cart = "Корзина 📦";
const profile = "Мой кабинет 💼";
const goBack = "⬅ Назад";
const balloons = "Шары 🎈";

//кнопочная клавиатура приветствия "/start"
// "Главное меню"
function keyboardDefault() {
    return {
        keyboard: [
            [{text: balloons}, {text: "Соц сети 👤"}]
        ],
        resize_keyboard: true,
        one_time_keyboard: true
    }
}
function sendVCard() {
    return {
        reply_markup: {
            resize_keyboard: true,
            one_time_keyboard: true,
            keyboard: [
                [{text: "Мой номер телефона",request_contact: true}],
                [{text:"Отмена"}]
            ]
        }
    }
}



//инлайн клавиатуры
//главное меню
//"Шары 🎈"
function balloonsKeyboard() {
    return {
        inline_keyboard: [
            [
                {text: "Каталог и цены 🎁", callback_data: "Каталог и цены 🎁"},
                {text: profile, callback_data: profile}
            ],
            [{text: goBack, callback_data: goBack}, {text: cart, callback_data: cart}]
        ]
    }
}

//"Каталог и цены"
function priceListKeyboard() {
    return {
        inline_keyboard: [
            [
                {text: "Воздушные шары",callback_data: "Воздушные шары"},
                {text: "Фольги-нные шары, фигуры",callback_data: "Фольги-нные шары, фигуры"}
            ],
            [
                {text: "Цена по фото 📸", callback_data: "Цена по фото 📸"}
            ],
            [{text: goBack, callback_data: goBack},{text: cart, callback_data: cart}]
        ]
    }
}

//"Воздушные шары"
function classicBalloonsKeyboard() {
    return {
        inline_keyboard: [
            [
                {text: "Круглые шары",callback_data: "Круглые шары"},
                {text: "Шары для моделирования",callback_data: "Шары для моделирования"}
            ],
            [
                {text: "Сердца",callback_data: "Сердца"},
                {text: "Большие шары",callback_data: "Большие шары"}
            ],
            [
                {text: "Сферы Баблс",callback_data: "Сферы Баблс"},
                {text: "Шары с рисунком",callback_data: "Шары с рисунком"}
            ],
            [{text: goBack, callback_data: goBack}, {text: cart, callback_data: cart}]
        ]
    }
}

//"Шаблонные кнопки для каждой вкладки меню"
function classicCircleBalloonsKeyboard() {
    return {
        inline_keyboard: [
            [{text: goBack, callback_data: goBack}, {text: cart, callback_data: cart}]
        ]
    }
}

//"Фольгированые шары, фигуры"
function foilBalloonsKeyboard() {
    return {
        inline_keyboard: [
            [
                {text: "Фигуры",callback_data: "Фигуры"},
                {text: "Цифры",callback_data: "Цифры"}
            ],
            [
                {text: "Фольга с рисунком",callback_data: "Фольга с рисунком"},
                {text: "Фольга без рисунка",callback_data: "Фольга без рисунка"}
            ],
            [
                {text: "Буквы",callback_data: "Буквы"},
                {text: "Ходилки",callback_data: "Ходилки"}
            ],
            [{text: goBack, callback_data: goBack}, {text: cart, callback_data: cart}]
        ]
    }
}


//"Стоимость по фото"
function getPriceFromPhotoKeyboard() {
    return {
        inline_keyboard: [
            [{text: goBack, callback_data: goBack}, {text: cart, callback_data: cart}]
        ]
    }
}


//"Корзина"
function cartKeyboard() {
    return {
        inline_keyboard: [
            [{text: goBack, callback_data: goBack},{text: "Оформить ✅", callback_data: "Оформить ✅"}]
        ]
    }
}

//"Личный кабинет"
function profileKeyboard() {
    return {
        inline_keyboard: [
            [
                {text: "Мои заказы 📋",callback_data: "Мои заказы 📋"},
                {text: "бонусы Спасибо 💰",callback_data: "бонусы Спасибо 💰"}
            ],
            [
                {text: questionsAndAnswers, callback_data: questionsAndAnswers}
            ],
            [{text: goBack, callback_data: goBack}, {text: cart, callback_data: cart}]
        ]
    }
}

//"Вопросы и ответы"
function faqKeyboard() {
    return {
        inline_keyboard: [
            [
                {text: "Как заказать?",callback_data: "Как заказать?"},
                {text: "Доставка 🚚",callback_data: "Доставка 🚚"}
            ],
            [
                {text: "Адреса",callback_data: "Адреса"},
                {text: "Гарантии 👍",callback_data: "Гарантии 👍"}
            ],
            [{text: goBack, callback_data: goBack},{text: cart, callback_data: cart}]
        ]
    }
}


//"Добавить в корзину"
function addItemInCart() {
    return {
        inline_keyboard: [
            [
                {text: "Добавить в корзину ➕",callback_data: "Добавить в корзину ➕"}
            ],
            [{text: goBack, callback_data: goBack},{text: cart, callback_data: cart}]
        ]
    }
}
//"Выбрать цвет"
function colorsList() {
    return {
        inline_keyboard: [
            [
                {text: "Выбрать цвет 🌈",callback_data: "опрос.выбрать-цвет"}
            ],
            [{text: goBack, callback_data: goBack},{text: cart, callback_data: cart}]
        ]
    }
}
//конструктор кнопок палитры цветов инлайн
function colorsButtons (startNum, endNum) {
    let mainArray = {
        inline_keyboard: []
    };

    let start = startNum;
    let end = endNum + 1;
    let rows = Math.ceil((end - (start)) / 5);
    let x = 0;

    for (let i = 0; i < rows; i++) {
        let temp = [];

        if (i < rows-1) {
            for (let j = x + start; j < 5+x + start; j++) {
                temp.push({text: `${j}`,callback_data: "опрос.цвет."+`${j}`})

            }
            x += 5;
        } else {
            for (let j = x + start; j < end  ; j++) {
                temp.push({text: `${j}`,callback_data: "опрос.цвет."+`${j}`})
            }
        }
        mainArray.inline_keyboard.push(temp);
    }
    return mainArray
}

//конструктор кнопок палитры цветов инлайн
function colorsButtonsDefaultKeyboard (startNum, endNum) {
    let mainArray = {
        keyboard: [],
        resize_keyboard: true,
        one_time_keyboard: true
    };

    let start = startNum;
    let end = endNum + 1;
    let rows = Math.ceil((end - (start)) / 8);
    let x = 0;

    for (let i = 0; i < rows; i++) {
        let temp = [];

        if (i < rows-1) {
            for (let j = x + start; j < 8+x + start; j++) {
                temp.push({text: `${j}`,callback_data: "опрос.цвет."+`${j}`})

            }
            x += 8;
        } else {
            for (let j = x + start; j < end  ; j++) {
                temp.push({text: `${j}`,callback_data: "опрос.цвет."+`${j}`})
            }
        }
        mainArray.keyboard.push(temp);
    }
    return mainArray
}

//"Цвета агат"
function agatColorsKeyboard() {
    // return colorsButtons (1,10);
    return colorsButtonsDefaultKeyboard (1,10);
}
//"Цвета хром"
function chromColorsKeyboard() {
    // return colorsButtons (11,16);
    return colorsButtonsDefaultKeyboard (11,16);
}
//"Цвета металик"
function metalicColorsKeyboard() {
    // return colorsButtons (17,43);
    return colorsButtonsDefaultKeyboard (17,43);
}
//"Цвета пастель (плюс фольга)"
function pastelColorsKeyboard() {
    // return colorsButtons (44,75);
    return colorsButtonsDefaultKeyboard (44,75);
}


module.exports.keyboardDefault = keyboardDefault;
module.exports.sendVCard = sendVCard;
module.exports.keyboardBalloons = balloonsKeyboard;
module.exports.priceListKeyboard = priceListKeyboard;
module.exports.classicBalloonsKeyboard = classicBalloonsKeyboard;
module.exports.classicCircleBalloonsKeyboard = classicCircleBalloonsKeyboard;
module.exports.foilBalloonsKeyboard = foilBalloonsKeyboard;
module.exports.getPriceFromPhotoKeyboard = getPriceFromPhotoKeyboard;
module.exports.faqKeyboard = faqKeyboard;
module.exports.cartKeyboard = cartKeyboard;
module.exports.profileKeyboard = profileKeyboard;
module.exports.addItemInCart = addItemInCart;
module.exports.colorsList = colorsList;
module.exports.agatColorsKeyboard = agatColorsKeyboard;
module.exports.chromColorsKeyboard = chromColorsKeyboard;
module.exports.metalicColorsKeyboard = metalicColorsKeyboard;
module.exports.pastelColorsKeyboard = pastelColorsKeyboard;

