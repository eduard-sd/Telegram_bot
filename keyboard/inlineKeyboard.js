
//кнопочная клавиатура привествия "/start"
function keyboardDefault() {
    return {
        reply_markup: {
            keyboard: [
                [{text: "Шары 🎈"}, {text: "Торты 🎂"}],
                [{text: "Кэшбэк 💰"}, {text: "Корзина 🛒"}],

            ],
            resize_keyboard: true,
            one_time_keyboard: true
        }
    }
}

//"Шары 🎈"
function keyboardBalloons() {
    return {
        reply_markup: {
            inline_keyboard: [
                    [
                        {text: "Каталог и цены", callback_data: "Каталог и цены"},
                        {text: "Стоимость по фото", url: "www.google.com"}
                    ],
                [{text: "Кэшбэк", url: "www.google.com"}, {text: "Корзина", url: "www.google.com"}],
                [{text: "⬅ Назад", url: "www.google.com"}, {text: "ИНФО", url: "www.google.com"}]
            ]
        }
    }
}

//"Каталог и цены"
function priceList() {
    return JSON.stringify({
        inline_keyboard: [
            [{text: "Латексные шары",url: "www.google.com"}, {text: "Фольгированные шары",url: "www.google.com"
            }, {text: "Баблс", url: "www.google.com"}],
            [{text: "Кэшбэк", url: "www.google.com"}, {text: "Корзина", url: "www.google.com"}],
            [{text: "⬅ Назад", callback_data: "Шары 🎈"}, {text: "ИНФО", url: "www.google.com"}]
        ]
    })
}


module.exports.keyboardDefault = keyboardDefault;
module.exports.keyboardBalloons = keyboardBalloons;
module.exports.priceList = priceList;