const TelegramBot = require('node-telegram-bot-api');

const TOKEN = "869793649:AAFpPGkJ1Q7XUMmENONXuzQPmPgktGb7C9A";


const bot = new TelegramBot(TOKEN, {polling: true});

bot.on("message",msg=>{
   bot.sendMessage(msg.chat.id,`Вас привествует бот ШАРОЛАНДИИ, бот говорит:${msg.from.first_name}`);
});

