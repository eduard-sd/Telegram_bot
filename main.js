import TelegramBot from 'node-telegram-bot-api'
import config from 'config'

const TOKEN = config.get('token');

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(TOKEN, {polling: true});

bot.on('message', (msg) => {
   const chatId = msg.chat.id;

   // send a message to the chat acknowledging receipt of their message
   bot.sendMessage(chatId, 'Received your message');
});