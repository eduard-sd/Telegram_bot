const questionsAndAnswers = "Вопросы и ответы ❓";
const cart = "Корзина 📦";
const profile = "Личный кабинет 💼";
const goBack = "⬅ Назад";
const balloons = "Шары 🎈";

//кнопочная клавиатура приветствия "/start"
// "Главное меню"
function keyboardDefault() {
    return {
        keyboard: [
            [{text: balloons}, {text: "Торты 🎂"}]
        ],
        resize_keyboard: true,
        one_time_keyboard: true
    }
}
function sendVCard() {
    return {
        reply_markup: {
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
                {text: "Стоимость по фото 🖼️", callback_data: "Стоимость по фото 🖼️"}
            ],
            [{text: questionsAndAnswers, callback_data: questionsAndAnswers}, {text: cart, callback_data: cart}],
            [{text: goBack, callback_data: goBack}, {text: profile, callback_data: profile}]
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
            [{text: questionsAndAnswers, callback_data: questionsAndAnswers}, {text: cart, callback_data: cart}],
            [{text: goBack, callback_data: goBack},{text: profile, callback_data: profile}]
        ]
    }
}

//"Воздушные шары"
function classicBallonsKeyboard() {
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
            [{text: questionsAndAnswers, callback_data: questionsAndAnswers}, {text: cart, callback_data: cart}],
            [{text: goBack, callback_data: goBack},{text: profile, callback_data: profile}]
        ]
    }
}

//"Шаблонные кнопки для каждой вкладки меню"
function classicCircleBallonsKeyboard() {
    return {
        inline_keyboard: [
            [{text: questionsAndAnswers, callback_data: questionsAndAnswers}, {text: cart, callback_data: cart}],
            [{text: goBack, callback_data: goBack},{text: profile, callback_data: profile}]
        ]
    }
}

//"Фольгированые шары, фигуры"
function foilBallonsKeyboard() {
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
            [{text: questionsAndAnswers, callback_data: questionsAndAnswers}, {text: cart, callback_data: cart}],
            [{text: goBack, callback_data: goBack},{text: profile, callback_data: profile}]
        ]
    }
}


//"Стоимость по фото"
function getPriceFromPhotoKeyboard() {
    return {
        inline_keyboard: [
            [{text: questionsAndAnswers, callback_data: questionsAndAnswers}, {text: cart, callback_data: cart}],
            [{text: goBack, callback_data: goBack},{text: profile, callback_data: profile}]
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




module.exports.keyboardDefault = keyboardDefault;
module.exports.sendVCard = sendVCard;
module.exports.keyboardBalloons = balloonsKeyboard;
module.exports.priceListKeyboard = priceListKeyboard;
module.exports.classicBallonsKeyboard = classicBallonsKeyboard;
module.exports.classicCircleBallonsKeyboard = classicCircleBallonsKeyboard;
module.exports.foilBallonsKeyboard = foilBallonsKeyboard;
module.exports.getPriceFromPhotoKeyboard = getPriceFromPhotoKeyboard;
module.exports.faqKeyboard = faqKeyboard;
module.exports.cartKeyboard = cartKeyboard;
module.exports.profileKeyboard = profileKeyboard;
