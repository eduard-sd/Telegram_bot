const TelegramBot = require('node-telegram-bot-api');
const TOKEN = "869793649:AAGBDwsYi_yCpSQ5V7_qvaTUx08pVkOn2GQ";
const bot = new TelegramBot(TOKEN, {polling: true});


//кнопочная клавиатура привествия
bot.onText(/Back/, function (message) {
    var keyboard1 = {
        parse_mode: "Markdown",
        reply_markup: {
            resize_keyboard: true,
            "keyboard": [["Event 1"],["Event 2"]]
        }
    };
    var keyboard2 = {
        parse_mode: "Markdown",
        reply_markup: {
            resize_keyboard: true,
            "keyboard": [["Confirm","Back"]]
        }
    };

    bot.sendMessage(message.chat.id, "Select an event", keyboard1);
    // some code
    bot.sendMessage(message.chat.id, "You selected: ...", keyboard2);
    // some code, but if user click 'Back', onText function are called again, you must stop program here if user click Back, else continue normal execution
});
