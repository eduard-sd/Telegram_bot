const cashBack = "Кэшбэк 💰";
const cart = "Корзина 🛒";
const info = "ИНФО";
const goBack = "⬅ Назад";
const balloons = "Шары 🎈";

//кнопочная клавиатура приветствия "/start"
// "Главное меню"
function keyboardDefault() {
    return {
        keyboard: [
            [{text: balloons}, {text: "Торты 🎂"}],
            [{text: cashBack}, {text: cart}],
        ],
        resize_keyboard: true,
        one_time_keyboard: true
    }
}

//"Шары 🎈"
function keyboardBalloons() {
    return {
        inline_keyboard: [
            [
                {text: "Каталог и цены", callback_data: "Каталог и цены"},
                {text: "Стоимость по фото", callback_data: "Стоимость по фото"}
            ],
            [{text: cashBack, callback_data: cashBack}, {text: cart, callback_data: cart}],
            [{text: goBack, callback_data: "Главное меню"}, {text: info, callback_data: info}]
        ]
    }
}

//"Каталог и цены"
function priceList() {
    return {
        inline_keyboard: [
            [
                {text: "Латексные шары",callback_data: "Латексные шары"},
                {text: "Фольгированные шары",callback_data: "Фольгированные шары"},
                {text: "Баблс", callback_data: "Баблс"}
            ],
            [{text: cashBack, callback_data: cashBack}, {text: cart, callback_data: cart}],
            [{text: goBack, callback_data: balloons}, {text: info, callback_data: info}]
        ]
    }
}


module.exports.keyboardDefault = keyboardDefault;
module.exports.keyboardBalloons = keyboardBalloons;
module.exports.priceList = priceList;