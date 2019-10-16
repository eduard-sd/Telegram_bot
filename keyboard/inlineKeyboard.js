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

//"Шары 🎈"
function balloonsKeyboard() {
    return {
        inline_keyboard: [
            [
                {text: "Каталог и цены 🎁", callback_data: "Каталог и цены 🎁"},
                {text: "Стоимость по фото 🖼️", callback_data: "Стоимость по фото 🖼️"}
            ],
            [{text: questionsAndAnswers, callback_data: questionsAndAnswers}, {text: cart, callback_data: cart}],
            [ {text: profile, callback_data: profile}]
        ]
    }
}

//"Каталог и цены"
function priceListKeyboard() {
    return {
        inline_keyboard: [
            [
                {text: "Латексные шары",callback_data: "Латексные шары"},
                {text: "Фольгированные шары",callback_data: "Фольгированные шары"},
                {text: "Баблс", callback_data: "Баблс"}
            ],
            [{text: questionsAndAnswers, callback_data: questionsAndAnswers}, {text: cart, callback_data: cart}],
            [{text: profile, callback_data: profile}]
        ]
    }
}
//"Каталог и цены"
function getPriceFromPhotoKeyboard() {
    return {
        inline_keyboard: [
            [{text: questionsAndAnswers, callback_data: questionsAndAnswers}, {text: cart, callback_data: cart}],
            [{text: profile, callback_data: profile}]
        ]
    }
}


//"Корзина"
function cartKeyboard() {
    return {
        inline_keyboard: [
            [{text: "Оформить ✅", callback_data: "Оформить ✅"}]
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
            [ {text: cart, callback_data: cart}]
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
            [{text: cart, callback_data: cart}]
        ]
    }
}




module.exports.keyboardDefault = keyboardDefault;
module.exports.keyboardBalloons = balloonsKeyboard;
module.exports.priceListKeyboard = priceListKeyboard;
module.exports.getPriceFromPhotoKeyboard = getPriceFromPhotoKeyboard;
module.exports.faqKeyboard = faqKeyboard;
module.exports.cartKeyboard = cartKeyboard;
module.exports.profileKeyboard = profileKeyboard;
