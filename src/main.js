const TelegramBot = require('node-telegram-bot-api');
const TOKEN = "869793649:AAFpPGkJ1Q7XUMmENONXuzQPmPgktGb7C9A";
const bot = new TelegramBot(TOKEN);

// const inlineKeyboardMarkup = new InlineKeyboardMarkup();

//
// bot.onText(/\/start/, function (msg) {
//
//     let startMessage = 'Приветствие';
//     let keyboard = {
//         reply_markup: {
//             inline_keyboard: [
//         {
//            text: 'Google',
//            url: 'http://google.com'
//         },
//         {
//            text: 'Ysndex',
//            url: 'http://yandex.ru'
//         }
//         ]
//         }
//     };
//     bot.sendMessage(msg.chat.id,startMessage, keyboard);
// });


// bot.on("message",msg => {
//    bot.sendMessage(msg.chat.id,`Вас привествует бот ШАРОЛАНДИИ, бот говорит: ${msg.from.first_name}`);
//
// });

bot.on("message",msg => {
    let startMessage = 'Приветствие';
    let keyboard = {
        reply_markup: {
            inline_keyboard: [
                {
                    text: 'Google',
                    url: 'http://google.com'
                },
                {
                    text: 'Ysndex',
                    url: 'http://yandex.ru'
                }
            ]
        }
    };
    bot.sendMessage(msg.chat.id,startMessage, keyboard);
});


// Фронт:
//
// приветсвие  = выбор города
// цены        = витрина фотографии шариков из БД (кнопка назад кнопка добавить в корзину
// конструктор = шарика
// сроки       = исполнения передача в производство
// корзина     = список товаров с ценами и количеством + номер заказа + номер контакта + имя
// оплата      = 30%
//
//     Бэк:
//
// таблица товаров =  id-товара название размер фото
// таблица заказов = id-заказа дата-заказа id-шара количество цвет коментарий имя-клиента телефон
// таблица архив = id-заказа исполено-ли
//ssh 12345


